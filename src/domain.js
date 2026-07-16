import { STOCK_LOGOS } from './stockLogos';

export const TOKENS = {
  AAPLx: { name: 'Apple', price: 50.00, chg: -4.0, sw: '#7d9a5c', badge: 'A', logo: STOCK_LOGOS['AAPLx'] },
  NVDAx: { name: 'NVIDIA', price: 87.00, chg: -2.7, sw: '#3e5c2f', badge: 'N', logo: STOCK_LOGOS['NVDAx'] },
  MSFTx: { name: 'Microsoft', price: 124.00, chg: -1.4, sw: '#a8503a', badge: 'M', logo: STOCK_LOGOS['MSFTx'] },
  GOOGLx: { name: 'Alphabet', price: 161.00, chg: -0.1, sw: '#c2762e', badge: 'G', logo: STOCK_LOGOS['GOOGLx'] },
  TSLAx: { name: 'Tesla', price: 198.00, chg: 1.2, sw: '#b3452f', badge: 'T', logo: STOCK_LOGOS['TSLAx'] },
  AMZNx: { name: 'Amazon', price: 235.00, chg: 2.5, sw: '#8a6a45', badge: 'A', logo: STOCK_LOGOS['AMZNx'] },
  METAx: { name: 'Meta', price: 272.00, chg: 3.8, sw: '#6a8caf', badge: 'M', logo: STOCK_LOGOS['METAx'] },
  COINx: { name: 'Coinbase', price: 309.00, chg: -2.9, sw: '#4a6b35', badge: 'C', logo: STOCK_LOGOS['COINx'] },
  MSTRx: { name: 'MicroStrategy', price: 346.00, chg: -1.6, sw: '#9a7d4a', badge: 'M', logo: STOCK_LOGOS['MSTRx'] },
  AMDx: { name: 'AMD', price: 383.00, chg: -0.3, sw: '#5c7d6a', badge: 'A', logo: STOCK_LOGOS['AMDx'] },
  PLTRx: { name: 'Palantir', price: 420.00, chg: 1.0, sw: '#7d9a5c', badge: 'P', logo: STOCK_LOGOS['PLTRx'] },
  SPYx: { name: 'SP500', price: 57.00, chg: 2.3, sw: '#3e5c2f', badge: 'S', logo: STOCK_LOGOS['SPYx'] },
  QQQx: { name: 'Nasdaq', price: 94.00, chg: 3.6, sw: '#a8503a', badge: 'Q', logo: STOCK_LOGOS['QQQx'] },
  NFLXx: { name: 'Netflix', price: 131.00, chg: -3.1, sw: '#c2762e', badge: 'N', logo: STOCK_LOGOS['NFLXx'] },
  CRCLx: { name: 'Circle', price: 168.00, chg: -1.8, sw: '#b3452f', badge: 'C', logo: STOCK_LOGOS['CRCLx'] },
  HOODx: { name: 'Robinhood', price: 205.00, chg: -0.5, sw: '#8a6a45', badge: 'H', logo: STOCK_LOGOS['HOODx'] },
  GLDx: { name: 'Gold', price: 242.00, chg: 0.8, sw: '#6a8caf', badge: 'G', logo: STOCK_LOGOS['GLDx'] },
  JNJx: { name: 'Johnson & Johnson', price: 279.00, chg: 2.1, sw: '#4a6b35', badge: 'J', logo: STOCK_LOGOS['JNJx'] },
  JPMx: { name: 'JPMorgan Chase', price: 316.00, chg: 3.4, sw: '#9a7d4a', badge: 'J', logo: STOCK_LOGOS['JPMx'] },
  WMTx: { name: 'Walmart', price: 353.00, chg: -3.3, sw: '#5c7d6a', badge: 'W', logo: STOCK_LOGOS['WMTx'] },
  ORCLx: { name: 'Oracle', price: 390.00, chg: -2.0, sw: '#7d9a5c', badge: 'O', logo: STOCK_LOGOS['ORCLx'] },
  KOx: { name: 'Coca-Cola', price: 427.00, chg: -0.7, sw: '#3e5c2f', badge: 'K', logo: STOCK_LOGOS['KOx'] },
  PGx: { name: 'Procter & Gamble', price: 64.00, chg: 0.6, sw: '#a8503a', badge: 'P', logo: STOCK_LOGOS['PGx'] },
  CSCOx: { name: 'Cisco', price: 101.00, chg: 1.9, sw: '#c2762e', badge: 'C', logo: STOCK_LOGOS['CSCOx'] },
  PEPx: { name: 'PepsiCo', price: 138.00, chg: 3.2, sw: '#b3452f', badge: 'P', logo: STOCK_LOGOS['PEPx'] },
  MRKx: { name: 'Merck', price: 175.00, chg: -3.5, sw: '#8a6a45', badge: 'M', logo: STOCK_LOGOS['MRKx'] },
  AVGOx: { name: 'Broadcom', price: 212.00, chg: -2.2, sw: '#6a8caf', badge: 'A', logo: STOCK_LOGOS['AVGOx'] },
  MCDx: { name: 'McDonald\'s', price: 249.00, chg: -0.9, sw: '#4a6b35', badge: 'M', logo: STOCK_LOGOS['MCDx'] },
  CVXx: { name: 'Chevron', price: 286.00, chg: 0.4, sw: '#9a7d4a', badge: 'C', logo: STOCK_LOGOS['CVXx'] },
  LLYx: { name: 'Eli Lilly', price: 323.00, chg: 1.7, sw: '#5c7d6a', badge: 'L', logo: STOCK_LOGOS['LLYx'] },
  ABTx: { name: 'Abbott', price: 360.00, chg: 3.0, sw: '#7d9a5c', badge: 'A', logo: STOCK_LOGOS['ABTx'] },
  ABBVx: { name: 'AbbVie', price: 397.00, chg: -3.7, sw: '#3e5c2f', badge: 'A', logo: STOCK_LOGOS['ABBVx'] },
  BACx: { name: 'Bank of America', price: 434.00, chg: -2.4, sw: '#a8503a', badge: 'B', logo: STOCK_LOGOS['BACx'] },
  // Exact mint + artwork are verified against Jupiter's token registry.
  // These are Solana-wrapped representations, not native Bitcoin/Ethereum.
  WBTC: { name: 'Wrapped BTC (Portal)', price: 0, chg: 0, sw: '#f7931a', badge: '₿', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png' },
  ETH: { name: 'Ether (Portal)', price: 0, chg: 0, sw: '#627eea', badge: 'Ξ', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png' },
  SOL: { name: 'Solana', price: 214.3, chg: 3.1, sw: '#6a8caf', badge: 'S', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
  JUP: { name: 'Jupiter', price: 0, chg: 0, sw: '#8d78f2', badge: 'J', logo: 'https://static.jup.ag/jup/icon.png' },
  JitoSOL: { name: 'Jito Staked SOL', price: 0, chg: 0, sw: '#35a8b6', badge: 'J', logo: 'https://storage.googleapis.com/token-metadata/JitoSOL-256.png' },
  mSOL: { name: 'Marinade Staked SOL', price: 0, chg: 0, sw: '#f08a5d', badge: 'm', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png' },
  PYTH: { name: 'Pyth Network', price: 0, chg: 0, sw: '#7f5af0', badge: 'P', logo: 'https://pyth.network/token.svg' },
  RENDER: { name: 'Render Token', price: 0, chg: 0, sw: '#d9524f', badge: 'R', logo: 'https://shdw-drive.genesysgo.net/5zseP54TGrcz9C8HdjZwJJsZ6f3VbP11p1abwKWGykZH/rndr.png' },
  HYPE: { name: 'HYPE', price: 0, chg: 0, sw: '#47b8a1', badge: 'H', logo: 'https://arweave.net/QBRdRop8wI4PpScSRTKyibv-fQuYBua-WOvC7tuJyJo' },
  wXRP: { name: 'Wrapped XRP', price: 0, chg: 0, sw: '#252a34', badge: 'X', logo: 'https://cdn.prod.website-files.com/61a0a50381fdccb6c37927e5/692521b55b7c02a5da964dc3_wXRP-token-logo.svg' },
  USDe: { name: 'Ethena USDe', price: 1, chg: 0, sw: '#4a9970', badge: 'U', logo: 'https://arweave.net/qeSnRm_FIyp_khPfmg8o1zQeGO4AczDaEKe8jEUOzL4' },
  USDC: { name: 'USD Coin', price: 1, chg: 0, sw: '#2775ca', badge: '$', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
  USDT: { name: 'Tether USD', price: 1, chg: 0, sw: '#26a17b', badge: '₮', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png' },
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
  jupiter: { name: 'Jupiter', dot: '#c2762e', badge: 'J', icon: 'https://static.jup.ag/jup/icon.png', live: true },
  kamino: { name: 'Kamino', dot: '#6a8caf', badge: 'K', icon: 'https://kamino.com/favicon.ico', live: false },
  marginfi: { name: 'MarginFi', dot: '#a8503a', badge: 'M', icon: 'https://app.marginfi.com/favicon.ico', live: false },
  drift: { name: 'Drift', dot: '#8a6a45', badge: 'D', icon: 'https://app.drift.trade/favicon.ico', live: false },
  jito: { name: 'Jito', dot: '#4a6b35', badge: 'Ji', icon: 'https://www.jito.network/jito-black.svg', live: false },
  marinade: { name: 'Marinade', dot: '#c2762e', badge: 'Mn', icon: 'https://app.marinade.finance/favicon.ico', live: false },
};

export const ACTION_PROTOS = {
  buy: ['jupiter'],
  sell: ['jupiter'],
  lend: ['kamino', 'marginfi', 'drift'],
  stake: ['jito', 'marinade'],
};

export const XSTOCKS = ['AAPLx', 'NVDAx', 'MSFTx', 'GOOGLx', 'TSLAx', 'AMZNx', 'METAx', 'COINx', 'MSTRx', 'AMDx', 'PLTRx', 'SPYx', 'QQQx', 'NFLXx', 'CRCLx', 'HOODx', 'GLDx', 'JNJx', 'JPMx', 'WMTx', 'ORCLx', 'KOx', 'PGx', 'CSCOx', 'PEPx', 'MRKx', 'AVGOx', 'MCDx', 'CVXx', 'LLYx', 'ABTx', 'ABBVx', 'BACx'];
export const CORE_CRYPTO = ['WBTC', 'ETH', 'SOL', 'JitoSOL', 'mSOL', 'JUP', 'RENDER', 'PYTH', 'HYPE', 'wXRP'];
export const STABLECOINS = ['USDC', 'USDT', 'USDe'];
export const INDEX_TOKENS = ['SPYx', 'QQQx', 'GLDx'];

// The contract's approved xStock mints. Keeping the mint alongside UI metadata
// makes address search deterministic and prevents a similarly named token from
// appearing as a valid proposal target.
export const TOKEN_MINTS = {
  WBTC: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
  // Ether (Portal) is the liquid Solana representation routed by Jupiter.
  ETH: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
  SOL: 'So11111111111111111111111111111111111111112',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  JitoSOL: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  RENDER: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
  HYPE: '98sMhvDwXj1RQi5c5Mndm3vPe9cBqPrbLaufMXFNMh5g',
  wXRP: '6UpQcMAb5xMzxc7ZfPaVMgx3KqsvKZdT5U718BzD5We2',
  USDe: 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  AAPLx: 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp', NVDAx: 'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh',
  MSFTx: 'XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX', GOOGLx: 'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN',
  TSLAx: 'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB', AMZNx: 'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg',
  METAx: 'Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu', COINx: 'Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu',
  MSTRx: 'XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ', AMDx: 'XsXcJ6GZ9kVnjqGsjBnktRcuwMBmvKWh8S93RefZ1rF',
  PLTRx: 'XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4', SPYx: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W',
  QQQx: 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ', NFLXx: 'XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL',
  CRCLx: 'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1', HOODx: 'XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg',
  GLDx: 'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re', JNJx: 'XsGVi5eo1Dh2zUpic4qACcjuWGjNv8GCt3dm5XcX6Dn',
  JPMx: 'XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C', WMTx: 'Xs151QeqTCiuKtinzfRATnUESM2xTU6V9Wy8Vy538ci',
  ORCLx: 'XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL', KOx: 'XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ',
  PGx: 'XsYdjDjNUygZ7yGKfQaB6TxLh2gC6RRjzLtLAGJrhzV', CSCOx: 'Xsr3pdLQyXvDJBFgpR5nexCEZwXvigb8wbPYp4YoNFf',
  PEPx: 'Xsv99frTRUeornyvCfvhnDesQDWuvns1M852Pez91vF', MRKx: 'XsnQnU7AdbRZYe2akqqpibDdXjkieGFfSkbkjX1Sd1X',
  AVGOx: 'XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo', MCDx: 'XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2',
  CVXx: 'XsNNMt7WTNA2sV3jrb1NNfNgapxRF5i4i6GcnTRRHts', LLYx: 'Xsnuv4omNoHozR6EEW5mXkw8Nrny5rB3jVfLqi6gKMH',
  ABTx: 'XsHtf5RpxsQ7jeJ9ivNewouZKJHbPxhPoEy6yYvULr7', ABBVx: 'XswbinNKyPmzTa5CskMbCPvMW6G5CMnZXZEeQSSQoie',
  BACx: 'XswsQk4duEQmCbGzfqUUWYmi7pV7xpJ9eEmLHXCaEQP',
};

// Tribe-defined categories: intended for investment suitability, not short-term
// volume or social momentum. Every symbol is an explicit candidate, never a
// free-form token discovery result.
export const TOKEN_CATEGORIES = {
  top: [...CORE_CRYPTO, ...STABLECOINS, 'AAPLx', 'NVDAx', 'SPYx', 'QQQx'],
  crypto: CORE_CRYPTO,
  stable: STABLECOINS,
  indices: INDEX_TOKENS,
  stocks: XSTOCKS.filter((symbol) => !INDEX_TOKENS.includes(symbol)),
};

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

// Each range has a calendar window and a reporting cadence.  Values are only
// plotted after the browser has observed them from the vault; this avoids
// presenting a few seconds of local polling as months of performance.
export const CHART_RANGES = {
  '24H': { durationMs: 24 * 60 * 60 * 1000, bucket: 'sample', caption: 'Live vault snapshots (last 24 hours)' },
  '7D': { days: 7, bucket: 'day', caption: 'Daily vault snapshots' },
  '30D': { days: 30, bucket: 'day', caption: 'Daily vault snapshots' },
  '3M': { days: 92, bucket: 'week', caption: 'Weekly vault snapshots' },
  '6M': { days: 183, bucket: 'month', caption: 'Monthly vault snapshots' },
  '12M': { days: 366, bucket: 'month', caption: 'Monthly vault snapshots' },
};

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
      { date: 'Jul 02', action: 'Sell WBTC', detail: 'Trimmed 15% after a +41% quarterly run', result: '+$482k realized', up: true },
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
      { date: 'Mar 28', action: 'Buy WBTC', detail: 'Added near cycle lows', result: '+28.8%', up: true },
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
export const usdPrecise = (n) =>
  Math.abs(n) > 0 && Math.abs(n) < 1 ? '$' + n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '') : usd(n);

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
    { sym: 'WBTC', qty: 9.19, avgCost: 92000 },
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
      token: 'WBTC',
      amountUsd: 372540,
      title: 'Take profit: sell part of the WBTC position',
      summary:
        'Trim WBTC after a 41% quarterly run to restore the 20% target weight. Proceeds held in USDC pending new proposals.',
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
    { id: 'TRB-012', action: 'Sell part of WBTC position', size: '$372,540', route: 'Jupiter → Raydium', date: 'Jul 02' },
    { id: 'TRB-010', action: 'Buy AAPLx', size: '$618,000', route: 'Jupiter → Orca', date: 'Jun 18' },
    { id: 'TRB-009', action: 'Rebalance NVDAx 25→30%', size: '$594,200', route: 'Jupiter → Raydium', date: 'Jun 05' },
    { id: 'TRB-008', action: 'Buy MSFTx', size: '$540,000', route: 'Jupiter → Meteora', date: 'May 27' },
    { id: 'TRB-007', action: 'Buy SOL', size: '$486,300', route: 'Jupiter → Raydium', date: 'May 14' },
    { id: 'TRB-006', action: 'Sell part of GOOGLx', size: '$212,700', route: 'Jupiter → Orca', date: 'Apr 30' },
    { id: 'TRB-005', action: 'Buy NVDAx', size: '$720,000', route: 'Jupiter → Raydium', date: 'Apr 12' },
    { id: 'TRB-004', action: 'Buy WBTC', size: '$905,000', route: 'Jupiter → Phoenix', date: 'Mar 28' },
    { id: 'TRB-003', action: 'Rebalance AAPLx 12→15%', size: '$438,900', route: 'Jupiter → Meteora', date: 'Mar 09' },
    { id: 'TRB-002', action: 'Buy GOOGLx', size: '$512,400', route: 'Jupiter → Orca', date: 'Feb 20' },
    { id: 'TRB-001', action: 'Buy SOL', size: '$1,240,000', route: 'Jupiter → Raydium', date: 'Feb 02' },
    { id: 'TRB-000', action: 'Seed vault · buy WBTC', size: '$2,100,000', route: 'Jupiter → Raydium', date: 'Jan 15' },
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
  chartRange: '30D',
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

/**
 * Only render samples the client actually read from the vault. We intentionally
 * do not fabricate month labels for a local vault with no imported history.
 */
export function tvlSeries(nav, samples = [], range = '30D') {
  const config = CHART_RANGES[range] || CHART_RANGES['30D'];
  const now = new Date();
  const cutoff = config.durationMs
    ? new Date(now.getTime() - config.durationMs)
    : new Date(now);
  if (!config.durationMs) {
    cutoff.setDate(cutoff.getDate() - (config.days - 1));
    cutoff.setHours(0, 0, 0, 0);
  }

  const startOfWeek = (date) => {
    const start = new Date(date);
    const offset = (start.getDay() + 6) % 7; // Monday as the start of the week.
    start.setDate(start.getDate() - offset);
    start.setHours(0, 0, 0, 0);
    return start;
  };
  const bucketFor = (at) => {
    const date = new Date(at);
    if (config.bucket === 'sample') return date;
    if (config.bucket === 'week') return startOfWeek(date);
    if (config.bucket === 'month') return new Date(date.getFullYear(), date.getMonth(), 1);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  const labelFor = (date) => {
    if (config.bucket === 'sample') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (config.bucket === 'month') return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (config.bucket === 'week') return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const buckets = new Map();
  samples
    .filter((sample) => Number.isFinite(sample?.at) && Number.isFinite(sample?.tvl) && sample.at >= cutoff.getTime())
    .sort((a, b) => a.at - b.at)
    .forEach((sample) => {
      const date = bucketFor(sample.at);
      buckets.set(date.getTime(), { at: date.getTime(), label: labelFor(date), tvl: sample.tvl });
    });

  if (!buckets.size) {
    const date = bucketFor(now);
    return [{ at: date.getTime(), label: labelFor(date), tvl: nav }];
  }
  return [...buckets.values()].sort((a, b) => a.at - b.at);
}
