// Portfolio valuation, Solana RPC reads, Jupiter pricing and snapshot storage
// belong to tribe-api. The browser only consumes the public read model.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787').replace(/\/$/, '');

export const emptyVaultSnapshot = () => ({
  treasury: 0, totalShares: 0, holdings: [], prices: {}, changes: {},
  source: 'unavailable', priceSource: 'unavailable', history: [],
});

export async function fetchVaultSnapshot() {
  try {
    const response = await fetch(`${API_BASE}/v1/vault/portfolio`);
    if (!response.ok) throw new Error(`portfolio API returned ${response.status}`);
    const portfolio = await response.json();
    if (!Array.isArray(portfolio.holdings) || !Array.isArray(portfolio.history)) throw new Error('invalid portfolio response');
    return portfolio;
  } catch (error) {
    console.warn('Portfolio API unavailable; rendering zero balances.', error);
    return emptyVaultSnapshot();
  }
}
