import { useCallback, useEffect, useState } from 'react';
import { deposit as vaultDeposit, CONFIG } from './chain/vault';

/**
 * Multi-wallet integration.
 *
 * Solana wallets (Phantom, Backpack) can sign vault deposits against the
 * configured cluster. MetaMask is EVM-only: it connects and shows its address,
 * but cannot sign Solana transactions, so depositing through it is blocked.
 */

export const RPC_URL = CONFIG.rpc;
const STORAGE_KEY = 'tribe.wallet.id'; // remembers which wallet the user picked

// ---------------------------------------------------------------------------
// Wallet registry
// ---------------------------------------------------------------------------

/**
 * Each wallet knows how to find its injected provider, whether it speaks
 * Solana, and where to install it. `chain: 'solana'` wallets can deposit;
 * `chain: 'evm'` wallets connect for display only.
 */
export const WALLETS = [
  {
    id: 'phantom',
    name: 'Phantom',
    chain: 'solana',
    installUrl: 'https://phantom.app/',
    getProvider: () => {
      const p = window.phantom?.solana ?? window.solana;
      return p?.isPhantom ? p : null;
    },
  },
  {
    id: 'backpack',
    name: 'Backpack',
    chain: 'solana',
    installUrl: 'https://backpack.app/',
    getProvider: () => {
      const p = window.backpack ?? window.xnft?.solana;
      return p?.isBackpack ? p : null;
    },
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    chain: 'evm',
    installUrl: 'https://metamask.io/',
    getProvider: () => {
      const eth = window.ethereum;
      if (!eth) return null;
      // With several EVM wallets installed, ethereum.providers holds them all.
      if (Array.isArray(eth.providers)) {
        return eth.providers.find((p) => p.isMetaMask) ?? null;
      }
      return eth.isMetaMask ? eth : null;
    },
  },
];

export function walletById(id) {
  return WALLETS.find((w) => w.id === id) ?? null;
}

/** Is a wallet's extension currently present in the browser? */
export function isInstalled(wallet) {
  try {
    return !!wallet.getProvider();
  } catch {
    return false;
  }
}

/**
 * Providers are injected asynchronously; poll briefly so a connect that fires
 * right after mount still finds the extension.
 */
function waitForProvider(wallet, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const found = wallet.getProvider();
    if (found) return resolve(found);
    const started = Date.now();
    const id = setInterval(() => {
      const p = wallet.getProvider();
      if (p || Date.now() - started > timeoutMs) {
        clearInterval(id);
        resolve(p);
      }
    }, 150);
  });
}

export function shortAddress(addr, lead = 4, tail = 4) {
  if (!addr) return '';
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`;
}

// ---------------------------------------------------------------------------
// Connect helpers, per chain
// ---------------------------------------------------------------------------

async function connectSolana(provider) {
  const { publicKey } = await provider.connect();
  return publicKey.toBase58();
}

async function connectEvm(provider) {
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No account returned.');
  return accounts[0];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWallet(onEvent) {
  const [walletId, setWalletId] = useState(null);
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const emit = useCallback(
    (kind, message) => onEvent?.({ kind, message }),
    [onEvent],
  );

  const active = walletId ? walletById(walletId) : null;
  const isEvm = active?.chain === 'evm';

  // Restore a prior session for whichever wallet was last used.
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    const wallet = savedId ? walletById(savedId) : null;
    if (!wallet) return;
    let cancelled = false;

    waitForProvider(wallet).then(async (provider) => {
      if (cancelled || !provider) return;
      try {
        if (wallet.chain === 'solana') {
          // Phantom/Backpack remember the grant — reconnect silently.
          const res = await provider.connect({ onlyIfTrusted: true });
          if (cancelled) return;
          setWalletId(wallet.id);
          setAddress(res.publicKey.toBase58());
        } else {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (cancelled || !accounts?.length) return;
          setWalletId(wallet.id);
          setAddress(accounts[0]);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Wire account/disconnect events on the active provider.
  useEffect(() => {
    if (!active) return;
    const provider = active.getProvider();
    if (!provider) return;

    if (active.chain === 'solana') {
      const onDisconnect = () => {
        setAddress(null);
        setWalletId(null);
        localStorage.removeItem(STORAGE_KEY);
      };
      const onAccountChanged = (pk) => setAddress(pk ? pk.toBase58() : null);
      provider.on?.('disconnect', onDisconnect);
      provider.on?.('accountChanged', onAccountChanged);
      return () => {
        provider.off?.('disconnect', onDisconnect);
        provider.off?.('accountChanged', onAccountChanged);
      };
    }

    const onAccountsChanged = (accts) => {
      if (!accts?.length) {
        setAddress(null);
        setWalletId(null);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setAddress(accts[0]);
      }
    };
    provider.on?.('accountsChanged', onAccountsChanged);
    return () => provider.removeListener?.('accountsChanged', onAccountsChanged);
  }, [active]);

  /** Connect a specific wallet by id (called from the picker modal). */
  const connect = useCallback(
    async (id) => {
      const wallet = walletById(id);
      if (!wallet) return;
      const provider = await waitForProvider(wallet);
      if (!provider) {
        window.open(wallet.installUrl, '_blank', 'noopener,noreferrer');
        emit('error', `${wallet.name} not found — install it, then reload.`);
        return;
      }
      setConnecting(true);
      try {
        const addr =
          wallet.chain === 'solana'
            ? await connectSolana(provider)
            : await connectEvm(provider);
        setWalletId(wallet.id);
        setAddress(addr);
        localStorage.setItem(STORAGE_KEY, wallet.id);
        if (wallet.chain === 'evm') {
          emit(
            'connected',
            `${wallet.name} connected (Ethereum) — deposits need a Solana wallet.`,
          );
        } else {
          emit('connected', `${wallet.name} connected — ${shortAddress(addr)}`);
        }
      } catch (err) {
        emit('error', err?.message || 'Connection request was rejected.');
      } finally {
        setConnecting(false);
      }
    },
    [emit],
  );

  const disconnect = useCallback(async () => {
    try {
      await active?.getProvider()?.disconnect?.();
    } catch {
      /* EVM wallets have no disconnect; ignore. */
    } finally {
      setAddress(null);
      setWalletId(null);
      localStorage.removeItem(STORAGE_KEY);
      emit('disconnected', 'Wallet disconnected.');
    }
  }, [active, emit]);

  /** Deposit USDC. Only Solana wallets can sign; EVM wallets are rejected. */
  const depositUsdc = useCallback(
    async (amountUi) => {
      if (!active || !address) {
        emit('error', 'Connect a wallet first.');
        return null;
      }
      if (active.chain !== 'solana') {
        emit(
          'error',
          `${active.name} is an Ethereum wallet and cannot sign Solana transactions. Connect Phantom or Backpack to deposit.`,
        );
        return null;
      }
      if (!(amountUi > 0)) {
        emit('error', 'Enter an amount to deposit.');
        return null;
      }
      try {
        emit('pending', `Awaiting signature in ${active.name}…`);
        const provider = active.getProvider();
        const sig = await vaultDeposit({ provider, address, amountUi });
        emit('confirmed', `Deposited ${amountUi} USDC — ${shortAddress(sig, 6, 6)}`);
        return sig;
      } catch (err) {
        emit('error', err?.message || 'Deposit failed or was rejected.');
        return null;
      }
    },
    [active, address, emit],
  );

  const explorerCluster = CONFIG.cluster === 'devnet' ? '?cluster=devnet' : '';

  return {
    walletId,
    walletName: active?.name ?? null,
    address,
    connected: !!address,
    connecting,
    isEvm,
    canDeposit: active?.chain === 'solana',
    connect, // connect(id)
    disconnect,
    signAndSend: ({ amountUi } = {}) => depositUsdc(amountUi),
    explorerUrl: (sig) => `https://explorer.solana.com/tx/${sig}${explorerCluster}`,
  };
}
