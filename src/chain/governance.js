/**
 * Reads AND writes against the `tribe-voter-weight` addin (locked shares,
 * delegation, analyst registry) and, for the single-account reads/writes the
 * FE needs, real spl-governance (`TokenOwnerRecord`, `Proposal`, `Governance`).
 *
 * Reads (below) stay graceful: a missing account, a bad RPC, or an
 * unpopulated `config.json` (see `config.json`/`config.example.json`) all
 * return the same "no power" default — never a fabricated number, matching
 * `vault.js`'s zero-on-failure principle. `makeReadProgram` builds an Anchor
 * `Program` against a signer-less wallet so it is safe to call before a
 * Phantom connection even exists.
 *
 * Writes (further below) are the opposite of graceful ON PURPOSE: every write
 * is user-signed via Phantom (`makeWriteProgram`/`anchorWalletFrom`, mirroring
 * `vault.js`'s `deposit()`), and a failure — a missing account, a bad RPC, a
 * rejected instruction — throws with a message the wallet hook (`wallet.js`,
 * Phase 06) surfaces, never a silently-swallowed no-op.
 *
 * **Same-tx bundling invariant (do not break this)**: `createProposal`,
 * `castVote`, and `createGovernance` each build `update_voter_weight_record`
 * FIRST and place it in the SAME `Transaction` as the spl-governance
 * instruction(s) it backs, built immediately before `provider.signTransaction`.
 * Splitting them into two sent transactions is a correctness bug, not a style
 * choice — proven by `governance-e2e.ts`'s negative-path test (a stale
 * VoterWeightRecord replayed in a later transaction is rejected by real
 * spl-governance, see that file's final `it(...)` block).
 */
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  PACKET_DATA_SIZE,
} from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  getTokenOwnerRecordForRealm,
  getGovernance,
  withCreateTokenOwnerRecord,
  withCreateProposal,
  withCastVote,
  withCreateGovernance,
  PROGRAM_VERSION,
  VoteType,
  Vote,
  YesNoVote,
} from "@solana/spl-governance";
import idl from "./tribe_voter_weight.json";

// Local config.json is gitignored (it points at a private cluster/realm). Use
// it if present, otherwise fall back to the committed example so a fresh
// clone still builds. `import.meta.glob` is resolved at build time by Vite.
const configs = import.meta.glob("./config.json", { eager: true });
const examples = import.meta.glob("./config.example.json", { eager: true });
const config = (
  Object.values(configs)[0] ?? Object.values(examples)[0]
).default;

export const CONFIG = config;

/**
 * SPL Governance's own program id. Fixed across every deployment/realm — not
 * a per-cluster value like `config.tribeVoterWeightProgram` — so it is a
 * hardcoded constant here rather than a config key (plan decision #5).
 */
export const splGovernanceProgramId = new PublicKey(
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
);

/** A read-only connection to the configured cluster. */
export function getConnection() {
  return new Connection(config.rpc, "confirmed");
}

/**
 * A signer-less Anchor wallet. Only `.account.X.fetch()` calls run against
 * programs built with it — both signing methods reject, so a write path
 * accidentally reusing this wallet fails loudly instead of silently no-oping.
 */
function readonlyWallet() {
  return {
    publicKey: PublicKey.default,
    signTransaction: () =>
      Promise.reject(new Error("readonlyWallet cannot sign transactions")),
    signAllTransactions: () =>
      Promise.reject(new Error("readonlyWallet cannot sign transactions")),
  };
}

function makeReadProgram(connection) {
  const provider = new AnchorProvider(connection, readonlyWallet(), {
    commitment: "confirmed",
  });
  return new Program(idl, provider);
}

function realmAddress() {
  return new PublicKey(config.realm);
}

function governingTokenMintAddress() {
  return new PublicKey(config.governingTokenMint);
}

/**
 * Convert an on-chain `BN` (u64/i64) to a JS `Number`, guarding the u64
 * amounts (locked shares, voter weight) that can in principle exceed
 * `Number.MAX_SAFE_INTEGER` — `BN.toNumber()` throws past 2^53, so a naive
 * conversion would crash a read instead of degrading gracefully. Falls back
 * to a possibly-imprecise `Number(bn.toString())` rather than throwing;
 * still never fabricates a value, it only loses precision on numbers far
 * beyond anything Tribe's share supply reaches today.
 */
function bnToSafeNumber(bn) {
  if (bn === null || bn === undefined) return 0;
  try {
    return bn.toNumber();
  } catch {
    return Number(bn.toString());
  }
}

// ---------------------------------------------------------------------------
// PDA helpers — shared with the write-side (a later change). Seeds verified
// against `tribe-governance/programs/tribe-voter-weight/src/lib.rs`'s IDL
// constants and hand-matched against `tribe-governance/tests/governance-e2e.ts`'s
// own derivation helpers (see the phase-02 implementation report for the
// fixture comparison — no live realm exists to test against, decision #1).
// ---------------------------------------------------------------------------

/** `["registrar", realm]` — one per realm. */
export function registrarPda(realm, programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("registrar"), new PublicKey(realm).toBuffer()],
    new PublicKey(programId),
  )[0];
}

/** `["max_voter_weight_record", realm, mint]` — one per (realm, mint). */
export function maxVoterWeightRecordPda(realm, mint, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("max_voter_weight_record"),
      new PublicKey(realm).toBuffer(),
      new PublicKey(mint).toBuffer(),
    ],
    new PublicKey(programId),
  )[0];
}

/** `["voter_weight_record", realm, mint, owner]` — one per (realm, mint, owner). */
export function voterWeightRecordPda(realm, mint, owner, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("voter_weight_record"),
      new PublicKey(realm).toBuffer(),
      new PublicKey(mint).toBuffer(),
      new PublicKey(owner).toBuffer(),
    ],
    new PublicKey(programId),
  )[0];
}

/** `["locker", registrar, owner]` — one per (registrar, member). */
export function lockerPda(registrar, owner, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("locker"),
      new PublicKey(registrar).toBuffer(),
      new PublicKey(owner).toBuffer(),
    ],
    new PublicKey(programId),
  )[0];
}

/** `["locker_escrow", locker]` — the token account holding a locker's shares. */
export function lockerEscrowPda(locker, programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("locker_escrow"), new PublicKey(locker).toBuffer()],
    new PublicKey(programId),
  )[0];
}

/** `["analyst_record", registrar, analyst]` — one per registered analyst. */
export function analystRecordPda(registrar, analyst, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("analyst_record"),
      new PublicKey(registrar).toBuffer(),
      new PublicKey(analyst).toBuffer(),
    ],
    new PublicKey(programId),
  )[0];
}

// ---------------------------------------------------------------------------
// Read functions — all graceful: return null/zeroed defaults on a missing
// account or failed RPC, never fabricate voting power.
// ---------------------------------------------------------------------------

/** Read the realm's Registrar, or `null` if it has not been created yet. */
export async function fetchRegistrar() {
  try {
    const connection = getConnection();
    const program = makeReadProgram(connection);
    const pda = registrarPda(realmAddress(), program.programId);
    const registrar = await program.account.registrar.fetch(pda);
    return {
      realm: registrar.realm.toBase58(),
      governingTokenMint: registrar.governingTokenMint.toBase58(),
      realmAuthority: registrar.realmAuthority.toBase58(),
      unlockWaitSeconds: bnToSafeNumber(registrar.unlockWaitSeconds),
      analystStakeLamports: bnToSafeNumber(registrar.analystStakeLamports),
    };
  } catch {
    return null;
  }
}

/**
 * Read `address`'s Locker (lock status): amount locked, amount mid-unlock,
 * the timestamp the pending amount becomes withdrawable at, and who
 * currently receives voting credit. Zeroed defaults if no Locker exists yet
 * (a member who has never locked) or the RPC read fails.
 */
export async function fetchLocker(address) {
  const zero = {
    amountLocked: 0,
    pendingUnlock: 0,
    unlockAvailableAt: 0,
    delegate: null,
  };
  if (!address) return zero;
  try {
    const connection = getConnection();
    const program = makeReadProgram(connection);
    const registrar = registrarPda(realmAddress(), program.programId);
    const pda = lockerPda(registrar, new PublicKey(address), program.programId);
    const locker = await program.account.locker.fetch(pda);
    return {
      amountLocked: bnToSafeNumber(locker.amountLocked),
      pendingUnlock: bnToSafeNumber(locker.pendingUnlockAmount),
      unlockAvailableAt: bnToSafeNumber(locker.unlockAvailableAt),
      delegate: locker.delegate.toBase58(),
    };
  } catch {
    return zero;
  }
}

/**
 * Read `address`'s VoterWeightRecord. **Note**: `voterWeight` is the running
 * total of locked+delegated shares (a share count), not this app's NAV-based
 * mock voting power — see `state.rs`'s `VoterWeightRecord` doc comment.
 * Zeroed defaults if no record exists yet or the RPC read fails.
 */
export async function fetchVoterWeightRecord(address) {
  const zero = { voterWeight: 0, expiry: null, action: null, target: null };
  if (!address) return zero;
  try {
    const connection = getConnection();
    const program = makeReadProgram(connection);
    const pda = voterWeightRecordPda(
      realmAddress(),
      governingTokenMintAddress(),
      new PublicKey(address),
      program.programId,
    );
    const record = await program.account.voterWeightRecord.fetch(pda);
    return {
      voterWeight: bnToSafeNumber(record.voterWeight),
      expiry:
        record.voterWeightExpiry !== null
          ? bnToSafeNumber(record.voterWeightExpiry)
          : null,
      action: record.weightAction ? Object.keys(record.weightAction)[0] : null,
      target: record.weightActionTarget
        ? record.weightActionTarget.toBase58()
        : null,
    };
  } catch {
    return zero;
  }
}

/**
 * Read the realm's MaxVoterWeightRecord — the quorum denominator (running
 * total of every VoterWeightRecord's weight). Zero if not created yet or the
 * RPC read fails.
 */
export async function fetchMaxVoterWeightRecord() {
  const zero = { maxVoterWeight: 0 };
  try {
    const connection = getConnection();
    const program = makeReadProgram(connection);
    const pda = maxVoterWeightRecordPda(
      realmAddress(),
      governingTokenMintAddress(),
      program.programId,
    );
    const record = await program.account.maxVoterWeightRecord.fetch(pda);
    return { maxVoterWeight: bnToSafeNumber(record.maxVoterWeight) };
  } catch {
    return zero;
  }
}

/**
 * Read `analystAddress`'s AnalystRecord — stake + registration time only, no
 * performance data (that is derived from ProposalV2 by the backend, plan
 * decision #10). `null` if not registered or the RPC read fails.
 */
export async function fetchAnalystRecord(analystAddress) {
  if (!analystAddress) return null;
  try {
    const connection = getConnection();
    const program = makeReadProgram(connection);
    const registrar = registrarPda(realmAddress(), program.programId);
    const pda = analystRecordPda(
      registrar,
      new PublicKey(analystAddress),
      program.programId,
    );
    const record = await program.account.analystRecord.fetch(pda);
    return {
      stakeLamports: bnToSafeNumber(record.stakeLamports),
      registeredAt: bnToSafeNumber(record.registeredAt),
    };
  } catch {
    return null;
  }
}

/**
 * Read `address`'s spl-governance TokenOwnerRecord (its OWN membership
 * record, separate from our VoterWeightRecord) — needed by the write side to
 * know whether `withCreateTokenOwnerRecord` must run before a vote/proposal.
 * `null` if it does not exist yet or the RPC read fails.
 */
export async function fetchTokenOwnerRecord(address) {
  if (!address) return null;
  try {
    const connection = getConnection();
    const { pubkey, account } = await getTokenOwnerRecordForRealm(
      connection,
      splGovernanceProgramId,
      realmAddress(),
      governingTokenMintAddress(),
      new PublicKey(address),
    );
    return {
      address: pubkey.toBase58(),
      governingTokenDepositAmount: bnToSafeNumber(
        account.governingTokenDepositAmount,
      ),
      unrelinquishedVotesCount: account.unrelinquishedVotesCount,
      totalVotesCount: account.totalVotesCount,
      outstandingProposalCount: account.outstandingProposalCount,
      governanceDelegate: account.governanceDelegate
        ? account.governanceDelegate.toBase58()
        : null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Write functions — every one is user-signed via Phantom and FAILS LOUD: a
// missing prerequisite account, a bad RPC, or a rejected instruction throws
// with a clear message rather than degrading to a default, unlike the reads
// above. Standalone writes send one instruction; the three bundled writes
// (createProposal/castVote/createGovernance) place `update_voter_weight_record`
// FIRST in the same legacy `Transaction` as the spl-governance instruction(s)
// it backs — see this file's header doc comment for why that ordering is
// load-bearing, not stylistic.
// ---------------------------------------------------------------------------

function governanceAddress() {
  return new PublicKey(config.governance);
}

/** Fail loud on the two inputs every write needs: a signer and a wallet. */
function requireWriteInputs(provider, address) {
  if (!provider || typeof provider.signTransaction !== "function") {
    throw new Error(
      "A connected Phantom provider is required to sign this transaction.",
    );
  }
  if (!address) {
    throw new Error("A wallet address is required.");
  }
}

/**
 * Wrap the Phantom provider as an Anchor wallet — same shape as
 * `vault.js`'s `anchorWalletFrom`. Anchor needs `publicKey`, `signTransaction`,
 * and `signAllTransactions`.
 */
function anchorWalletFrom(provider, publicKey) {
  return {
    publicKey,
    signTransaction: (tx) => provider.signTransaction(tx),
    signAllTransactions: (txs) => provider.signAllTransactions(txs),
  };
}

function makeWriteProgram(connection, wallet) {
  const anchorProvider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl, anchorProvider);
}

/**
 * Fetch a fresh blockhash, sign, send, and confirm a legacy `Transaction`.
 * Called last in every write — the blockhash is always fetched immediately
 * before `provider.signTransaction`, never cached across a Phantom approval
 * delay (researcher-01 §4).
 */
async function signSendConfirm(connection, provider, tx, feePayer) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = feePayer;
  const signed = await provider.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return sig;
}

/**
 * Prepend a `create_voter_weight_record` instruction if `owner` doesn't have
 * one yet. `update_voter_weight_record` has no `init` path — the record must
 * already exist for Anchor to deserialize it — so every bundled action that
 * touches it needs this check. Plan decision #11 (auto-trigger transparently):
 * the FE never assumes a separate explicit "set up" step ran first.
 */
async function ensureVoterWeightRecordIx({
  program,
  connection,
  owner,
  registrar,
  voterWeightRecord,
}) {
  if (await connection.getAccountInfo(voterWeightRecord)) return [];
  return [
    await program.methods
      .createVoterWeightRecord()
      .accounts({
        owner,
        registrar,
        voterWeightRecord,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
  ];
}

/**
 * Prepend a `withCreateTokenOwnerRecord` instruction if `owner` doesn't have
 * spl-governance's own TokenOwnerRecord yet (separate from our
 * VoterWeightRecord — see `fetchTokenOwnerRecord`'s doc comment). One-time
 * per user; plan decision #11 folds it into whichever action needs it first
 * instead of requiring a prior explicit call.
 */
async function ensureTokenOwnerRecordIxs(owner, mint, payer) {
  const existing = await fetchTokenOwnerRecord(owner.toBase58());
  if (existing) {
    return { ixs: [], tokenOwnerRecord: new PublicKey(existing.address) };
  }
  const ixs = [];
  const tokenOwnerRecord = await withCreateTokenOwnerRecord(
    ixs,
    splGovernanceProgramId,
    PROGRAM_VERSION,
    realmAddress(),
    owner,
    mint,
    payer,
  );
  return { ixs, tokenOwnerRecord };
}

/**
 * One per (registrar, member). Self-delegates by default (`lib.rs`'s
 * `create_locker`) — no separate delegate-setup step.
 */
export async function createLocker({ provider, address }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const shareMint = governingTokenMintAddress();
  const locker = lockerPda(registrar, owner, program.programId);
  const escrow = lockerEscrowPda(locker, program.programId);

  const ix = await program.methods
    .createLocker()
    .accounts({
      owner,
      registrar,
      locker,
      shareMint,
      escrow,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Every member who can RECEIVE delegation (including self-delegation) needs
 * one of these before shares can be locked to them (`lib.rs`'s doc comment on
 * `create_voter_weight_record`).
 */
export async function createVoterWeightRecord({ provider, address }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const shareMint = governingTokenMintAddress();
  const voterWeightRecord = voterWeightRecordPda(
    realmAddress(),
    shareMint,
    owner,
    program.programId,
  );

  const ix = await program.methods
    .createVoterWeightRecord()
    .accounts({
      owner,
      registrar,
      voterWeightRecord,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Lock `amount` (raw base units of the governing token, not a UI-scaled
 * number — this file has no opinion on share-mint decimals, that's Phase 06's
 * concern) into escrow. Voting power accrues to the locker's delegate
 * immediately.
 *
 * Plan decision #11 (first-time setup, auto-trigger transparently): if this
 * is the caller's first lock, their Locker and/or VoterWeightRecord don't
 * exist yet — this bundles their creation ahead of `lock_shares` in the SAME
 * transaction, mirroring `vault.js`'s auto-create-ATA-if-missing pattern
 * (`vault.js:143-152`).
 */
export async function lockShares({ provider, address, amount }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const shareMint = governingTokenMintAddress();
  const locker = lockerPda(registrar, owner, program.programId);
  const escrow = lockerEscrowPda(locker, program.programId);

  const preIxs = [];
  const lockerInfo = await connection.getAccountInfo(locker);
  if (!lockerInfo) {
    preIxs.push(
      await program.methods
        .createLocker()
        .accounts({
          owner,
          registrar,
          locker,
          shareMint,
          escrow,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction(),
    );
  }

  // A brand-new Locker self-delegates (see `create_locker`), so the delegate
  // is always `owner` in that case. An existing Locker may have been
  // re-delegated via `set_delegate`, so read it to find the CURRENT delegate.
  let delegate = owner;
  if (lockerInfo) {
    const lockerAccount = await program.account.locker.fetch(locker);
    delegate = lockerAccount.delegate;
  }
  const delegateVwr = voterWeightRecordPda(
    realmAddress(),
    shareMint,
    delegate,
    program.programId,
  );
  if (!(await connection.getAccountInfo(delegateVwr))) {
    // Only auto-create when the delegate IS the caller (self-delegation) —
    // this instruction is signed by `owner` alone, so it cannot create a
    // record on a different delegate's behalf.
    if (!delegate.equals(owner)) {
      throw new Error(
        "This locker's delegate does not have a VoterWeightRecord yet; the " +
          "delegate must create one before shares can be locked to them.",
      );
    }
    preIxs.push(
      ...(await ensureVoterWeightRecordIx({
        program,
        connection,
        owner,
        registrar,
        voterWeightRecord: delegateVwr,
      })),
    );
  }

  const maxVwr = maxVoterWeightRecordPda(
    realmAddress(),
    shareMint,
    program.programId,
  );
  const ownerTokenAccount = getAssociatedTokenAddressSync(shareMint, owner);

  const lockIx = await program.methods
    .lockShares(new BN(amount))
    .accounts({
      owner,
      registrar,
      locker,
      shareMint,
      ownerTokenAccount,
      escrow,
      delegateVwr,
      maxVwr,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const tx = new Transaction().add(...preIxs, lockIx);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Start the two-stage unlock: voting power is removed immediately, the
 * shares themselves become withdrawable only after the registrar's
 * `unlock_wait_seconds`. Requires an existing Locker — nothing to auto-create
 * here (unlike lock/vote/propose), since a member who never locked has
 * nothing to unlock.
 */
export async function requestUnlock({ provider, address, amount }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const locker = lockerPda(registrar, owner, program.programId);

  const lockerAccount = await program.account.locker
    .fetch(locker)
    .catch(() => null);
  if (!lockerAccount) {
    throw new Error(
      "No Locker found for this wallet — lock shares before requesting an unlock.",
    );
  }

  const shareMint = governingTokenMintAddress();
  const delegateVwr = voterWeightRecordPda(
    realmAddress(),
    shareMint,
    lockerAccount.delegate,
    program.programId,
  );
  const maxVwr = maxVoterWeightRecordPda(
    realmAddress(),
    shareMint,
    program.programId,
  );

  const ix = await program.methods
    .requestUnlock(new BN(amount))
    .accounts({ owner, registrar, locker, delegateVwr, maxVwr })
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Cancel part or all of a still-pending unlock: no token movement, voting
 * power restored immediately. Requires an existing Locker with a pending
 * unlock (enforced on-chain; this function only checks the Locker exists).
 */
export async function cancelUnlock({ provider, address, amount }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const locker = lockerPda(registrar, owner, program.programId);

  const lockerAccount = await program.account.locker
    .fetch(locker)
    .catch(() => null);
  if (!lockerAccount) {
    throw new Error(
      "No Locker found for this wallet — nothing pending to cancel.",
    );
  }

  const shareMint = governingTokenMintAddress();
  const delegateVwr = voterWeightRecordPda(
    realmAddress(),
    shareMint,
    lockerAccount.delegate,
    program.programId,
  );
  const maxVwr = maxVoterWeightRecordPda(
    realmAddress(),
    shareMint,
    program.programId,
  );

  const ix = await program.methods
    .cancelUnlock(new BN(amount))
    .accounts({ owner, locker, registrar, delegateVwr, maxVwr })
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Release the pending amount to the owner once `unlock_available_at` has
 * elapsed (enforced on-chain). The owner's share ATA must already exist —
 * anyone reaching this point once held shares to lock in the first place.
 */
export async function withdrawUnlocked({ provider, address }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const locker = lockerPda(registrar, owner, program.programId);
  const escrow = lockerEscrowPda(locker, program.programId);
  const shareMint = governingTokenMintAddress();
  const ownerTokenAccount = getAssociatedTokenAddressSync(shareMint, owner);

  const ix = await program.methods
    .withdrawUnlocked()
    .accounts({
      owner,
      registrar,
      locker,
      shareMint,
      escrow,
      ownerTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Move a locker's realized weight from its current delegate to `newDelegate`.
 * The new delegate must already have a VoterWeightRecord (enforced on-chain —
 * `lib.rs`'s `SetDelegate` accounts doc comment); this function does not
 * create one, since it can only sign as `owner`, not as the new delegate.
 *
 * Note: this has NO on-chain time-gate (unlike the real 7-day unlock
 * timelock) — delegation changes take effect immediately (plan decision #12).
 */
export async function setDelegate({ provider, address, newDelegate }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const locker = lockerPda(registrar, owner, program.programId);

  const lockerAccount = await program.account.locker
    .fetch(locker)
    .catch(() => null);
  if (!lockerAccount) {
    throw new Error(
      "No Locker found for this wallet — lock shares before delegating.",
    );
  }

  const shareMint = governingTokenMintAddress();
  const newDelegateKey = new PublicKey(newDelegate);
  const oldDelegateVwr = voterWeightRecordPda(
    realmAddress(),
    shareMint,
    lockerAccount.delegate,
    program.programId,
  );
  const newDelegateVwr = voterWeightRecordPda(
    realmAddress(),
    shareMint,
    newDelegateKey,
    program.programId,
  );
  const maxVwr = maxVoterWeightRecordPda(
    realmAddress(),
    shareMint,
    program.programId,
  );

  const ix = await program.methods
    .setDelegate(newDelegateKey)
    .accounts({ owner, registrar, locker, oldDelegateVwr, newDelegateVwr, maxVwr })
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Open to anyone, backed by a refundable stake (`lib.rs`'s doc comment on
 * `register_analyst`) — the real CreateProposal gate is the >=1% active-power
 * check in `update_voter_weight_record`, not registry membership alone.
 */
export async function registerAnalyst({ provider, address }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const analyst = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, analyst);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const analystRecord = analystRecordPda(registrar, analyst, program.programId);

  const ix = await program.methods
    .registerAnalyst()
    .accounts({
      analyst,
      registrar,
      analystRecord,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, analyst);
}

/**
 * Refund the stake and close the record, unless the analyst is the proposer
 * of a still-live proposal (`lib.rs`'s `deregister_analyst` doc comment).
 *
 * `livePairs` — optional `{ proposal, tokenOwnerRecord }` pairs for the
 * on-chain live-proposal guard, passed through as `remainingAccounts`. Per
 * `analyst.rs`'s own doc comment this is a trust boundary the program accepts
 * rather than closes: the guard only inspects pairs the caller supplies, so
 * an empty/incomplete list (the default) does not itself violate anything —
 * closing that gap is the calling UI's responsibility, not this function's.
 */
export async function deregisterAnalyst({ provider, address, livePairs = [] }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const analyst = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, analyst);
  const program = makeWriteProgram(connection, wallet);
  const registrar = registrarPda(realmAddress(), program.programId);
  const analystRecord = analystRecordPda(registrar, analyst, program.programId);

  const remainingAccounts = livePairs.flatMap(({ proposal, tokenOwnerRecord }) => [
    { pubkey: new PublicKey(proposal), isWritable: false, isSigner: false },
    { pubkey: new PublicKey(tokenOwnerRecord), isWritable: false, isSigner: false },
  ]);

  const ix = await program.methods
    .deregisterAnalyst()
    .accounts({ analyst, registrar, analystRecord })
    .remainingAccounts(remainingAccounts)
    .instruction();

  const tx = new Transaction().add(ix);
  return signSendConfirm(connection, provider, tx, analyst);
}

/**
 * spl-governance's OWN membership record (separate from our
 * VoterWeightRecord — see `fetchTokenOwnerRecord`'s doc comment). One-time
 * per user, standalone — no bundle, since it doesn't touch voter weight.
 */
export async function createTokenOwnerRecord({ provider, address }) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);

  const ixs = [];
  await withCreateTokenOwnerRecord(
    ixs,
    splGovernanceProgramId,
    PROGRAM_VERSION,
    realmAddress(),
    owner,
    governingTokenMintAddress(),
    owner,
  );

  const tx = new Transaction().add(...ixs);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * The `descriptionLink` JSON schema encoded below, promoted to `plan.md` by
 * Phase 04's code review (Medium-1) so both sides stay byte-for-byte in
 * lockstep. Phase 04's `tribe-api/src/governance.ts` `decodeMetadata`
 * requires exactly `kind`/`token`/`thesis` as strings and `amountUsd` as a
 * number; any other shape (or non-JSON `descriptionLink`) decodes to
 * `metadata: null` with a raw `name`+`descriptionLink` fallback — so this
 * encoder must not add/rename/reorder fields relative to that shape:
 *
 * ```json
 * {
 *   "kind": "string — trade action, e.g. \"buy\" | \"sell\" | \"rebalance\"",
 *   "token": "string — symbol or mint of the asset concerned",
 *   "amountUsd": "number — proposed USD notional",
 *   "thesis": "string — short rationale, MUST fit in the same transaction",
 *   "thesisRef": "string, OPTIONAL — URL/IPFS pointer to a fuller writeup"
 * }
 * ```
 */
/**
 * Validates the CALLER-supplied metadata once, before any encoding or
 * truncation happens — this file's write functions fail loud on purpose (see
 * header doc comment), and a malformed metadata blob is exactly the kind of
 * silent failure that contract exists to prevent: the write would still
 * confirm on-chain, but Phase 04's `decodeMetadata` does strict `typeof`
 * checks and would decode it to `metadata: null` forever, with no on-chain
 * error to signal the mistake. Deliberately separate from
 * `encodeProposalMetadata` below: that function is also called mid-loop with
 * a `thesis` progressively truncated down to `""`, which is expected and
 * must NOT re-trigger a "non-empty" failure.
 */
function validateProposalMetadata({ kind, token, amountUsd, thesis }) {
  if (typeof kind !== "string" || !kind.trim()) {
    throw new Error("Proposal `kind` is required and must be a non-empty string.");
  }
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Proposal `token` is required and must be a non-empty string.");
  }
  if (typeof thesis !== "string" || !thesis.trim()) {
    throw new Error("Proposal `thesis` is required and must be a non-empty string.");
  }
  if (typeof amountUsd !== "number" || !Number.isFinite(amountUsd)) {
    throw new Error("Proposal `amountUsd` is required and must be a finite number.");
  }
}

function encodeProposalMetadata({ kind, token, amountUsd, thesis, thesisRef }) {
  const metadata = { kind, token, amountUsd, thesis };
  if (thesisRef) metadata.thesisRef = thesisRef;
  return JSON.stringify(metadata);
}

/** Build the update+createProposal instruction pair for a given descriptionLink. */
async function buildCreateProposalIxs({
  program,
  owner,
  registrar,
  voterWeightRecord,
  maxVwr,
  analystRecord,
  realm,
  governance,
  tokenOwnerRecord,
  shareMint,
  proposalIndex,
  name,
  descriptionLink,
}) {
  // Same-tx bundling (load-bearing, see file header): this update ix is built
  // fresh on every call — including every retry inside createProposal's
  // truncation loop below — and only the LAST one built is ever signed.
  const updateIx = await program.methods
    .updateVoterWeightRecord({ createProposal: {} }, null)
    .accounts({
      owner,
      registrar,
      voterWeightRecord,
      maxVwr,
      analystRecord,
    })
    .instruction();

  const createIxs = [];
  const proposalPda = await withCreateProposal(
    createIxs,
    splGovernanceProgramId,
    PROGRAM_VERSION,
    realm,
    governance,
    tokenOwnerRecord,
    name,
    descriptionLink,
    shareMint,
    owner,
    proposalIndex,
    VoteType.SINGLE_CHOICE,
    ["Approve"],
    true,
    owner,
    voterWeightRecord,
  );

  return { updateIx, createIxs, proposalPda };
}

/**
 * Create a proposal gated by tribe-voter-weight's analyst/threshold check.
 * Bundles (in ONE transaction, update ix first): auto-created
 * VoterWeightRecord/TokenOwnerRecord if this is the caller's first proposal
 * (plan decision #11), `update_voter_weight_record({createProposal}, null)`
 * with the caller's `analystRecord` PDA (NOT null — CreateProposal is the one
 * action that requires it), and spl-governance's `withCreateProposal`.
 *
 * `kind`/`token`/`amountUsd`/`thesis`/`thesisRef` are JSON-encoded into
 * spl-governance's `descriptionLink` (plan decision #9/#10 — see
 * `encodeProposalMetadata`'s doc comment for the exact schema). If the full
 * encoded blob would not fit in the SAME transaction as the bundled update
 * ix and every other required account, `thesis` is truncated and `thesisRef`
 * is required to point at the fuller text — this function never silently
 * cuts `thesis` without a `thesisRef` to fall back on; it throws instead.
 *
 * `proposalIndex` is always read live from the Governance account
 * (`getGovernance(...).account.proposalCount`), never hardcoded/caller-
 * supplied, since a stale index would collide with a proposal created since
 * the caller last checked.
 *
 * `votingDays` is accepted for call-shape parity with the phase spec but not
 * used: spl-governance's CreateProposal instruction has no per-proposal
 * voting-window parameter — the window is fixed by the Governance account's
 * own `config.baseVotingTime`, set once at `createGovernance` time.
 */
export async function createProposal({
  provider,
  address,
  kind,
  token,
  amountUsd,
  thesis,
  thesisRef,
  votingDays: _votingDays,
  name,
} = {}) {
  requireWriteInputs(provider, address);
  validateProposalMetadata({ kind, token, amountUsd, thesis });
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const realm = realmAddress();
  const shareMint = governingTokenMintAddress();
  const registrar = registrarPda(realm, program.programId);
  const governance = governanceAddress();
  const voterWeightRecord = voterWeightRecordPda(
    realm,
    shareMint,
    owner,
    program.programId,
  );
  const maxVwr = maxVoterWeightRecordPda(realm, shareMint, program.programId);
  const analystRecord = analystRecordPda(registrar, owner, program.programId);

  const preIxs = [
    ...(await ensureVoterWeightRecordIx({
      program,
      connection,
      owner,
      registrar,
      voterWeightRecord,
    })),
  ];
  const { ixs: torIxs, tokenOwnerRecord } = await ensureTokenOwnerRecordIxs(
    owner,
    shareMint,
    owner,
  );
  preIxs.push(...torIxs);

  const governanceAccount = await getGovernance(connection, governance);
  const proposalIndex = governanceAccount.account.proposalCount;
  const proposalName = name || `${kind ?? "Trade"}: ${token ?? ""}`.trim();

  // Solana's legacy-transaction wire-size ceiling — the real constraint on
  // `descriptionLink`'s length, since spl-governance itself has no fixed
  // program-side max for that field. Every candidate build below is measured
  // against this before it's accepted.
  const buildAndMeasure = async (descriptionLink) => {
    const { updateIx, createIxs, proposalPda } = await buildCreateProposalIxs({
      program,
      owner,
      registrar,
      voterWeightRecord,
      maxVwr,
      analystRecord,
      realm,
      governance,
      tokenOwnerRecord,
      shareMint,
      proposalIndex,
      name: proposalName,
      descriptionLink,
    });
    const tx = new Transaction().add(...preIxs, updateIx, ...createIxs);
    tx.feePayer = owner;
    tx.recentBlockhash = PublicKey.default.toBase58();
    const size = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).length;
    return { tx, proposalPda, size };
  };

  let descriptionLink = encodeProposalMetadata({
    kind,
    token,
    amountUsd,
    thesis,
    thesisRef,
  });
  let built = await buildAndMeasure(descriptionLink);

  if (built.size > PACKET_DATA_SIZE) {
    if (!thesisRef) {
      throw new Error(
        "Proposal thesis does not fit in a single transaction alongside its " +
          "required accounts; pass `thesisRef` (a link/hash to the fuller " +
          "writeup) so the on-chain thesis can be truncated safely.",
      );
    }
    let truncatedThesis = thesis ?? "";
    while (built.size > PACKET_DATA_SIZE && truncatedThesis.length > 0) {
      truncatedThesis = truncatedThesis.slice(
        0,
        Math.max(0, truncatedThesis.length - 40),
      );
      descriptionLink = encodeProposalMetadata({
        kind,
        token,
        amountUsd,
        thesis: truncatedThesis,
        thesisRef,
      });
      built = await buildAndMeasure(descriptionLink);
    }
    if (built.size > PACKET_DATA_SIZE) {
      throw new Error(
        "Proposal metadata cannot fit in a single transaction even with an " +
          "empty thesis — the account set alone exceeds the transaction size limit.",
      );
    }
  }

  const signature = await signSendConfirm(connection, provider, built.tx, owner);
  return { signature, proposal: built.proposalPda.toBase58() };
}

/**
 * Cast a vote on an existing proposal. Bundles (in ONE transaction, update
 * ix first): auto-created VoterWeightRecord/TokenOwnerRecord for the voter if
 * this is their first vote (plan decision #11), `update_voter_weight_record
 * ({castVote}, proposal)` with `analystRecord: null` (CastVote never needs
 * analyst status), and spl-governance's `withCastVote`.
 *
 * `proposalOwnerTor` and the voter's own TokenOwnerRecord are DISTINCT
 * accounts unless the voter also owns the proposal — this function never
 * assumes they're the same (governance-e2e.ts:673-688).
 *
 * `vote` accepts either an already-built `@solana/spl-governance` `Vote`
 * instance, or the string `"yes"`/`"no"` as a convenience for a simple
 * single-choice Approve/Deny vote.
 */
export async function castVote({
  provider,
  address,
  proposal,
  proposalOwnerTor,
  vote,
}) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const realm = realmAddress();
  const shareMint = governingTokenMintAddress();
  const registrar = registrarPda(realm, program.programId);
  const governance = governanceAddress();
  const proposalKey = new PublicKey(proposal);
  const proposalOwnerRecord = new PublicKey(proposalOwnerTor);
  const voterWeightRecord = voterWeightRecordPda(
    realm,
    shareMint,
    owner,
    program.programId,
  );
  const maxVwr = maxVoterWeightRecordPda(realm, shareMint, program.programId);

  const preIxs = [
    ...(await ensureVoterWeightRecordIx({
      program,
      connection,
      owner,
      registrar,
      voterWeightRecord,
    })),
  ];
  const { ixs: torIxs, tokenOwnerRecord: voterTokenOwnerRecord } =
    await ensureTokenOwnerRecordIxs(owner, shareMint, owner);
  preIxs.push(...torIxs);

  const resolvedVote =
    vote instanceof Vote
      ? vote
      : Vote.fromYesNoVote(
          String(vote).toLowerCase() === "no" ? YesNoVote.No : YesNoVote.Yes,
        );

  // Same-tx bundling (load-bearing, see file header): built fresh right here,
  // immediately before the transaction is assembled and signed below — never
  // cached across a Phantom approval delay.
  const updateIx = await program.methods
    .updateVoterWeightRecord({ castVote: {} }, proposalKey)
    .accounts({
      owner,
      registrar,
      voterWeightRecord,
      maxVwr,
      analystRecord: null,
    })
    .instruction();

  const castVoteIxs = [];
  await withCastVote(
    castVoteIxs,
    splGovernanceProgramId,
    PROGRAM_VERSION,
    realm,
    governance,
    proposalKey,
    proposalOwnerRecord,
    voterTokenOwnerRecord,
    owner,
    shareMint,
    resolvedVote,
    owner,
    voterWeightRecord,
    maxVwr,
  );

  const tx = new Transaction().add(...preIxs, updateIx, ...castVoteIxs);
  return signSendConfirm(connection, provider, tx, owner);
}

/**
 * Create a governance over `governedAccount`. Near-bootstrap/admin per plan
 * decision (confirmed): no UI entry point calls this — it stays exported here
 * only, for a one-time console/script setup action.
 *
 * Bundles (in ONE transaction, update ix first): auto-created
 * VoterWeightRecord/TokenOwnerRecord if missing,
 * `update_voter_weight_record({createGovernance}, null)` with
 * `analystRecord: null`, and spl-governance's `withCreateGovernance`. The
 * realm's community voter-weight addin config means CreateGovernance ALSO
 * reads the caller's VoterWeightRecord, hence the bundle even though
 * "creating a governance" isn't a vote/proposal action on its face
 * (governance-e2e.ts:304-305).
 */
export async function createGovernance({
  provider,
  address,
  governedAccount,
  governanceConfig,
}) {
  requireWriteInputs(provider, address);
  const connection = getConnection();
  const owner = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, owner);
  const program = makeWriteProgram(connection, wallet);
  const realm = realmAddress();
  const shareMint = governingTokenMintAddress();
  const registrar = registrarPda(realm, program.programId);
  const voterWeightRecord = voterWeightRecordPda(
    realm,
    shareMint,
    owner,
    program.programId,
  );
  const maxVwr = maxVoterWeightRecordPda(realm, shareMint, program.programId);

  const preIxs = [
    ...(await ensureVoterWeightRecordIx({
      program,
      connection,
      owner,
      registrar,
      voterWeightRecord,
    })),
  ];
  const { ixs: torIxs, tokenOwnerRecord } = await ensureTokenOwnerRecordIxs(
    owner,
    shareMint,
    owner,
  );
  preIxs.push(...torIxs);

  const updateIx = await program.methods
    .updateVoterWeightRecord({ createGovernance: {} }, null)
    .accounts({
      owner,
      registrar,
      voterWeightRecord,
      maxVwr,
      analystRecord: null,
    })
    .instruction();

  const governanceIxs = [];
  const governancePda = await withCreateGovernance(
    governanceIxs,
    splGovernanceProgramId,
    PROGRAM_VERSION,
    realm,
    new PublicKey(governedAccount),
    governanceConfig,
    tokenOwnerRecord,
    owner,
    owner,
    voterWeightRecord,
  );

  const tx = new Transaction().add(...preIxs, updateIx, ...governanceIxs);
  const signature = await signSendConfirm(connection, provider, tx, owner);
  return { signature, governance: governancePda.toBase58() };
}
