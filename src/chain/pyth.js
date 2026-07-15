/**
 * Surfpool-only: write fresh fake Pyth prices via the `surfnet_setAccount`
 * cheatcode, so the vault's 60-second staleness check passes at deposit time.
 *
 * Mirrors tests/pyth.ts in the contracts repo byte-for-byte. On a real cluster
 * (devnet/mainnet) prices come from Pyth itself and this is never used.
 */
import { Buffer } from 'buffer';

const DISCRIMINATOR = Buffer.from([34, 241, 35, 99, 157, 126, 244, 205]);
const LEN = 8 + 32 + 2 + 32 + 8 + 8 + 4 + 8 + 8 + 8 + 8 + 8;

function feedIdFor(label) {
  const b = Buffer.alloc(32);
  Buffer.from(label).copy(b);
  return b;
}

function encodePriceUpdate({ feedId, price, conf, expo, publishTime }) {
  const buf = Buffer.alloc(LEN);
  let o = 0;
  DISCRIMINATOR.copy(buf, o);
  o += 8;
  o += 32; // write_authority (unread)
  buf.writeUInt8(0, o); // verification_level = Partial (2 bytes total)
  o += 1;
  buf.writeUInt8(5, o);
  o += 1;
  feedId.copy(buf, o);
  o += 32;
  buf.writeBigInt64LE(price, o);
  o += 8;
  buf.writeBigUInt64LE(conf, o);
  o += 8;
  buf.writeInt32LE(expo, o);
  o += 4;
  buf.writeBigInt64LE(publishTime, o);
  o += 8;
  buf.writeBigInt64LE(publishTime, o); // prev_publish_time
  o += 8;
  buf.writeBigInt64LE(price, o); // ema_price
  o += 8;
  buf.writeBigUInt64LE(conf, o); // ema_conf
  o += 8;
  o += 8; // posted_slot (unread)
  return buf;
}

function healthyPrice(feedId, priceUsd, publishTime) {
  const price = BigInt(Math.round(priceUsd * 1e8));
  return { feedId, price, conf: price / 1000n, expo: -8, publishTime };
}

async function rpc(url, method, params) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${JSON.stringify(j.error)}`);
  return j.result;
}

const CLOCK = 'SysvarC1ock11111111111111111111111111111111';
const RECEIVER = 'rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ';

/**
 * Refresh the surfpool fake oracles to the current chain time. `oracles` is a
 * list of { address, label, priceUsd }. Prices don't need to be accurate for a
 * deposit — only fresh and internally consistent.
 */
export async function refreshSurfpoolOracles(rpcUrl, oracles) {
  const clockAcc = await rpc(rpcUrl, 'getAccountInfo', [
    CLOCK,
    { encoding: 'base64' },
  ]);
  const clockData = Buffer.from(clockAcc.value.data[0], 'base64');
  const now = clockData.readBigInt64LE(32);

  for (const { address, label, priceUsd } of oracles) {
    const data = encodePriceUpdate(healthyPrice(feedIdFor(label), priceUsd, now));
    await rpc(rpcUrl, 'surfnet_setAccount', [
      address,
      {
        lamports: 1_000_000_000,
        data: data.toString('hex'),
        owner: RECEIVER,
        executable: false,
      },
    ]);
  }
}
