import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getProposal } from '@solana/spl-governance';
import {
  ACTIONS,
  ACTION_PROTOS,
  ANALYST_POOL_SHARE,
  FEE_PERF,
  INITIAL_STATE,
  LOCK_MS,
  MARGIN_MIN_PCT,
  PROTOCOLS,
  SLIPPAGE,
  TOKENS,
  YES_MIN_PCT,
  fmt,
  navOf,
  usd,
  usdPrecise,
  usdCompact,
} from './domain';
import { Nav, Toast, WalletModal } from './ui';
import { useWallet, shortAddress } from './wallet';
import Landing from './screens/Landing';
import Portfolio from './screens/Portfolio';
import Governance from './screens/Governance';
import Delegation from './screens/Delegation';
import Position from './screens/Position';
import DelegatePrompt from './screens/DelegatePrompt';
import { emptyVaultSnapshot, fetchVaultSnapshot } from './api/vault';
import { fetchShareBalance } from './chain/vault';
import {
  getConnection,
  fetchVoterWeightRecord,
  fetchMaxVoterWeightRecord,
  fetchLocker,
  fetchAnalystRecord,
  fetchRegistrar,
} from './chain/governance';
import { emptyProposals, emptyAnalysts, fetchProposals, fetchAnalystDirectory } from './api/governance';

const ZERO_VOTER_WEIGHT = { voterWeight: 0, expiry: null, action: null, target: null };
const ZERO_LOCKER = { amountLocked: 0, pendingUnlock: 0, unlockAvailableAt: 0, delegate: null };
// spl-governance ProposalState names that only occur once a proposal's vote
// has succeeded — mirrors tribe-api's own `PASSED_STATES` set exactly so the
// FE and API agree on what "passed" means (see tribe-api/src/governance.ts).
const PASSED_PROPOSAL_STATES = new Set(['Succeeded', 'Executing', 'Completed', 'ExecutingWithErrors']);

const PROPS = {
  vaultName: 'Tribe DAO',
  proposalThresholdPct: 1,
};

// Group a holding for the table's section headers. Tokenized equities are an
// uppercase ticker followed by a lowercase "x" (AAPLx, METAx…); USDC/USDT are
// cash; everything else is crypto.
function categoryOf(sym) {
  if (sym === 'USDC' || sym === 'USDT') return 'Cash';
  if (/^[A-Z]{2,}x$/.test(sym)) return 'Stocks';
  return 'Crypto';
}

export default function App() {
  const [state, setState] = useState(() => ({ ...INITIAL_STATE }));
  const [vaultSnapshot, setVaultSnapshot] = useState(emptyVaultSnapshot);
  const [vaultHistory, setVaultHistory] = useState([]);
  const [walletShares, setWalletShares] = useState(0);
  const [governanceSnapshot, setGovernanceSnapshot] = useState(() => ({
    proposals: emptyProposals().proposals,
    analysts: emptyAnalysts().analysts,
  }));
  const [voterWeight, setVoterWeight] = useState(ZERO_VOTER_WEIGHT);
  const [maxVoterWeight, setMaxVoterWeight] = useState({ maxVoterWeight: 0 });
  const [locker, setLocker] = useState(ZERO_LOCKER);
  const [analystRecord, setAnalystRecord] = useState(null);
  const [registrar, setRegistrar] = useState(null);
  const toastTimer = useRef(null);

  const patch = useCallback((next) => {
    setState((s) => ({ ...s, ...(typeof next === 'function' ? next(s) : next) }));
  }, []);

  const showToast = useCallback(
    (toast) => {
      clearTimeout(toastTimer.current);
      patch({ toast });
      toastTimer.current = setTimeout(() => patch({ toast: null }), 3400);
    },
    [patch],
  );

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const refreshVault = useCallback(async () => {
    const snapshot = await fetchVaultSnapshot();
    setVaultSnapshot(snapshot);
    setVaultHistory(snapshot.history);
  }, []);
  useEffect(() => {
    refreshVault();
    const timer = setInterval(refreshVault, 15_000);
    return () => clearInterval(timer);
  }, [refreshVault]);

  // Real multi-wallet support. Lifecycle events surface through the same toast.
  const wallet = useWallet((e) => showToast(e.message));
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Keep the mock state's connection flag in sync with the real wallet, so the
  // screens that gate on `walletConnected` continue to work unchanged.
  useEffect(() => {
    patch({ walletConnected: wallet.connected });
  }, [wallet.connected, patch]);

  // The share token account is the sole source of truth for a member's
  // position. Never reuse the old UI demo balance after the wallet changes.
  useEffect(() => {
    let cancelled = false;
    const refreshShares = async () => {
      const amount = wallet.canDeposit ? await fetchShareBalance(wallet.address) : 0;
      if (!cancelled) setWalletShares(amount);
    };
    refreshShares();
    const timer = setInterval(refreshShares, 15_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [wallet.address, wallet.canDeposit]);

  // Proposal list + analyst directory: tribe-api's off-chain aggregation
  // (mirrors `refreshVault` above). Zero/empty on any failure — never fabricate.
  const refreshGovernance = useCallback(async () => {
    const [proposalsRes, analystsRes] = await Promise.all([fetchProposals(), fetchAnalystDirectory()]);
    setGovernanceSnapshot({ proposals: proposalsRes.proposals, analysts: analystsRes.analysts });
  }, []);
  useEffect(() => {
    refreshGovernance();
    const timer = setInterval(refreshGovernance, 15_000);
    return () => clearInterval(timer);
  }, [refreshGovernance]);

  // Per-member governance reads (voter weight, locker, own analyst record) —
  // mirrors the `walletShares` effect above: zeroed the moment no Solana
  // wallet is connected, never carried over from a prior address.
  const refreshMemberReads = useCallback(async () => {
    if (!wallet.canDeposit || !wallet.address) {
      setVoterWeight(ZERO_VOTER_WEIGHT);
      setLocker(ZERO_LOCKER);
      setAnalystRecord(null);
      return;
    }
    const [vwr, lockerData, ar] = await Promise.all([
      fetchVoterWeightRecord(wallet.address),
      fetchLocker(wallet.address),
      fetchAnalystRecord(wallet.address),
    ]);
    setVoterWeight(vwr);
    setLocker(lockerData);
    setAnalystRecord(ar);
  }, [wallet.address, wallet.canDeposit]);
  useEffect(() => {
    refreshMemberReads();
    const timer = setInterval(refreshMemberReads, 15_000);
    return () => clearInterval(timer);
  }, [refreshMemberReads]);

  // Realm-wide governance reads: independent of which wallet (if any) is
  // connected — the quorum denominator and the registrar's unlock-wait config.
  const refreshRealmReads = useCallback(async () => {
    const [mvwr, reg] = await Promise.all([fetchMaxVoterWeightRecord(), fetchRegistrar()]);
    setMaxVoterWeight(mvwr);
    setRegistrar(reg);
  }, []);
  useEffect(() => {
    refreshRealmReads();
    const timer = setInterval(refreshRealmReads, 15_000);
    return () => clearInterval(timer);
  }, [refreshRealmReads]);

  const vals = useDerived(
    state,
    patch,
    showToast,
    wallet,
    walletShares,
    vaultSnapshot,
    vaultHistory,
    refreshVault,
    governanceSnapshot,
    voterWeight,
    maxVoterWeight,
    locker,
    analystRecord,
    registrar,
    refreshGovernance,
    refreshMemberReads,
  );

  const screens = {
    home: Landing,
    portfolio: Portfolio,
    governance: Governance,
    analysts: Delegation,
    position: Position,
  };
  const Screen = screens[state.tab];
  const isLanding = state.tab === 'home';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav
        tab={state.tab}
        setTab={(tab) => patch({ tab })}
        walletLabel={
          wallet.connected
            ? shortAddress(wallet.address)
            : wallet.connecting
              ? 'Connecting…'
              : 'Connect Wallet'
        }
        connected={wallet.connected}
        onConnect={() => setWalletModalOpen(true)}
        onDisconnect={wallet.disconnect}
      />

      <WalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onPick={(id) => {
          setWalletModalOpen(false);
          wallet.connect(id);
        }}
      />

      {isLanding ? (
        <Screen {...vals} />
      ) : (
        <main
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: `0 clamp(16px, 4vw, 32px)`,
          }}
        >
          <Screen {...vals} />
        </main>
      )}

      {state.delegatePrompt && <DelegatePrompt {...vals} />}
      <Toast message={state.toast} />
    </div>
  );
}

/**
 * Port of the design component's renderVals(): turns raw state into every
 * formatted value and handler the screens render.
 */
function useDerived(
  rawState,
  patch,
  showToast,
  wallet,
  walletShares,
  vaultSnapshot,
  vaultHistory,
  refreshVault,
  governanceSnapshot,
  voterWeight,
  maxVoterWeight,
  locker,
  analystRecord,
  registrar,
  refreshGovernance,
  refreshMemberReads,
) {
  return useMemo(() => {
    // On-chain balances are authoritative. A failed RPC intentionally displays zeros.
    const s = { ...rawState, treasury: vaultSnapshot.treasury, totalShares: vaultSnapshot.totalShares, holdings: vaultSnapshot.holdings };
    const setTab = (tab) => () => patch({ tab });
    const walletConnected = !!wallet?.connected;
    const ownAddress = wallet?.address ?? null;

    // SHARE_DECIMALS = 6 for the share mint (== governingTokenMint), same as
    // wallet.js. Every raw on-chain share/voter-weight amount (u64 base units)
    // must go through this before being shown to a user — locked/pending
    // amounts AND voter weight itself, since voter_weight is also share-
    // denominated (state.rs). Hoisted here (used as early as `note` below,
    // well before the Locker section) to avoid a temporal-dead-zone bug.
    const SHARE_DECIMALS = 6;
    const toShareUi = (raw) => raw / 10 ** SHARE_DECIMALS;

    // Delegation: the Locker's `delegate` field is the real on-chain source of
    // truth (a fresh Locker self-delegates by default — `create_locker`), not
    // a mock `delegatedTo` key. `set_delegate` has NO on-chain time-gate
    // (plan decision #12); `delegatedAt` below is a session-only cosmetic
    // cool-down SUGGESTION, never a block on the real action.
    const isDelegated = !!(locker.delegate && ownAddress && locker.delegate !== ownAddress);
    const days = (n) => n + ' day' + (n === 1 ? '' : 's');
    const cooldownActive = !!(s.delegatedAt && Date.now() - s.delegatedAt < LOCK_MS);
    const cooldownDaysLeft = cooldownActive ? Math.ceil((LOCK_MS - (Date.now() - s.delegatedAt)) / 86400000) : 0;
    // Kept for Governance.jsx's existing opacity cue only — never gates the click.
    const delegationLocked = cooldownActive;
    const lockDaysLeft = cooldownDaysLeft;

    const NAV = s.holdings.reduce((total, h) => total + h.qty * (vaultSnapshot.prices[h.sym] || 0), s.treasury);
    // Real active voting power = the realm's quorum denominator
    // (MaxVoterWeightRecord), not vault NAV — Requirement 5.
    const activePower = maxVoterWeight.maxVoterWeight;
    const sharePrice = s.totalShares > 0 ? NAV / s.totalShares : 0;
    const userShares = wallet?.canDeposit ? walletShares : 0;
    const userValue = userShares * sharePrice;
    const ownership = s.totalShares > 0 ? (userShares / s.totalShares) * 100 : 0;

    // ---- holdings, allocation ----
    const holdRows = s.holdings
      .map((h) => {
        const fallbackToken = { name: h.sym, price: 0, chg: 0, sw: '#8a7d63', badge: '?' };
        const tk = { ...(TOKENS[h.sym] || fallbackToken), price: vaultSnapshot.prices[h.sym] || 0, chg: vaultSnapshot.changes[h.sym] || 0 };
        const value = h.qty * tk.price;
        const hasCost = Number.isFinite(h.avgCost) && h.avgCost > 0;
        return {
          ...h,
          tk,
          value,
          pnl: hasCost ? (tk.price - h.avgCost) * h.qty : null,
          pnlPct: hasCost ? (tk.price / h.avgCost - 1) * 100 : null,
        };
      })
      .sort((a, b) => b.value - a.value);

    const tokenRows = holdRows.filter((r) => r.qty > 0).map((r) => ({
      sym: r.sym,
      name: r.tk.name,
      swatch: r.tk.sw,
      badge: r.tk.badge,
      logo: r.tk.logo,
      cat: categoryOf(r.sym),
      priceFmt: '$' + fmt(r.tk.price, 2),
      chgUp: r.tk.chg >= 0,
      chgFmt: (r.tk.chg >= 0 ? '+' : '') + r.tk.chg.toFixed(1) + '%',
      chgColor: r.tk.chg >= 0 ? '#3e7d3a' : '#b3452f',
      qtyFmt: fmt(r.qty, r.qty > 0 && r.qty < 0.001 ? 8 : r.qty < 100 ? 3 : 0),
      // Buy price = the asset's market price at purchase (no slippage/fees).
      buyFmt: r.buyPrice == null ? '—' : '$' + fmt(r.buyPrice, 2),
      // Avg cost = what the vault actually paid per unit (includes slippage/fees).
      avgFmt: r.avgCost == null ? '—' : '$' + fmt(r.avgCost, 2),
      valueFmt: usdPrecise(r.value),
      weightFmt: (NAV > 0 ? (r.value / NAV) * 100 : 0).toFixed(1) + '%',
      pnl: r.pnl,
      pnlUp: r.pnl != null && r.pnl >= 0,
      pnlFmt:
        r.pnl == null ? '—' : (r.pnl >= 0 ? '+' : '−') + usd(Math.abs(r.pnl)) + ' (' + (r.pnlPct >= 0 ? '+' : '') + r.pnlPct.toFixed(1) + '%)',
      pnlColor: r.pnl == null ? '#8a7d63' : r.pnl >= 0 ? '#3e7d3a' : '#b3452f',
    }));
    // Order by category (Crypto → Stocks) then by value, so the table's section
    // headers stay contiguous instead of a small crypto position slipping into
    // the middle of the stocks block. USDC (Cash) is appended last below.
    const catRank = { Crypto: 0, Stocks: 1, Cash: 2 };
    tokenRows.sort((a, b) => (catRank[a.cat] - catRank[b.cat]) || (parseFloat(String(b.valueFmt).replace(/[^0-9.]/g, '')) - parseFloat(String(a.valueFmt).replace(/[^0-9.]/g, ''))));
    // Cash is also a real vault holding.  Keep it in the table whenever the
    // reserve is positive, while zero-balance tokens stay hidden.
    if (s.treasury > 0) {
      tokenRows.push({
        sym: 'USDC',
        name: 'Cash reserve',
        swatch: TOKENS.USDC.sw,
        badge: TOKENS.USDC.badge,
        logo: TOKENS.USDC.logo,
        cat: 'Cash',
        priceFmt: '$1.00',
        chgUp: true,
        chgFmt: '0.0%',
        chgColor: '#8a7d63',
        qtyFmt: fmt(s.treasury, 6),
        buyFmt: '$1.00',
        avgFmt: '$1.00',
        valueFmt: usdPrecise(s.treasury),
        weightFmt: (NAV > 0 ? (s.treasury / NAV) * 100 : 0).toFixed(1) + '%',
        pnl: null,
        pnlUp: false,
        pnlFmt: '—',
        pnlColor: '#8a7d63',
      });
    }
    // Full per-token allocation — every held token plus the cash reserve. Used
    // for redemption math, which must resolve each real token's price.
    const allocSrc = [
      ...holdRows.filter((r) => r.qty > 0).map((r) => ({ sym: r.sym, value: r.value, color: r.tk.sw })),
      ...(s.treasury > 0 ? [{ sym: 'USDC', value: s.treasury, color: TOKENS.USDC.sw }] : []),
    ];
    // Display view for the chart/legend: roll positions below a small threshold
    // into a single "Others" slice so it stays readable with many tokens. USDC is
    // always its own slice (usually the largest).
    const ALLOC_MIN_PCT = 2;
    const ALLOC_MAX_SLICES = 7;
    const tokenSlices = holdRows.filter((r) => r.qty > 0).map((r) => ({ sym: r.sym, value: r.value, color: r.tk.sw }));
    const major = tokenSlices.filter((a) => (a.value / NAV) * 100 >= ALLOC_MIN_PCT).slice(0, ALLOC_MAX_SLICES);
    const minor = tokenSlices.filter((a) => !major.includes(a));
    const othersValue = minor.reduce((sum, a) => sum + a.value, 0);
    const allocDisplay = [
      ...major,
      ...(othersValue > 0 ? [{ sym: 'Others', value: othersValue, color: '#b8ad93', count: minor.length }] : []),
      ...(s.treasury > 0 ? [{ sym: 'USDC', value: s.treasury, color: TOKENS.USDC.sw }] : []),
    ];
    const ah = s.allocHover;
    let cum = 0;
    const allocation = allocDisplay.map((a, i) => {
      const w = (a.value / NAV) * 100;
      const mid = cum + w / 2;
      cum += w;
      const hovered = ah === i;
      return {
        sym: a.sym,
        label: a.sym === 'Others' ? `Others (${a.count})` : a.sym,
        color: a.color,
        w,
        wFmt: w.toFixed(1) + '%',
        mid,
        value: a.value,
        onEnter: () => patch({ allocHover: i }),
        dim: ah == null || hovered ? 1 : 0.4,
        rowBg: hovered ? '#faf6ec' : 'transparent',
      };
    });
    const allocActive = ah != null && allocDisplay[ah] ? allocation[ah] : null;

    const topHoldings = holdRows.slice(0, 5).map((r) => ({
      sym: r.sym,
      pct: ((r.value / NAV) * 100).toFixed(2) + '%',
    }));
    const totalPnl = holdRows.reduce((a, r) => a + (r.pnl ?? 0), 0);
    const userPnl = s.totalShares > 0 ? totalPnl * (userShares / s.totalShares) : 0;

    // ---- proposals ----
    // Real spl-governance proposals from tribe-api (Phase 04/05) — a failed
    // fetch yields an empty list (api/governance.js's own contract), never a
    // fabricated one. `proposalOwnerTor` (needed by `castVote`) is not part of
    // that API response, so it is resolved directly from spl-governance right
    // before signing (see `handleVote` below) — a genuine read, not a mock.
    const handleVote = (proposalPubkey, side) => async () => {
      if (!wallet?.canDeposit || !wallet?.address) {
        showToast('Connect a Solana wallet to vote.');
        return;
      }
      let proposalOwnerTor;
      try {
        const connection = getConnection();
        const proposalAccount = await getProposal(connection, new PublicKey(proposalPubkey));
        proposalOwnerTor = proposalAccount.account.tokenOwnerRecord.toBase58();
      } catch {
        showToast('Could not read this proposal on-chain — try again.');
        return;
      }
      const sig = await wallet.castVote({ proposal: proposalPubkey, proposalOwnerTor, vote: side === 'for' ? 'yes' : 'no' });
      if (!sig) return;
      patch((cur) => ({ votes: { ...cur.votes, [proposalPubkey]: side } }));
      showToast('Voted ' + (side === 'for' ? 'FOR' : 'AGAINST') + ' ' + shortAddress(proposalPubkey) + '.');
      await Promise.all([refreshGovernance(), refreshMemberReads()]);
    };

    const proposals = governanceSnapshot.proposals.map((p) => {
      const forRaw = Number(p.options?.[0]?.voteWeight ?? 0);
      const againstRaw = Number(p.denyVoteWeight ?? 0);
      const total = forRaw + againstRaw;
      const forPct = total ? Math.round((forRaw / total) * 100) : 0;
      const isActive = p.state === 'Voting';
      const isExecuted = PASSED_PROPOSAL_STATES.has(p.state);
      const yesPct = activePower > 0 ? (forRaw / activePower) * 100 : 0;
      const noPct = activePower > 0 ? (againstRaw / activePower) * 100 : 0;
      const marginPct = yesPct - noPct;
      const yesMet = yesPct >= YES_MIN_PCT;
      const marginMet = marginPct >= MARGIN_MIN_PCT;
      const passing = yesMet && marginMet;
      const voted = s.votes[p.pubkey];
      const meta = p.metadata;

      let note = null;
      if (isActive && voted) {
        note = 'You voted ' + (voted === 'for' ? 'FOR' : 'AGAINST') + ' with ' + fmt(toShareUi(voterWeight.voterWeight), 2) + ' voting power.';
      } else if (isActive && isDelegated) {
        note = 'Your delegate (' + shortAddress(locker.delegate) + ') votes on your behalf for this proposal.';
      }

      const timing = isActive
        ? 'Open for voting' + (p.votingAt ? ' · since ' + new Date(p.votingAt * 1000).toLocaleDateString() : '')
        : p.state === 'Draft' || p.state === 'SigningOff'
          ? 'Not yet open for voting'
          : 'Voting closed · ' + p.state;

      return {
        id: p.pubkey,
        kind: meta?.kind || 'other',
        title: p.name || (meta ? meta.kind + ' ' + meta.token : 'Untitled proposal'),
        summary: meta?.thesis || p.descriptionLink || '',
        // The proposals API does not expose a proposal → proposer-address join
        // (only tribe-api's internal analyst-stats computation has it) — no
        // "Proposed by" data source exists on the FE, so this stays undefined
        // rather than a fabricated name (ProposalCard renders it conditionally).
        analyst: undefined,
        status: isActive ? 'active' : isExecuted ? 'executed' : 'rejected',
        timing,
        statusLabel: isActive ? 'Active' : isExecuted ? 'Executed' : 'Rejected',
        forPct,
        againstPct: total ? 100 - forPct : 0,
        forFmt: fmt(forRaw),
        againstFmt: fmt(againstRaw),
        yesPctFmt: yesPct.toFixed(1) + '%',
        yesBarPct: Math.min(100, yesPct),
        yesMet,
        marginPctFmt: (marginPct >= 0 ? '+' : '') + marginPct.toFixed(1) + '%',
        marginBarPct: Math.min(100, Math.max(0, marginPct)),
        marginMet,
        passing,
        passBadgeLabel: isActive
          ? passing
            ? 'On track to pass'
            : 'Not passing yet'
          : isExecuted
            ? 'Passed'
            : 'Did not pass',
        passOk: isActive ? passing : isExecuted,
        showVoteButtons: isActive && !isDelegated && !voted && walletConnected,
        note,
        voteFor: handleVote(p.pubkey, 'for'),
        voteAgainst: handleVote(p.pubkey, 'against'),
      };
    });

    // ---- create-proposal form ----
    const curAction = s.npAction;
    const curProtos = ACTION_PROTOS[curAction] || [];
    const actionSoon = !!ACTIONS[curAction].soon;
    const curProto = curProtos.includes(s.npProtocol) ? s.npProtocol : curProtos[0];
    const protoLive = !!PROTOCOLS[curProto]?.live;

    const actionTabs = Object.keys(ACTIONS).map((k) => ({
      key: k,
      label: ACTIONS[k].label,
      soon: !!ACTIONS[k].soon,
      on: k === curAction,
      onClick: () => patch({ npAction: k, npProtocol: (ACTION_PROTOS[k] || [])[0] }),
    }));

    const protocolChips = curProtos.map((pk) => ({
      key: pk,
      ...PROTOCOLS[pk],
      on: pk === curProto,
      soon: !PROTOCOLS[pk].live,
      onClick: () => PROTOCOLS[pk].live && patch({ npProtocol: pk }),
    }));

    const npAmt = parseFloat(s.npAmount) || 0;
    const npTk = { ...TOKENS[s.npToken], price: vaultSnapshot.prices[s.npToken] || 0 };
    const selectedHolding = s.holdings.find((holding) => holding.sym === s.npToken);
    const selectedTokenQty = selectedHolding?.qty ?? 0;
    const selectedTokenValue = selectedTokenQty * npTk.price;
    const availableOrderValue = curAction === 'buy' ? s.treasury : selectedTokenValue;
    const availableLiquidityLabel = curAction === 'buy'
      ? `${fmt(s.treasury, 6)} USDC`
      : `${fmt(selectedTokenQty, selectedTokenQty === 0 ? 0 : 8)} ${s.npToken}`;
    const thesisOk = (s.npThesis || '').trim().length >= 20;
    const threshold = PROPS.proposalThresholdPct;
    // Real propose-threshold gate (Requirement 5): voter_weight / max_voter_weight,
    // the program's own >=1% active-power check — NOT vault-share ownership %.
    const realVotingPowerPct = maxVoterWeight.maxVoterWeight > 0 ? (voterWeight.voterWeight / maxVoterWeight.maxVoterWeight) * 100 : 0;
    const meetsThreshold = realVotingPowerPct >= threshold;
    const submitDisabled = !(
      npAmt > 0 &&
      npTk.price > 0 &&
      thesisOk &&
      meetsThreshold &&
      protoLive &&
      !actionSoon &&
      npAmt <= availableOrderValue
    );

    let createHint;
    if (actionSoon) {
      createHint =
        ACTIONS[curAction].label +
        ' actions are coming soon — Tribe currently executes swaps on Jupiter. Choose Buy or Sell to create a live proposal.';
    } else if (curAction === 'buy') {
      createHint =
        'Buys ' +
        npTk.name +
        ' with treasury USDC (' +
        usd(s.treasury) +
        ' available) via ' +
        PROTOCOLS[curProto].name +
        '. Est. ' +
        (npAmt ? fmt(npAmt / npTk.price, 2) : '0') +
        ' ' +
        s.npToken +
        '.';
    } else {
      createHint =
        'Sells ' +
        (npAmt ? fmt(npAmt / npTk.price, 2) : '0') +
        ' ' +
        s.npToken +
        ' (~' +
        usd(npAmt) +
        ') back to USDC via ' +
        PROTOCOLS[curProto].name +
        '.';
    }
    if (!actionSoon && npAmt > 0 && !thesisOk) {
      createHint =
        'Write your investment thesis (a few sentences of analysis) before submitting — every proposal carries its reasoning so members vote informed.';
    }
    if (!meetsThreshold) {
      createHint =
        'You need at least ' +
        threshold +
        '% of active voting power to open a proposal. You currently hold ' +
        realVotingPowerPct.toFixed(2) +
        '% — lock more shares or ask a larger holder to sponsor this idea.';
    }

    const submitProposal = async () => {
      if (submitDisabled) return;
      if (!wallet?.canDeposit || !wallet?.address) {
        showToast('Connect a Solana wallet to submit a proposal.');
        return;
      }
      const result = await wallet.createProposal({
        kind: ACTIONS[curAction].kind,
        token: s.npToken,
        amountUsd: npAmt,
        thesis: s.npThesis.trim(),
      });
      if (!result) return;
      patch({ npAmount: '', npThesis: '', tab: 'governance' });
      showToast('Proposal ' + shortAddress(result.proposal) + ' created — open for voting.');
      await Promise.all([refreshGovernance(), refreshMemberReads()]);
    };

    // ---- analysts + rewards pool ----
    // Real delegation write: `setDelegate` (self = revoke, `lib.rs:82`). No
    // on-chain time-gate exists (plan decision #12) — `delegatedAt` only drives
    // a cosmetic cool-down SUGGESTION below, never blocks the actual call.
    const revokeDelegation = async () => {
      if (!wallet?.canDeposit || !wallet?.address) {
        showToast('Connect a Solana wallet to change delegation.');
        return;
      }
      const sig = await wallet.setDelegate(wallet.address);
      if (!sig) return;
      patch({ delegatedAt: Date.now() });
      showToast('Delegation revoked — you vote directly again.');
      await refreshMemberReads();
    };

    const chooseDelegate = (analystAddress) => async () => {
      if (!wallet?.canDeposit || !wallet?.address) {
        showToast('Connect a Solana wallet to delegate.');
        return;
      }
      const sig = await wallet.setDelegate(analystAddress);
      if (!sig) return;
      patch({ delegatedAt: Date.now(), delegatePrompt: false });
      showToast('Voting power delegated to ' + shortAddress(analystAddress) + '.');
      await refreshMemberReads();
    };

    const toggleDelegate = (analystAddress) => (e) => {
      e?.stopPropagation?.();
      if (locker.delegate === analystAddress) {
        revokeDelegation();
      } else {
        chooseDelegate(analystAddress)();
      }
    };

    const feeMgmt = NAV * 0.005;
    const analystPool = (feeMgmt + FEE_PERF) * ANALYST_POOL_SHARE;
    // Real analyst directory (Requirement 7 / decision #10): truncated address +
    // derived stats (registeredAt/stake/proposalsCreated/proposalsPassed), no
    // fabricated name/bio/perf. No on-chain source correlates "delegated TVL" to
    // a specific analyst (Locker records a per-member delegate, but nothing
    // aggregates locked shares by delegate) — rather than invent that number,
    // every pool share/reward below is honestly zero until that aggregation
    // exists, the same zero-on-failure convention as voting power above.
    const analystDirectory = governanceSnapshot.analysts;
    const isSelfAnalyst = !!analystRecord;
    const poolMembers = analystDirectory.map((a) => ({ key: a.analyst, tvlNum: 0 }));
    if (isSelfAnalyst && ownAddress && !poolMembers.some((m) => m.key === ownAddress)) {
      poolMembers.push({ key: ownAddress, tvlNum: 0 });
    }
    const totalDelegatedTVL = poolMembers.reduce((acc, m) => acc + m.tvlNum, 0) || 1;
    const shareOf = (key) => {
      const m = poolMembers.find((x) => x.key === key);
      return m ? (m.tvlNum / totalDelegatedTVL) * 100 : 0;
    };
    const rewardOf = (key) => (analystPool * shareOf(key)) / 100;

    const poolDist = poolMembers.map((m) => ({
      name: m.key === ownAddress ? 'You' : shortAddress(m.key),
      self: m.key === ownAddress,
      sharePct: shareOf(m.key).toFixed(1) + '%',
      barPct: shareOf(m.key),
      rewardsYrFmt: usd(Math.round(rewardOf(m.key))),
      barColor: m.key === ownAddress ? '#c2762e' : '#3e5c2f',
    }));

    const analysts = analystDirectory.map((a) => {
      const mine = locker.delegate === a.analyst;
      return {
        key: a.analyst,
        name: shortAddress(a.analyst),
        initials: a.analyst.slice(0, 2).toUpperCase(),
        handle: shortAddress(a.analyst, 6, 6),
        thesis: '',
        tvl: '—',
        delegators: '—',
        perf: '—',
        sharpe: '—',
        drawdown: '—',
        record: a.proposalsPassed + ' of ' + a.proposalsCreated + ' proposals passed',
        isDelegated: mine,
        // Decision #12: `set_delegate` has no on-chain time-gate, so a real
        // delegation change is never blocked here — only a soft note below.
        disabled: false,
        lockNote: mine && cooldownActive ? cooldownDaysLeft + 'd suggested wait' : '',
        rewardsYrFmt: usd(Math.round(rewardOf(a.analyst))),
        accruedFmt: usd(0),
        poolSharePct: shareOf(a.analyst).toFixed(1) + '%',
        openDetail: () => patch({ selectedAnalyst: a.analyst }),
        toggleDelegate: toggleDelegate(a.analyst),
      };
    });

    const detail = s.selectedAnalyst ? analysts.find((a) => a.key === s.selectedAnalyst) : null;
    const ad = detail
      ? {
          ...detail,
          bio: '',
          history: [], // no on-chain per-analyst trade-history feed exists yet
          // The proposals API has no proposal → proposer-address join (see the
          // `analyst: undefined` comment on `proposals` above) — empty, not fabricated.
          created: [],
          close: () => patch({ selectedAnalyst: null }),
        }
      : null;

    // ---- deposit / redeem ----
    const depAmt = parseFloat(s.depositAmt) || 0;
    // The real USDC balance lives on-chain, not in the mock ledger, so the only
    // gate here is a positive amount plus a connected wallet.
    const depositDisabled = !(depAmt > 0) || !walletConnected;
    const confirmDeposit = async () => {
      if (depAmt <= 0) return;
      if (!walletConnected) {
        showToast('Connect your Phantom wallet to deposit.');
        return;
      }
      // Real on-chain deposit: Phantom signs, the vault mints shares.
      // The mock ledger only advances once the transaction confirms.
      const sig = await wallet.signAndSend({ amountUi: depAmt });
      if (!sig) return;
      const mint = depAmt / sharePrice;
      patch((cur) => ({
        userShares: cur.userShares + mint,
        totalShares: cur.totalShares + mint,
        treasury: cur.treasury + depAmt,
        walletUsdc: cur.walletUsdc - depAmt,
        depositAmt: '',
      }));
      showToast('Deposited ' + fmt(depAmt) + ' USDC — minted ' + fmt(mint, 2) + ' vault shares.');
    };

    const redeemShares = (s.userShares * s.redeemPct) / 100;
    const redeemValue = redeemShares * sharePrice;
    const isUsdc = s.redeemMode === 'usdc';
    const redeemBreakdown = allocSrc.map((a) => {
      const value = NAV > 0 ? redeemValue * (a.value / NAV) : 0;
      const price = vaultSnapshot.prices[a.sym] || 0;
      const units = price > 0 ? value / price : 0;
      return { sym: a.sym, amount: fmt(units, units < 1 ? 8 : 2), value: usdPrecise(value) };
    });

    const confirmRedeem = () => {
      const frac = redeemShares / s.totalShares;
      patch((cur) => {
        const base = {
          holdings: cur.holdings.map((h) => ({ ...h, qty: h.qty * (1 - frac) })),
          treasury: cur.treasury * (1 - frac),
          userShares: cur.userShares - redeemShares,
          totalShares: cur.totalShares - redeemShares,
        };
        if (!isUsdc) return base;
        return { ...base, walletUsdc: cur.walletUsdc + redeemValue * (1 - SLIPPAGE) };
      });
      if (isUsdc) {
        showToast(
          'Redeemed ' +
            fmt(redeemShares) +
            ' shares → received ' +
            fmt(redeemValue * (1 - SLIPPAGE), 2) +
            ' USDC (swapped via Jupiter).',
        );
      } else {
        showToast('Redeemed in-kind — pro-rata tokens sent to your wallet.');
      }
    };

    // ---- lock / unlock panel (decision #11) ----
    // Locker/VoterWeightRecord amounts come back as raw base units (chain/governance.js
    // has no opinion on share-mint decimals) — `toShareUi`/`SHARE_DECIMALS` hoisted
    // near the top of this function (used earlier by `note` and `votingPowerFmt`).
    const lockAmt = parseFloat(s.lockAmount) || 0;
    const unlockAmt = parseFloat(s.unlockAmount) || 0;
    const nowSec = Date.now() / 1000;
    const unlockWaitSeconds = registrar?.unlockWaitSeconds ?? null;
    const unlockWaitDaysLabel = unlockWaitSeconds ? Math.max(1, Math.round(unlockWaitSeconds / 86400)) + '-day' : 'on-chain';
    const unlockWaitNote =
      'Unlocking has a real ' + unlockWaitDaysLabel + ' on-chain wait once requested — this is enforced by the program, not a UI suggestion.';
    const unlockCountdown =
      locker.pendingUnlock > 0
        ? locker.unlockAvailableAt > nowSec
          ? 'available in ' + Math.max(1, Math.ceil((locker.unlockAvailableAt - nowSec) / 86400)) + 'd'
          : 'available now'
        : null;
    const lockerStatusNote =
      'Locked ' +
      fmt(toShareUi(locker.amountLocked), 2) +
      ' · Pending unlock ' +
      fmt(toShareUi(locker.pendingUnlock), 2) +
      (unlockCountdown ? ' (' + unlockCountdown + ')' : '');

    const lockDisabled = !walletConnected || !(lockAmt > 0);
    const requestUnlockDisabled = !walletConnected || !(unlockAmt > 0) || locker.amountLocked <= 0;
    const cancelUnlockDisabled = !walletConnected || !(unlockAmt > 0) || locker.pendingUnlock <= 0;
    const withdrawDisabled = !walletConnected || !(locker.pendingUnlock > 0) || locker.unlockAvailableAt > nowSec;

    const lockSharesAction = async () => {
      if (lockDisabled) return;
      const wasFirstLock = locker.amountLocked <= 0;
      const sig = await wallet.lockShares(lockAmt);
      if (!sig) return;
      patch((cur) => ({ lockAmount: '', delegatePrompt: wasFirstLock ? true : cur.delegatePrompt }));
      showToast('Locked ' + lockAmt + ' shares for voting power.');
      await refreshMemberReads();
    };

    const requestUnlockAction = async () => {
      if (requestUnlockDisabled) return;
      const sig = await wallet.requestUnlock(unlockAmt);
      if (!sig) return;
      patch({ unlockAmount: '' });
      showToast('Unlock requested for ' + unlockAmt + ' shares.');
      await refreshMemberReads();
    };

    const cancelUnlockAction = async () => {
      if (cancelUnlockDisabled) return;
      const sig = await wallet.cancelUnlock(unlockAmt);
      if (!sig) return;
      patch({ unlockAmount: '' });
      showToast('Cancelled unlock for ' + unlockAmt + ' shares.');
      await refreshMemberReads();
    };

    const withdrawUnlockedAction = async () => {
      if (withdrawDisabled) return;
      const sig = await wallet.withdrawUnlocked();
      if (!sig) return;
      showToast('Withdrew unlocked shares.');
      await refreshMemberReads();
    };

    return {
      state: s,
      patch,
      vaultName: PROPS.vaultName,
      vaultSource: vaultSnapshot.source,
      vaultHistory,
      refreshVault,
      goPortfolio: setTab('portfolio'),
      goGovernance: setTab('governance'),
      goAnalysts: setTab('analysts'),
      goPosition: setTab('position'),

      // vault stats
      NAV,
      navFmt: usdPrecise(NAV),
      sharePriceFmt: sharePrice.toFixed(3) + ' USDC',
      userValueFmt: usdPrecise(userValue),
      sharesFmt: fmt(userShares, 6),
      ownershipFmt: ownership.toFixed(2) + '%',
      usdcFmt: fmt(s.walletUsdc),
      treasuryFmt: usdPrecise(s.treasury),
      treasuryPctFmt: ((s.treasury / NAV) * 100).toFixed(1) + '%',
      userPnlFmt: (userPnl >= 0 ? '+' : '−') + usd(Math.abs(userPnl)),
      // Real voting power (Requirement 4): VoterWeightRecord.voter_weight is a
      // LOCKED-share count, not share×price — zero until shares are locked.
      votingPowerFmt: fmt(toShareUi(voterWeight.voterWeight), 2),
      topHoldings,
      tokenRows,
      allocation,
      allocActive,
      allocLeave: () => patch({ allocHover: null }),
      executions: s.executions,

      // governance
      proposals,
      isDelegated,
      delegatedToName: isDelegated ? shortAddress(locker.delegate) : '',
      delegationLocked,
      lockDaysLeft,
      govStatusNote: isDelegated
        ? 'Delegated to ' + shortAddress(locker.delegate)
        : 'You vote on every proposal',
      // Decision #12: reworded — `set_delegate` has no on-chain time-gate, so
      // this is a stability suggestion, never a claim of enforcement.
      lockBannerNote: cooldownActive
        ? 'You switched delegates recently — for governance stability we suggest waiting ' +
          days(cooldownDaysLeft) +
          ', though you can change it on-chain anytime.'
        : 'You can switch or revoke at any time — changes take effect immediately on-chain.',
      revokeDelegation,

      // lock / unlock voting power (decision #11)
      lockerStatusNote,
      unlockWaitNote,
      lockDisabled,
      requestUnlockDisabled,
      cancelUnlockDisabled,
      withdrawDisabled,
      lockSharesAction,
      requestUnlockAction,
      cancelUnlockAction,
      withdrawUnlockedAction,

      // create proposal
      actionTabs,
      protocolChips,
      curAction,
      npToken: s.npToken,
      npTk,
      npAmt,
      availableLiquidityLabel,
      availableOrderValueFmt: usdPrecise(availableOrderValue),
      hasSufficientOrderLiquidity: npAmt <= availableOrderValue,
      submitDisabled,
      submitProposal,
      createHint,
      thesisOk,
      meetsThreshold,
      thresholdFmt: threshold + '%',
      ownershipPctFmt: realVotingPowerPct.toFixed(2) + '%',
      previewUnits: npAmt ? fmt(npAmt / npTk.price, 2) : '0',
      previewPrice: usd(npTk.price),
      previewRoute: PROTOCOLS[curProto].name + ' → best DEX',
      npAmountFmt: npAmt ? usd(npAmt) : '$0',
      votingDaysLabel: s.votingDays + ' days',

      // delegation
      analysts,
      ad,
      poolDist,
      analystPoolFmt: usd(Math.round(analystPool)),
      poolMgmtFmt: usd(Math.round(feeMgmt)),
      poolPerfFmt: usd(Math.round(FEE_PERF)),
      poolShareNote: ANALYST_POOL_SHARE * 100 + '% of protocol fees',
      selfPanel: {
        isAnalyst: isSelfAnalyst,
        rewardsYrFmt: usd(Math.round(rewardOf(ownAddress))),
        accruedFmt: usd(0),
        delegatorsFmt: '—',
        delegatedFmt: usdCompact(0),
        sharePct: (isSelfAnalyst ? shareOf(ownAddress) : 0).toFixed(1) + '%',
      },
      becomeAnalyst: async () => {
        if (!wallet?.canDeposit || !wallet?.address) {
          showToast('Connect a Solana wallet to register as an analyst.');
          return;
        }
        const sig = await wallet.registerAnalyst();
        if (!sig) return;
        showToast('You are now a registered Tribe analyst.');
        await Promise.all([refreshMemberReads(), refreshGovernance()]);
      },
      dpStatusLabel: isDelegated ? shortAddress(locker.delegate) : 'Direct voting',
      dpStatusNote: isDelegated
        ? cooldownActive
          ? 'Recently switched · consider waiting ' + days(cooldownDaysLeft) + ' · you can still change anytime'
          : 'You can switch or revoke anytime'
        : 'You vote on every proposal yourself',

      // deposit / redeem
      depositDisabled,
      confirmDeposit,
      depositSharesFmt: fmt(depAmt / sharePrice, 2),
      redeemSharesFmt: fmt(redeemShares),
      redeemValueFmt: usd(redeemValue),
      isUsdc,
      redeemUsdcOut: fmt(redeemValue * (1 - SLIPPAGE), 2),
      slippageFmt: (SLIPPAGE * 100).toFixed(1) + '%',
      redeemBreakdown,
      confirmRedeem,

      // post-lock delegate prompt (shown after a member's first confirmed lock,
      // decision #10/#11: truncated address + derived stats, no fabricated name)
      delegateOptions: analystDirectory.map((a) => ({
        key: a.analyst,
        initials: a.analyst.slice(0, 2).toUpperCase(),
        name: shortAddress(a.analyst),
        record: a.proposalsPassed + ' of ' + a.proposalsCreated + ' proposals passed',
        stakeFmt: fmt(a.stake / 1e9, 3) + ' SOL staked',
        choose: chooseDelegate(a.analyst),
      })),
      keepDirectVoting: () => {
        patch({ delegatePrompt: false });
        showToast('You’ll vote on every proposal yourself. Delegate anytime from the Delegation tab.');
      },
      closeDelegatePrompt: () => patch({ delegatePrompt: false }),

      // wallet
      walletConnected,
      walletAddress: wallet?.address ?? null,
    };
  }, [
    rawState,
    patch,
    showToast,
    wallet,
    walletShares,
    vaultSnapshot,
    vaultHistory,
    refreshVault,
    governanceSnapshot,
    voterWeight,
    maxVoterWeight,
    locker,
    analystRecord,
    registrar,
    refreshGovernance,
    refreshMemberReads,
  ]);
}
