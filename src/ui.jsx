import { useState } from 'react';
import { Icon } from './icons';
import { useIsMobile, useIsTablet } from './useMediaQuery';
import { WALLETS, isInstalled } from './wallet';
import { WalletLogo } from './walletLogos';

export const C = {
  cream: '#faf6ec',
  ink: '#38301f',
  green: '#3e5c2f',
  greenDark: '#324b26',
  greenMid: '#4a6b35',
  sage: '#e7edda',
  line: '#ece3cf',
  muted: '#6f6653',
  soft: '#8a7d63',
  faint: '#b3a888',
  sand: '#f5efdf',
  rule: '#f3edda',
  up: '#3e7d3a',
  down: '#b3452f',
};

export function Card({ style, children, ...rest }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: 22,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** A button whose background swaps on hover — the design uses this everywhere. */
export function HoverButton({ hoverBg, style, children, ...rest }) {
  const [hover, setHover] = useState(false);
  const bg = hover && hoverBg && !rest.disabled ? hoverBg : style?.background;
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ font: 'inherit', cursor: 'pointer', ...style, background: bg }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, sub, subColor, valueColor }) {
  return (
    <Card style={{ padding: '20px 22px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: valueColor }}>{value}</div>
      <div style={{ fontSize: 12.5, color: subColor || C.soft, fontWeight: subColor ? 800 : 400 }}>{sub}</div>
    </Card>
  );
}

export function SectionHead({ title, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
        marginBottom: 24,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em' }}>{title}</h1>
      {children}
    </div>
  );
}

const TABS = [
  ['home', 'Home'],
  ['portfolio', 'Portfolio'],
  ['governance', 'Governance'],
  ['analysts', 'Delegation'],
  ['position', 'My Position'],
];

function TabButton({ tabKey, label, tab, setTab, onNavigate }) {
  const active = tab === tabKey;
  return (
    <button
      onClick={() => {
        setTab(tabKey);
        onNavigate?.();
      }}
      style={{
        border: 'none',
        cursor: 'pointer',
        font: 'inherit',
        fontSize: 14,
        fontWeight: 700,
        padding: '8px 15px',
        borderRadius: 999,
        textAlign: 'left',
        background: active ? C.sage : 'transparent',
        color: active ? C.green : C.muted,
      }}
    >
      {label}
    </button>
  );
}

export function Nav({ tab, setTab, walletLabel, connected, onConnect, onDisconnect }) {
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const walletBtn = (
    <HoverButton
      onClick={connected ? onDisconnect : onConnect}
      hoverBg={connected ? C.down : C.greenDark}
      title={connected ? 'Click to disconnect' : 'Connect a wallet'}
      style={{
        border: 'none',
        fontSize: isMobile ? 13 : 14,
        fontWeight: 800,
        color: C.cream,
        background: C.green,
        padding: isMobile ? '9px 16px' : '10px 22px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {walletLabel}
    </HoverButton>
  );

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 12 : 24,
        padding: isMobile ? '10px 18px' : '12px 40px',
        background: 'rgba(250,246,236,.94)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${C.line}`,
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={() => {
          setTab('home');
          setMenuOpen(false);
        }}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          font: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginRight: 'auto',
          padding: 0,
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: C.sage,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name="teepee" size={24} />
        </span>
        <span style={{ textAlign: 'left' }}>
          <span style={{ display: 'block', fontSize: 21, fontWeight: 900, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Tribe
          </span>
          {!isMobile && (
            <span style={{ display: 'block', fontSize: 10.5, color: C.soft, fontWeight: 600 }}>
              Invest Together. Grow Together.
            </span>
          )}
        </span>
      </button>

      {/* Wide screens: inline tab row. Narrow: a hamburger that reveals the tabs. */}
      {!isTablet && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {TABS.map(([key, label]) => (
            <TabButton key={key} tabKey={key} label={label} tab={tab} setTab={setTab} />
          ))}
        </div>
      )}

      {!isTablet && walletBtn}

      {isTablet && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {walletBtn}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            style={{
              border: `1px solid ${C.line}`,
              background: '#fff',
              cursor: 'pointer',
              borderRadius: 12,
              width: 42,
              height: 42,
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: 0,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 18, height: 2, borderRadius: 2, background: C.ink }} />
            ))}
          </button>
        </div>
      )}

      {isTablet && menuOpen && (
        <div
          style={{
            flexBasis: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            paddingTop: 8,
            borderTop: `1px solid ${C.line}`,
            marginTop: 4,
          }}
        >
          {TABS.map(([key, label]) => (
            <TabButton
              key={key}
              tabKey={key}
              label={label}
              tab={tab}
              setTab={setTab}
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
        </div>
      )}
    </nav>
  );
}

/**
 * Wraps wide, fixed-column tables so they scroll sideways on narrow screens
 * instead of crushing their columns. `minWidth` keeps the grid at its designed
 * width; the page body itself never scrolls horizontally.
 */
export function ScrollX({ minWidth = 640, children, style }) {
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', ...style }}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

/**
 * The wallet picker. Lists every wallet Tribe supports, shows whether each is
 * installed, and labels the chain. Solana wallets can deposit; MetaMask (EVM)
 * connects for display only.
 */
export function WalletModal({ open, onClose, onPick }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(40,32,20,.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Connect a wallet"
        style={{
          background: '#fff',
          borderRadius: 22,
          padding: 24,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 24px 60px rgba(40,32,20,.28)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Connect a wallet</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              color: C.soft,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
          Deposits are settled on Solana. Ethereum wallets can connect, but cannot
          sign vault transactions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {WALLETS.map((w) => {
            const installed = isInstalled(w);
            return (
              <button
                key={w.id}
                onClick={() => onPick(w.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  width: '100%',
                  textAlign: 'left',
                  font: 'inherit',
                  cursor: 'pointer',
                  background: C.cream,
                  border: `1.5px solid ${C.line}`,
                  borderRadius: 14,
                  padding: '12px 14px',
                }}
              >
                <WalletLogo id={w.id} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: 15 }}>{w.name}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: C.soft, fontWeight: 600 }}>
                    {w.chain === 'solana' ? 'Solana · can deposit' : 'Ethereum · view only'}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: installed ? C.green : C.faint,
                    background: installed ? C.sage : 'transparent',
                    border: installed ? 'none' : `1px solid ${C.line}`,
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  {installed ? 'Detected' : 'Install'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: 28,
        bottom: 28,
        background: C.ink,
        color: C.cream,
        padding: '14px 20px',
        fontSize: 13,
        fontWeight: 700,
        borderRadius: 14,
        boxShadow: '0 12px 32px rgba(56,48,31,.3)',
        zIndex: 50,
        maxWidth: 400,
      }}
    >
      {message}
    </div>
  );
}
