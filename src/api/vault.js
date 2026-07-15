import { TOKEN_MINTS } from '../domain';

// Read-only Solana RPC client. No wallet key or admin authority is exposed here.
const RPC = import.meta.env.VITE_SOLANA_RPC || 'http://127.0.0.1:8899';
const PROGRAM_ID = '7JVBNNDs9uKgYYuJ3wPqdBSjtnNgV6s3pjxZ83QMmhVs';
const VAULT = 'HPxEsEgASVvDXdfaN3hQKjH2Aq3C7DunqaQk95t2JHHv';
const ASSET_SIZE = 221;
// One source of truth: proposal search, balance decoding, and price lookup use
// the same canonical mint mapping.
const SYMBOLS = Object.fromEntries(Object.entries(TOKEN_MINTS).map(([symbol, mint]) => [mint, symbol]));
const USD_STABLES = new Set(['USDC', 'USDT']);

export const emptyVaultSnapshot = () => ({ treasury: 0, totalShares: 0, holdings: [], prices: {}, changes: {}, source: 'unavailable', priceSource: 'unavailable' });

async function rpc(method, params) {
  const response = await fetch(RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const body = await response.json();
  if (!response.ok || body.error) throw new Error(body.error?.message || `${method} failed`);
  return body.result;
}
function bytes(base64) { const raw = atob(base64); return Uint8Array.from(raw, (c) => c.charCodeAt(0)); }
function u64(data, offset) { return data.length >= offset + 8 ? Number(new DataView(data.buffer, data.byteOffset, data.byteLength).getBigUint64(offset, true)) : 0; }
function base58(data) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; const digits = [0];
  for (const byte of data) { let carry = byte; for (let i = 0; i < digits.length; i += 1) { carry += digits[i] * 256; digits[i] = carry % 58; carry = Math.floor(carry / 58); } while (carry) { digits.push(carry % 58); carry = Math.floor(carry / 58); } }
  let zeros = ''; for (const byte of data) { if (byte === 0) zeros += '1'; else break; }
  return zeros + digits.reverse().map((digit) => alphabet[digit]).join('');
}

/**
 * Jupiter returns USD prices by mint. This function deliberately has no hard
 * coded market values: missing or rejected prices are reported as zero.
 */
async function fetchPrices(mints) {
  const uniqueMints = [...new Set(mints)].filter(Boolean);
  if (!uniqueMints.length) return { prices: {}, changes: {}, source: 'unavailable' };
  try {
    const response = await fetch(`/api/jupiter/prices?ids=${encodeURIComponent(uniqueMints.join(','))}`);
    if (!response.ok) throw new Error(`price API returned ${response.status}`);
    const body = await response.json();
    const prices = {};
    const changes = {};
    for (const [mint, item] of Object.entries(body)) {
      const symbol = SYMBOLS[mint];
      if (!symbol || !Number.isFinite(item?.usdPrice)) continue;
      prices[symbol] = item.usdPrice;
      changes[symbol] = Number.isFinite(item.priceChange24h) ? item.priceChange24h : 0;
    }
    // USD stablecoins remain a usable $1 reserve if the public API omits them.
    for (const [mint, symbol] of Object.entries(SYMBOLS)) {
      if (USD_STABLES.has(symbol) && !prices[symbol]) prices[symbol] = 1;
    }
    return { prices, changes, source: 'live' };
  } catch (error) {
    console.warn('Jupiter price API unavailable; prices set to zero.', error);
    return { prices: {}, changes: {}, source: 'unavailable' };
  }
}

export async function fetchVaultSnapshot() {
  try {
    const [vault, assets] = await Promise.all([
      rpc('getAccountInfo', [VAULT, { encoding: 'base64', commitment: 'confirmed' }]),
      rpc('getProgramAccounts', [PROGRAM_ID, { encoding: 'base64', filters: [{ dataSize: ASSET_SIZE }, { memcmp: { offset: 8, bytes: VAULT } }] }]),
    ]);
    if (!vault.value?.data?.[0]) throw new Error('vault unavailable');
    const assetInfo = assets.map(({ account }) => {
      const data = bytes(account.data[0]);
      return { mint: base58(data.slice(40, 72)), tokenAccount: base58(data.slice(72, 104)), decimals: data[201] };
    });
    const [tokenAccounts, market] = await Promise.all([
      rpc('getMultipleAccounts', [assetInfo.map((asset) => asset.tokenAccount), { encoding: 'base64', commitment: 'confirmed' }]),
      fetchPrices(Object.keys(SYMBOLS)),
    ]);
    const rows = assetInfo.map((asset, index) => ({
      sym: SYMBOLS[asset.mint] || asset.mint,
      qty: u64(bytes(tokenAccounts.value[index]?.data?.[0] || ''), 64) / 10 ** asset.decimals,
      avgCost: market.prices[SYMBOLS[asset.mint]] || 0,
    }));
    return {
      treasury: rows.find((row) => row.sym === 'USDC')?.qty || 0,
      totalShares: u64(bytes(vault.value.data[0]), 168) / 1e6,
      holdings: rows.filter((row) => row.sym !== 'USDC'),
      prices: market.prices,
      changes: market.changes,
      source: 'live',
      priceSource: market.source,
    };
  } catch (error) {
    console.warn('Vault RPC unavailable; rendering zero balances.', error);
    return emptyVaultSnapshot();
  }
}
