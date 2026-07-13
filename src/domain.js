export const TOKENS = {
  AAPLx: { name: 'Apple', price: 228.14, chg: 1.2, sw: '#7d9a5c', badge: 'A' },
  NVDAx: { name: 'NVIDIA', price: 171.62, chg: 2.4, sw: '#3e5c2f', badge: 'N' },
  MSFTx: { name: 'Microsoft', price: 465.2, chg: 0.6, sw: '#a8503a', badge: 'M' },
  GOOGLx: { name: 'Alphabet', price: 191.5, chg: -0.4, sw: '#c2762e', badge: 'G' },
  BTC: { name: 'Bitcoin', price: 118450, chg: 1.8, sw: '#c2b98f', badge: '₿' },
  SOL: { name: 'Solana', price: 214.3, chg: 3.1, sw: '#6a8caf', badge: 'S' },
  TSLAx: { name: 'Tesla', price: 342.1, chg: -1.1, sw: '#b3452f', badge: 'T' },
  AMZNx: { name: 'Amazon', price: 201.8, chg: 0.9, sw: '#8a6a45', badge: 'Z' },
  USDC: { name: 'USD Coin', price: 1, chg: 0, sw: '#e8b544', badge: '$' },
};

export const HWM = 1.291;
export const YES_MIN_PCT = 30;
export const MARGIN_MIN_PCT = 3;
export const LOCK_DAYS = 14;
export const LOCK_MS = LOCK_DAYS * 86400000;
export const SLIPPAGE = 0.001;
export const ANALYST_POOL_SHARE = 0.5;
export const EXECUTED_COUNT = 156;

export const ACTIONS = {
  buy: { label: 'Buy', kind: 'buy' },
  sell: { label: 'Sell', kind: 'sell' },
  lend: { label: 'Lend', kind: 'lend', soon: true },
  stake: { label: 'Stake', kind: 'stake', soon: true },
};

export const PROTOCOLS = {
  jupiter: { name: 'Jupiter', dot: '#c2762e', badge: 'J', live: true },
  kamino: { name: 'Kamino', dot: '#6a8caf', badge: 'K', live: false },
  marginfi: { name: 'MarginFi', dot: '#a8503a', badge: 'M', live: false },
  drift: { name: 'Drift', dot: '#8a6a45', badge: 'D', live: false },
  jito: { name: 'Jito', dot: '#4a6b35', badge: 'Ji', live: false },
  marinade: { name: 'Marinade', dot: '#c2762e', badge: 'Mn', live: false },
};

export const ACTION_PROTOS = {
  buy: ['jupiter'],
  sell: ['jupiter'],
  lend: ['kamino', 'marginfi', 'drift'],
  stake: ['jito', 'marinade'],
};

export const TRADABLE = ['AAPLx', 'NVDAx', 'MSFTx', 'GOOGLx', 'BTC', 'SOL', 'TSLAx', 'AMZNx'];

export const ANALYST_NAMES = { minh: 'Minh Tran', ha: 'Ha Le', david: 'David Chen' };

export const KIND_META = {
  buy: { label: 'BUY', bg: '#e7edda', c: '#3e5c2f' },
  sell: { label: 'SELL', bg: '#f6e3d6', c: '#b3452f' },
  rebalance: { label: 'REBALANCE', bg: '#e3ecec', c: '#365a5a' },
  lend: { label: 'LEND', bg: '#e3ecec', c: '#365a5a' },
  stake: { label: 'STAKE', bg: '#efe6da', c: '#7a5a34' },
  other: { label: 'PROPOSAL', bg: '#efe9d7', c: '#6f6142' },
};

export const STATUS_META = {
  active: { l: 'Active', bg: '#efe9d7', c: '#6f6142' },
  executed: { l: 'Executed', bg: '#e7edda', c: '#3e7d3a' },
  rejected: { l: 'Rejected', bg: '#f1ede2', c: '#8a7d63' },
};

export const ACTION_PREVIEW_META = {
  buy: { bg: '#e7edda', c: '#3e5c2f' },
  sell: { bg: '#f6e3d6', c: '#b3452f' },
  lend: { bg: '#e3ecec', c: '#365a5a' },
  stake: { bg: '#efe6da', c: '#7a5a34' },
};

export const CHART_RANGES = { '30D': 2, '3M': 4, '6M': 7, '12M': 13 };

export const ACCRUED = { minh: 148500, ha: 92400, david: 21800 };
export const FEE_PERF = 412000;

export const RAW_ANALYSTS = [
  {
    key: 'minh',
    name: 'Minh Tran',
    initials: 'MT',
    handle: '@minhquant',
    thesis: 'Momentum + on-chain flows',
    tvl: '$4.2M',
    delegators: '312',
    perf: '+38.4%',
    sharpe: '1.84',
    drawdown: '−12.1%',
    record: '14 of 17 proposals passed',
    bio: 'Quant-driven momentum analyst tracking on-chain flows and earnings momentum across tokenized equities and majors.',
    history: [
      { date: 'Jul 02', action: 'Sell BTC', detail: 'Trimmed 15% after a +41% quarterly run', result: '+$482k realized', up: true },
      { date: 'Jun 05', action: 'Rebalance NVDAx', detail: 'Lifted target weight 25% → 30%', result: '+8.2% since', up: true },
      { date: 'May 14', action: 'Buy SOL', detail: 'Opened a 4% position pre-Firedancer', result: '+22.4%', up: true },
      { date: 'Apr 12', action: 'Buy NVDAx', detail: 'Added on post-earnings strength', result: '+33.7%', up: true },
    ],
  },
  {
    key: 'ha',
    name: 'Ha Le',
    initials: 'HL',
    handle: '@hale_macro',
    thesis: 'Tokenized equities, macro',
    tvl: '$2.7M',
    delegators: '198',
    perf: '+29.1%',
    sharpe: '1.52',
    drawdown: '−9.8%',
    record: '9 of 12 proposals passed',
    bio: 'Macro-led allocator focused on tokenized blue-chip equities and measured, risk-managed scale-ins.',
    history: [
      { date: 'Jun 18', action: 'Buy AAPLx', detail: 'Built core position over two tranches', result: '+11.3%', up: true },
      { date: 'May 27', action: 'Buy MSFTx', detail: 'Initiated on cloud re-acceleration', result: '+8.2%', up: true },
      { date: 'Apr 30', action: 'Sell GOOGLx', detail: 'Trimmed into strength, took profit', result: '+$96k realized', up: true },
    ],
  },
  {
    key: 'david',
    name: 'David Chen',
    initials: 'DC',
    handle: '@dchen',
    thesis: 'High-beta rotations',
    tvl: '$860K',
    delegators: '74',
    perf: '+51.7%',
    sharpe: '1.12',
    drawdown: '−27.5%',
    record: '5 of 11 proposals passed',
    bio: 'High-conviction, high-beta rotations — higher upside, larger drawdowns, sized accordingly by the community.',
    history: [
      { date: 'Jun 21', action: 'MEME basket', detail: 'Proposal rejected by governance', result: 'Not executed', up: false },
      { date: 'May 09', action: 'Buy TSLAx', detail: 'Momentum entry pre-delivery data', result: '−4.1%', up: false },
      { date: 'Mar 28', action: 'Buy BTC', detail: 'Added near cycle lows', result: '+28.8%', up: true },
    ],
  },
];

export const STEPS = [
  { n: '1', title: 'Deposit', body: 'Deposit USDC and receive vault share tokens representing your ownership.', icon: 'pouch' },
  { n: '2', title: 'Choose or Delegate', body: 'Vote on proposals directly or delegate your voting power to trusted analysts.', icon: 'people2' },
  { n: '3', title: 'Proposals & Voting', body: 'Analysts propose trades. A proposal passes at 30% YES with a 3% lead over NO.', icon: 'scrollCheck' },
  { n: '4', title: 'Execute', body: 'Approved proposals are executed via Jupiter Aggregator for best prices.', icon: 'target' },
  { n: '5', title: 'Grow Together', body: 'The portfolio grows. You share the returns proportional to your ownership.', icon: 'mountainFlag' },
];

// ---------- formatters ----------

export const fmt = (n, d) => n.toLocaleString('en-US', { maximumFractionDigits: d ?? 0 });
export const usd = (n) => '$' + fmt(n);

export function usdCompact(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + fmt(n);
}

export function parseTVL(str) {
  const n = parseFloat(String(str).replace(/[$,]/g, ''));
  if (/M/i.test(str)) return n * 1e6;
  if (/K/i.test(str)) return n * 1e3;
  return n;
}

export const signedUsd = (n) => (n >= 0 ? '+' : '−') + usd(Math.abs(n));

/** Net asset value: cash reserve plus the mark-to-market value of every holding. */
export function navOf(state) {
  return state.holdings.reduce((acc, h) => acc + h.qty * TOKENS[h.sym].price, state.treasury);
}

export const INITIAL_STATE = {
  tab: 'home',
  walletUsdc: 25000,
  userShares: 126000,
  totalShares: 9700000,
  treasury: 1245000,
  holdings: [
    { sym: 'NVDAx', qty: 20650, avgCost: 128.4 },
    { sym: 'AAPLx', qty: 10000, avgCost: 205.0 },
    { sym: 'MSFTx', qty: 4075, avgCost: 430.1 },
    { sym: 'GOOGLx', qty: 7860, avgCost: 170.2 },
    { sym: 'BTC', qty: 9.19, avgCost: 92000 },
    { sym: 'SOL', qty: 4185, avgCost: 172.5 },
  ],
  proposals: [
    {
      id: 'TRB-014',
      kind: 'rebalance',
      token: 'SOL',
      amountUsd: 620000,
      title: 'Rebalance: trim NVDAx, open a 5% SOL position',
      summary:
        'NVDAx has run 62% since entry and now exceeds its target band. Thesis: rotate 5% into SOL ahead of the Firedancer mainnet upgrade. Executed as two swaps via Jupiter.',
      analyst: 'Minh Tran',
      status: 'active',
      for: 5423000,
      against: 1082000,
      endsInDays: 3,
    },
    {
      id: 'TRB-013',
      kind: 'buy',
      token: 'TSLAx',
      amountUsd: 150000,
      title: 'Deploy 150,000 USDC into TSLAx',
      summary:
        'Initiate a 1.2% starter position in tokenized Tesla ahead of Q3 delivery numbers. Sized deliberately small; scale-in governed by a follow-up proposal.',
      analyst: 'Ha Le',
      status: 'active',
      for: 2140000,
      against: 1965000,
      endsInDays: 6,
    },
    {
      id: 'TRB-012',
      kind: 'sell',
      token: 'BTC',
      amountUsd: 372540,
      title: 'Take profit: sell part of the BTC position',
      summary:
        'Trim BTC after a 41% quarterly run to restore the 20% target weight. Proceeds held in USDC pending new proposals.',
      analyst: 'Minh Tran',
      status: 'executed',
      for: 7120000,
      against: 890000,
      date: 'Jul 02',
      route: 'Jupiter → Raydium',
    },
    {
      id: 'TRB-011',
      kind: 'other',
      title: 'Allocate 8% to a MEME index basket',
      summary: 'Rejected by governance: outside the vault mandate of blue chips, tokenized stocks and ETFs.',
      analyst: 'David Chen',
      status: 'rejected',
      for: 1240000,
      against: 6435000,
      date: 'Jun 21',
    },
  ],
  executions: [
    { id: 'TRB-012', action: 'Sell part of BTC position', size: '$372,540', route: 'Jupiter → Raydium', date: 'Jul 02' },
    { id: 'TRB-010', action: 'Buy AAPLx', size: '$618,000', route: 'Jupiter → Orca', date: 'Jun 18' },
    { id: 'TRB-009', action: 'Rebalance NVDAx 25→30%', size: '$594,200', route: 'Jupiter → Raydium', date: 'Jun 05' },
    { id: 'TRB-008', action: 'Buy MSFTx', size: '$540,000', route: 'Jupiter → Meteora', date: 'May 27' },
    { id: 'TRB-007', action: 'Buy SOL', size: '$486,300', route: 'Jupiter → Raydium', date: 'May 14' },
    { id: 'TRB-006', action: 'Sell part of GOOGLx', size: '$212,700', route: 'Jupiter → Orca', date: 'Apr 30' },
    { id: 'TRB-005', action: 'Buy NVDAx', size: '$720,000', route: 'Jupiter → Raydium', date: 'Apr 12' },
    { id: 'TRB-004', action: 'Buy BTC', size: '$905,000', route: 'Jupiter → Phoenix', date: 'Mar 28' },
    { id: 'TRB-003', action: 'Rebalance AAPLx 12→15%', size: '$438,900', route: 'Jupiter → Meteora', date: 'Mar 09' },
    { id: 'TRB-002', action: 'Buy GOOGLx', size: '$512,400', route: 'Jupiter → Orca', date: 'Feb 20' },
    { id: 'TRB-001', action: 'Buy SOL', size: '$1,240,000', route: 'Jupiter → Raydium', date: 'Feb 02' },
    { id: 'TRB-000', action: 'Seed vault · buy BTC', size: '$2,100,000', route: 'Jupiter → Raydium', date: 'Jan 15' },
  ],
  selectedAnalyst: null,
  isAnalyst: false,
  selfDelegatedTVL: 0,
  selfDelegators: 0,
  selfAccrued: 0,
  delegatedTo: undefined,
  votes: {},
  depositAmt: '',
  redeemPct: 10,
  redeemMode: 'usdc',
  chartRange: '12M',
  votingDays: 5,
  delegatedAt: null,
  npAction: 'buy',
  npProtocol: 'jupiter',
  npToken: 'AAPLx',
  npAmount: '',
  npThesis: '',
  nextId: 15,
  toast: null,
  delegatePrompt: false,
  walletConnected: false,
  chartHover: null,
  allocHover: null,
};

/** The historical TVL series; the final point tracks live NAV. */
export function tvlSeries(nav) {
  return [
    { label: "Jul '25", tvl: 9980000 },
    { label: "Aug '25", tvl: 10180000 },
    { label: "Sep '25", tvl: 9910000 },
    { label: "Oct '25", tvl: 10620000 },
    { label: "Nov '25", tvl: 10410000 },
    { label: "Dec '25", tvl: 11180000 },
    { label: "Jan '26", tvl: 10860000 },
    { label: "Feb '26", tvl: 11620000 },
    { label: "Mar '26", tvl: 11980000 },
    { label: "Apr '26", tvl: 11720000 },
    { label: "May '26", tvl: 12380000 },
    { label: "Jun '26", tvl: 12540000 },
    { label: "Jul '26", tvl: Math.round(nav) },
  ];
}
