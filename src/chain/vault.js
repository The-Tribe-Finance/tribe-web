/**
 * Real vault interactions, signed by Phantom, against the configured cluster
 * (surfpool by default — see config.json).
 *
 * The vault holds real mainnet USDC on the surfpool fork. Depositing mints
 * shares; NAV is read on-chain from the oracle accounts passed as remaining
 * accounts.
 */
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import idl from "./tribe_vault_idl.json";
import { refreshSurfpoolOracles } from "./pyth";

// Local config.json is gitignored (it points at a private cluster). Use it if
// present, otherwise fall back to the committed example so a fresh clone still
// builds. `import.meta.glob` is resolved at build time by Vite.
const configs = import.meta.glob("./config.json", { eager: true });
const examples = import.meta.glob("./config.example.json", { eager: true });
const config = (
  Object.values(configs)[0] ?? Object.values(examples)[0]
).default;

export const CONFIG = config;
const USDC_DECIMALS = 6;

// On surfpool the oracles are fake accounts that go stale in 60s; the browser
// refreshes them via a cheatcode before depositing. Real clusters skip this.
// Derived from every registered asset so it scales with the whitelist.
const SURFPOOL_ORACLES = (config.assets ?? []).map((a) => ({
  address: a.oracle,
  label: a.oracleLabel,
  priceUsd: a.symbol === "USDC" ? 1 : 100,
}));

/** A read-only connection to the configured cluster. */
export function getConnection() {
  return new Connection(config.rpc, "confirmed");
}

/**
 * Wrap the Phantom provider as an Anchor wallet. Anchor needs `publicKey`,
 * `signTransaction`, and `signAllTransactions`.
 */
function anchorWalletFrom(provider, publicKey) {
  return {
    publicKey,
    signTransaction: (tx) => provider.signTransaction(tx),
    signAllTransactions: (txs) => provider.signAllTransactions(txs),
  };
}

function makeProgram(connection, wallet) {
  const anchorProvider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl, anchorProvider);
}

/** All the derived accounts the deposit needs. */
function deriveAccounts(depositor) {
  const vault = new PublicKey(config.vault);
  const vaultAuthority = new PublicKey(config.vaultAuthority);
  const usdcMint = new PublicKey(config.usdcMint);
  const shareMint = new PublicKey(config.shareMint);
  return {
    vault,
    vaultAuthority,
    usdcMint,
    shareMint,
    asset: new PublicKey(config.usdcAsset),
    usdcOracle: new PublicKey(config.usdcOracle),
    vaultUsdcAta: new PublicKey(config.vaultUsdcAta),
    depositorUsdc: getAssociatedTokenAddressSync(usdcMint, depositor),
    depositorShare: getAssociatedTokenAddressSync(shareMint, depositor),
  };
}

/** Read the depositor's USDC balance (UI units), or 0 if no account. */
export async function fetchUsdcBalance(address) {
  if (!address) return 0;
  const connection = getConnection();
  const owner = new PublicKey(address);
  const usdcMint = new PublicKey(config.usdcMint);
  const ata = getAssociatedTokenAddressSync(usdcMint, owner);
  try {
    const bal = await connection.getTokenAccountBalance(ata);
    return Number(bal.value.uiAmount) || 0;
  } catch {
    return 0;
  }
}

/** Read the depositor's vault-share balance (UI units). */
export async function fetchShareBalance(address) {
  if (!address) return 0;
  const connection = getConnection();
  const owner = new PublicKey(address);
  const shareMint = new PublicKey(config.shareMint);
  const ata = getAssociatedTokenAddressSync(shareMint, owner);
  try {
    const bal = await connection.getTokenAccountBalance(ata);
    return Number(bal.value.uiAmount) || 0;
  } catch {
    return 0;
  }
}

/**
 * Deposit `amountUi` USDC into the vault. Phantom signs. Returns the signature.
 *
 * The share ATA is created in the same transaction if it does not exist yet.
 * The asset's oracle is passed as a remaining account for the NAV read.
 */
export async function deposit({ provider, address, amountUi }) {
  const connection = getConnection();
  const depositor = new PublicKey(address);
  const wallet = anchorWalletFrom(provider, depositor);
  const program = makeProgram(connection, wallet);
  const a = deriveAccounts(depositor);

  const amount = new BN(Math.round(amountUi * 10 ** USDC_DECIMALS));

  // Surfpool: make the oracle prices fresh right before the NAV read.
  if (config.cluster === "surfpool" && SURFPOOL_ORACLES.length) {
    await refreshSurfpoolOracles(config.rpc, SURFPOOL_ORACLES);
  }

  // Create the share ATA up front if missing (deposit checks it, does not init).
  const preIxs = [];
  if (!(await connection.getAccountInfo(a.depositorShare))) {
    preIxs.push(
      createAssociatedTokenAccountInstruction(
        depositor,
        a.depositorShare,
        depositor,
        a.shareMint,
      ),
    );
  }

  // NAV requires EVERY registered asset's triple, in the vault's own index
  // order: [asset PDA, vault token account, oracle]. Build it from on-chain
  // state so it stays correct no matter how many assets are registered.
  const vaultState = await program.account.vault.fetch(a.vault);
  const navAccounts = [];
  for (const mint of vaultState.assetMints) {
    const [assetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('asset'), a.vault.toBuffer(), mint.toBuffer()],
      program.programId,
    );
    const assetState = await program.account.asset.fetch(assetPda);
    navAccounts.push(
      { pubkey: assetPda, isWritable: false, isSigner: false },
      { pubkey: assetState.tokenAccount, isWritable: false, isSigner: false },
      { pubkey: assetState.oracle, isWritable: false, isSigner: false },
    );
  }

  const depositIx = await program.methods
    .deposit(amount)
    .accounts({
      depositor,
      vault: a.vault,
      vaultAuthority: a.vaultAuthority,
      asset: a.asset,
      depositMint: a.usdcMint,
      depositorTokenAccount: a.depositorUsdc,
      vaultTokenAccount: a.vaultUsdcAta,
      shareMint: a.shareMint,
      depositorShareAccount: a.depositorShare,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(navAccounts)
    .instruction();

  // NAV over every asset needs ~105 accounts — far past a legacy transaction's
  // limit — so send a versioned transaction backed by the lookup table the
  // bootstrap created. Phantom signs the v0 message.
  const lookupTables = [];
  if (config.lookupTable) {
    const lt = await connection.getAddressLookupTable(
      new PublicKey(config.lookupTable),
    );
    if (lt.value) lookupTables.push(lt.value);
  }

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  const message = new TransactionMessage({
    payerKey: depositor,
    recentBlockhash: blockhash,
    instructions: [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
      ...preIxs,
      depositIx,
    ],
  }).compileToV0Message(lookupTables);

  const tx = new VersionedTransaction(message);
  const signed = await provider.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return sig;
}
