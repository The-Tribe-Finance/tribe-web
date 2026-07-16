import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ACCRUED,
  ACTIONS,
  ACTION_PROTOS,
  ANALYST_NAMES,
  ANALYST_POOL_SHARE,
  FEE_PERF,
  INITIAL_STATE,
  LOCK_DAYS,
  LOCK_MS,
  MARGIN_MIN_PCT,
  PROTOCOLS,
  RAW_ANALYSTS,
  SLIPPAGE,
  TOKENS,
  YES_MIN_PCT,
  fmt,
  navOf,
  parseTVL,
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

const PROPS = {
  vaultName: 'Tribe DAO',
  startDelegated: true,
  proposalThresholdPct: 1,
};

export default function App() {
  const [state, setState] = useState(() => ({
    ...INITIAL_STATE,
    delegatedTo: PROPS.startDelegated ? 'minh' : null,
  }));
  const [vaultSnapshot, setVaultSnapshot] = useState(emptyVaultSnapshot);
  const [vaultHistory, setVaultHistory] = useState([]);
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

  const vals = useDerived(state, patch, showToast, wallet, vaultSnapshot, vaultHistory, refreshVault);

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
function useDerived(rawState, patch, showToast, wallet, vaultSnapshot, vaultHistory, refreshVault) {
  return useMemo(() => {
    // On-chain balances are authoritative. A failed RPC intentionally displays zeros.
    const s = { ...rawState, treasury: vaultSnapshot.treasury, totalShares: vaultSnapshot.totalShares, holdings: vaultSnapshot.holdings };
    const setTab = (tab) => () => patch({ tab });

    const isDelegated = !!s.delegatedTo;
    const lockUntil = s.delegatedAt ? s.delegatedAt + LOCK_MS : 0;
    const delegationLocked = isDelegated && lockUntil > Date.now();
    const lockDaysLeft = delegationLocked ? Math.ceil((lockUntil - Date.now()) / 86400000) : 0;
    const days = (n) => n + ' day' + (n === 1 ? '' : 's');

    const NAV = s.holdings.reduce((total, h) => total + h.qty * (vaultSnapshot.prices[h.sym] || 0), s.treasury);
    const activePower = NAV;
    const sharePrice = s.totalShares > 0 ? NAV / s.totalShares : 0;
    const userValue = s.userShares * sharePrice;
    const ownership = s.totalShares > 0 ? (s.userShares / s.totalShares) * 100 : 0;

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
      priceFmt: '$' + fmt(r.tk.price, 2),
      chgFmt: (r.tk.chg >= 0 ? '+' : '') + r.tk.chg.toFixed(1) + '%',
      chgColor: r.tk.chg >= 0 ? '#3e7d3a' : '#b3452f',
      qtyFmt: fmt(r.qty, r.qty > 0 && r.qty < 0.001 ? 8 : r.qty < 100 ? 3 : 0),
      avgFmt: r.avgCost == null ? '—' : '$' + fmt(r.avgCost, 2),
      valueFmt: usdPrecise(r.value),
      weightFmt: (NAV > 0 ? (r.value / NAV) * 100 : 0).toFixed(1) + '%',
      pnlFmt:
        r.pnl == null ? '—' : (r.pnl >= 0 ? '+' : '−') + usd(Math.abs(r.pnl)) + ' (' + (r.pnlPct >= 0 ? '+' : '') + r.pnlPct.toFixed(1) + '%)',
      pnlColor: r.pnl == null ? '#8a7d63' : r.pnl >= 0 ? '#3e7d3a' : '#b3452f',
    }));
    // Cash is also a real vault holding.  Keep it in the table whenever the
    // reserve is positive, while zero-balance tokens stay hidden.
    if (s.treasury > 0) {
      tokenRows.push({
        sym: 'USDC',
        name: 'Cash reserve',
        swatch: TOKENS.USDC.sw,
        badge: TOKENS.USDC.badge,
        logo: TOKENS.USDC.logo,
        priceFmt: '$1.00',
        chgFmt: '0.0%',
        chgColor: '#8a7d63',
        qtyFmt: fmt(s.treasury, 6),
        avgFmt: '$1.00',
        valueFmt: usdPrecise(s.treasury),
        weightFmt: (NAV > 0 ? (s.treasury / NAV) * 100 : 0).toFixed(1) + '%',
        pnlFmt: '—',
        pnlColor: '#8a7d63',
      });
    }
    const allocSrc = [
      ...holdRows.filter((r) => r.qty > 0).map((r) => ({ sym: r.sym, value: r.value, color: r.tk.sw })),
      ...(s.treasury > 0 ? [{ sym: 'USDC', value: s.treasury, color: TOKENS.USDC.sw }] : []),
    ];
    const ah = s.allocHover;
    let cum = 0;
    const allocation = allocSrc.map((a, i) => {
      const w = (a.value / NAV) * 100;
      const mid = cum + w / 2;
      cum += w;
      const hovered = ah === i;
      return {
        sym: a.sym,
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
    const allocActive = ah != null && allocSrc[ah] ? allocation[ah] : null;

    const topHoldings = holdRows.slice(0, 5).map((r) => ({
      sym: r.sym,
      pct: ((r.value / NAV) * 100).toFixed(2) + '%',
    }));
    const totalPnl = holdRows.reduce((a, r) => a + (r.pnl ?? 0), 0);
    const userPnl = totalPnl * (s.userShares / s.totalShares);

    // ---- proposals ----
    const castVote = (id, side, power) => {
      patch((cur) => ({
        proposals: cur.proposals.map((p) =>
          p.id === id
            ? {
                ...p,
                for: p.for + (side === 'for' ? power : 0),
                against: p.against + (side === 'against' ? power : 0),
              }
            : p,
        ),
        votes: { ...cur.votes, [id]: side },
      }));
      showToast(
        'Voted ' + (side === 'for' ? 'FOR' : 'AGAINST') + ' ' + id + ' with ' + usd(power) + ' of voting power.',
      );
    };

    const proposals = s.proposals.map((p) => {
      const total = p.for + p.against;
      const forPct = total ? Math.round((p.for / total) * 100) : 0;
      const isActive = p.status === 'active';
      const yesPct = activePower > 0 ? (p.for / activePower) * 100 : 0;
      const noPct = activePower > 0 ? (p.against / activePower) * 100 : 0;
      const marginPct = yesPct - noPct;
      const yesMet = yesPct >= YES_MIN_PCT;
      const marginMet = marginPct >= MARGIN_MIN_PCT;
      const passing = yesMet && marginMet;
      const voted = s.votes[p.id];

      let note = null;
      if (isActive && voted) {
        note = 'You voted ' + (voted === 'for' ? 'FOR' : 'AGAINST') + ' with ' + usd(userValue) + ' of voting power.';
      } else if (isActive && isDelegated) {
        note = ANALYST_NAMES[s.delegatedTo] + ' votes on your behalf for this proposal.';
      }

      let timing;
      if (isActive) {
        timing =
          'Voting ends in ' +
          (p.endsInDays != null ? p.endsInDays : p.votingDays || 5) +
          ' days · via ' +
          (p.protocol || 'Jupiter');
      } else if (p.status === 'executed') {
        timing = 'Executed via ' + (p.route || 'Jupiter') + ' · ' + (p.date || '');
      } else {
        timing = 'Closed ' + (p.date || '');
      }

      return {
        id: p.id,
        kind: p.kind,
        title: p.title,
        summary: p.summary,
        analyst: p.analyst,
        status: p.status,
        timing,
        statusLabel: isActive ? 'Active' : p.status === 'executed' ? 'Executed' : 'Rejected',
        forPct,
        againstPct: total ? 100 - forPct : 0,
        forFmt: usd(p.for),
        againstFmt: usd(p.against),
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
          : p.status === 'executed'
            ? 'Passed'
            : 'Did not pass',
        passOk: isActive ? passing : p.status === 'executed',
        showVoteButtons: isActive && !isDelegated && !voted,
        note,
        voteFor: () => castVote(p.id, 'for', userValue),
        voteAgainst: () => castVote(p.id, 'against', userValue),
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
    const meetsThreshold = ownership >= threshold;
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
        '% of voting power to open a proposal. You currently hold ' +
        ownership.toFixed(2) +
        '% — deposit more or ask a larger holder to sponsor this idea.';
    }

    const submitProposal = () => {
      if (submitDisabled) return;
      const id = 'TRB-0' + s.nextId;
      const isBuy = curAction === 'buy';
      const proto = PROTOCOLS[curProto];
      const title = (isBuy ? 'Buy ' : 'Sell ') + usd(npAmt) + ' of ' + s.npToken + ' (' + npTk.name + ')';
      const np = {
        id,
        kind: ACTIONS[curAction].kind,
        token: s.npToken,
        amountUsd: npAmt,
        title,
        summary: s.npThesis.trim(),
        analyst: 'You',
        status: 'active',
        for: 0,
        against: 0,
        protocol: proto.name,
        votingDays: s.votingDays,
        endsInDays: s.votingDays,
      };
      patch((cur) => ({
        proposals: [np, ...cur.proposals],
        nextId: cur.nextId + 1,
        npAmount: '',
        npThesis: '',
        tab: 'governance',
      }));
      showToast('Proposal ' + id + ' created — open for voting.');
    };

    // ---- analysts + rewards pool ----
    const toggleDelegate = (key) => (e) => {
      e?.stopPropagation?.();
      if (s.delegatedTo === key) {
        if (delegationLocked) {
          showToast('Delegation is locked — ' + days(lockDaysLeft) + ' before you can revoke.');
          return;
        }
        patch({ delegatedTo: null, delegatedAt: null });
        showToast('Delegation revoked — you now vote directly.');
        return;
      }
      if (isDelegated && delegationLocked) {
        showToast('Locked — you can switch analysts in ' + days(lockDaysLeft) + '.');
        return;
      }
      patch({ delegatedTo: key, delegatedAt: Date.now() });
      showToast('Voting power delegated to ' + ANALYST_NAMES[key] + ' — locked for ' + LOCK_DAYS + ' days.');
    };

    const feeMgmt = NAV * 0.005;
    const analystPool = (feeMgmt + FEE_PERF) * ANALYST_POOL_SHARE;
    const poolMembers = RAW_ANALYSTS.map((a) => ({ key: a.key, name: a.name, tvlNum: parseTVL(a.tvl) }));
    if (s.isAnalyst) poolMembers.push({ key: 'self', name: 'You', tvlNum: s.selfDelegatedTVL });
    const totalDelegatedTVL = poolMembers.reduce((acc, m) => acc + m.tvlNum, 0) || 1;
    const shareOf = (key) => {
      const m = poolMembers.find((x) => x.key === key);
      return m ? (m.tvlNum / totalDelegatedTVL) * 100 : 0;
    };
    const rewardOf = (key) => (analystPool * shareOf(key)) / 100;

    const poolDist = poolMembers.map((m) => ({
      name: m.name,
      self: m.key === 'self',
      sharePct: shareOf(m.key).toFixed(1) + '%',
      barPct: shareOf(m.key),
      rewardsYrFmt: usd(Math.round(rewardOf(m.key))),
      barColor: m.key === 'self' ? '#c2762e' : '#3e5c2f',
    }));

    const analysts = RAW_ANALYSTS.map((a) => {
      const mine = s.delegatedTo === a.key;
      const disabled = mine ? delegationLocked : isDelegated && delegationLocked;
      return {
        ...a,
        isDelegated: mine,
        disabled,
        lockNote: disabled ? lockDaysLeft + 'd locked' : '',
        rewardsYrFmt: usd(Math.round(rewardOf(a.key))),
        accruedFmt: usd(ACCRUED[a.key] || 0),
        poolSharePct: shareOf(a.key).toFixed(1) + '%',
        openDetail: () => patch({ selectedAnalyst: a.key }),
        toggleDelegate: toggleDelegate(a.key),
      };
    });

    const detail = s.selectedAnalyst ? analysts.find((a) => a.key === s.selectedAnalyst) : null;
    const ad = detail
      ? {
          ...detail,
          history: detail.history.map((h) => ({ ...h, resultColor: h.up ? '#3e7d3a' : '#b3452f' })),
          created: s.proposals.filter((p) => p.analyst === detail.name),
          close: () => patch({ selectedAnalyst: null }),
        }
      : null;

    // ---- deposit / redeem ----
    const depAmt = parseFloat(s.depositAmt) || 0;
    const walletConnected = !!wallet?.connected;
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
        delegatePrompt: !cur.delegatedTo,
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
      sharesFmt: fmt(s.userShares),
      ownershipFmt: ownership.toFixed(2) + '%',
      usdcFmt: fmt(s.walletUsdc),
      treasuryFmt: usdPrecise(s.treasury),
      treasuryPctFmt: ((s.treasury / NAV) * 100).toFixed(1) + '%',
      userPnlFmt: (userPnl >= 0 ? '+' : '−') + usd(Math.abs(userPnl)),
      votingPowerFmt: usd(userValue),
      topHoldings,
      tokenRows,
      allocation,
      allocActive,
      allocLeave: () => patch({ allocHover: null }),
      executions: s.executions,

      // governance
      proposals,
      isDelegated,
      delegatedToName: isDelegated ? ANALYST_NAMES[s.delegatedTo] : '',
      delegationLocked,
      lockDaysLeft,
      govStatusNote: isDelegated
        ? 'Delegated to ' + ANALYST_NAMES[s.delegatedTo]
        : 'You vote on every proposal',
      lockBannerNote: delegationLocked
        ? 'Locked for ' + days(lockDaysLeft) + ' before you can revoke or switch.'
        : 'You can revoke at any time.',
      revokeDelegation: () => toggleDelegate(s.delegatedTo)(),

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
      ownershipPctFmt: ownership.toFixed(2) + '%',
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
        isAnalyst: s.isAnalyst,
        rewardsYrFmt: usd(Math.round(rewardOf('self'))),
        accruedFmt: usd(s.selfAccrued),
        delegatorsFmt: fmt(s.selfDelegators),
        delegatedFmt: usdCompact(s.selfDelegatedTVL),
        sharePct: (s.isAnalyst ? shareOf('self') : 0).toFixed(1) + '%',
      },
      becomeAnalyst: () => {
        patch({ isAnalyst: true, selfDelegatedTVL: 185000, selfDelegators: 3, selfAccrued: 0 });
        showToast('You are now a Tribe analyst — your public profile is live and open to delegations.');
      },
      dpStatusLabel: isDelegated ? ANALYST_NAMES[s.delegatedTo] : 'Direct voting',
      dpStatusNote: isDelegated
        ? delegationLocked
          ? '🔒 Locked · ' + days(lockDaysLeft) + ' left'
          : 'Unlocked · you can switch anytime'
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

      // post-deposit prompt
      delegateOptions: RAW_ANALYSTS.map((a) => ({
        ...a,
        choose: () => {
          patch({ delegatedTo: a.key, delegatedAt: Date.now(), delegatePrompt: false });
          showToast('Delegated your voting power to ' + a.name + '.');
        },
      })),
      keepDirectVoting: () => {
        patch({ delegatedTo: null, delegatePrompt: false });
        showToast('You’ll vote on every proposal yourself. Delegate anytime from Analysts.');
      },
      closeDelegatePrompt: () => patch({ delegatePrompt: false }),

      // wallet
      walletConnected,
      walletAddress: wallet?.address ?? null,
    };
  }, [rawState, patch, showToast, wallet, vaultSnapshot, vaultHistory, refreshVault]);
}
