import { useCallback, useEffect, useState } from 'react';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

/**
 * Phantom wallet integration.
 *
 * Connect, disconnect, and a real transaction-signing path against Solana
 * devnet. The vault program is not yet deployed to a public cluster, so the
 * signing helper here sends a minimal on-chain transaction (a 0-lamport
 * self-transfer with a memo-style instruction). It proves the full
 * build → Phantom-sign → send → confirm pipeline end to end; swapping in the
 * real `deposit` instruction is a one-function change once the vault is live.
 */

export const RPC_URL = 'https://api.devnet.solana.com';
const STORAGE_KEY = 'tribe.wallet.connected';

/** Phantom injects `window.phantom.solana` (older builds: `window.solana`). */
function getProvider() {
  if (typeof window === 'undefined') return null;
  const p = window.phantom?.solana ?? window.solana;
  return p?.isPhantom ? p : null;
}

/**
 * The extension injects its provider asynchronously, sometimes after the app
 * has already mounted. Poll briefly so a click that lands early still finds it.
 */
function waitForProvider(timeoutMs = 3000) {
  return new Promise((resolve) => {
    const found = getProvider();
    if (found) return resolve(found);
    const started = Date.now();
    const id = setInterval(() => {
      const p = getProvider();
      if (p || Date.now() - started > timeoutMs) {
        clearInterval(id);
        resolve(p);
      }
    }, 150);
  });
}

export function shortAddress(base58, lead = 4, tail = 4) {
  if (!base58) return '';
  return `${base58.slice(0, lead)}…${base58.slice(-tail)}`;
}

/**
 * Wallet state + actions. Returns everything the UI needs to render a connect
 * button and, later, sign transactions.
 */
export function useWallet(onEvent) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [installed, setInstalled] = useState(false);

  const emit = useCallback(
    (kind, message) => onEvent?.({ kind, message }),
    [onEvent],
  );

  // Detect Phantom (allowing for late injection), wire its account events,
  // and restore a prior session.
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    waitForProvider().then((provider) => {
      if (cancelled) return;
      setInstalled(!!provider);
      if (!provider) return;
      cleanup = attach(provider);
    });

    return () => {
      cancelled = true;
      cleanup();
    };

    function attach(provider) {

    const onConnect = (pk) => setAddress(pk?.toBase58?.() ?? provider.publicKey?.toBase58() ?? null);
    const onDisconnect = () => {
      setAddress(null);
      localStorage.removeItem(STORAGE_KEY);
    };
    const onAccountChanged = (pk) => setAddress(pk ? pk.toBase58() : null);

    provider.on('connect', onConnect);
    provider.on('disconnect', onDisconnect);
    provider.on('accountChanged', onAccountChanged);

    // Silent reconnect if the user connected before (Phantom remembers the grant).
    if (localStorage.getItem(STORAGE_KEY)) {
      provider.connect({ onlyIfTrusted: true }).catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      });
    }

    return () => {
      provider.off('connect', onConnect);
      provider.off('disconnect', onDisconnect);
      provider.off('accountChanged', onAccountChanged);
    };
    }
  }, []);

  const connect = useCallback(async () => {
    const provider = (await waitForProvider()) || getProvider();
    if (!provider) {
      window.open('https://phantom.app/', '_blank', 'noopener,noreferrer');
      emit('error', 'Phantom not found — install the Phantom extension, then reload.');
      return;
    }
    if (address) return;
    setConnecting(true);
    try {
      const { publicKey } = await provider.connect();
      const base58 = publicKey.toBase58();
      setAddress(base58);
      localStorage.setItem(STORAGE_KEY, '1');
      emit('connected', `Connected — ${shortAddress(base58)}`);
    } catch (err) {
      // User rejected the prompt, or the request failed.
      emit('error', err?.message || 'Connection request was rejected.');
    } finally {
      setConnecting(false);
    }
  }, [address, emit]);

  const disconnect = useCallback(async () => {
    const provider = getProvider();
    try {
      await provider?.disconnect();
    } finally {
      setAddress(null);
      localStorage.removeItem(STORAGE_KEY);
      emit('disconnected', 'Wallet disconnected.');
    }
  }, [emit]);

  /**
   * Build a transaction, have Phantom sign it, send it to devnet, and wait for
   * confirmation. Returns the signature.
   *
   * `amountUsd` is accepted so the caller (the deposit flow) can pass through
   * intent for display; on-chain this sends a 0-lamport self-transfer as a
   * stand-in until the vault program is deployed.
   */
  const signAndSend = useCallback(
    async ({ amountUsd } = {}) => {
      const provider = getProvider();
      if (!provider || !address) {
        emit('error', 'Connect your wallet first.');
        return null;
      }
      const connection = new Connection(RPC_URL, 'confirmed');
      const from = new PublicKey(address);
      try {
        emit('pending', 'Awaiting signature in Phantom…');
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash('confirmed');

        // Placeholder instruction: a 0-lamport self-transfer. Replace with the
        // vault `deposit` instruction once the program is on a public cluster.
        const tx = new Transaction({
          feePayer: from,
          blockhash,
          lastValidBlockHeight,
        }).add(
          SystemProgram.transfer({ fromPubkey: from, toPubkey: from, lamports: 0 }),
        );

        const signed = await provider.signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize());
        emit('pending', 'Transaction sent — confirming…');
        await connection.confirmTransaction(
          { signature: sig, blockhash, lastValidBlockHeight },
          'confirmed',
        );
        emit(
          'confirmed',
          `Confirmed${amountUsd ? ` · ${amountUsd}` : ''} — ${shortAddress(sig, 6, 6)}`,
        );
        return sig;
      } catch (err) {
        emit('error', err?.message || 'Transaction failed or was rejected.');
        return null;
      }
    },
    [address, emit],
  );

  return {
    address,
    connected: !!address,
    connecting,
    installed,
    connect,
    disconnect,
    signAndSend,
    explorerUrl: (sig) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
  };
}
