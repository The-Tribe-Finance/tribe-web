import { useState } from 'react';
import { Icon } from './icons';

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

export function Nav({ tab, setTab, walletLabel, onConnect }) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '12px 40px',
        background: 'rgba(250,246,236,.94)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <button
        onClick={() => setTab('home')}
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
          }}
        >
          <Icon name="teepee" size={24} />
        </span>
        <span style={{ textAlign: 'left' }}>
          <span style={{ display: 'block', fontSize: 21, fontWeight: 900, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Tribe
          </span>
          <span style={{ display: 'block', fontSize: 10.5, color: C.soft, fontWeight: 600 }}>
            Invest Together. Grow Together.
          </span>
        </span>
      </button>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              padding: '8px 15px',
              borderRadius: 999,
              background: tab === key ? C.sage : 'transparent',
              color: tab === key ? C.green : C.muted,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <HoverButton
        onClick={onConnect}
        hoverBg={C.greenDark}
        style={{
          border: 'none',
          fontSize: 14,
          fontWeight: 800,
          color: C.cream,
          background: C.green,
          padding: '10px 22px',
          borderRadius: 999,
        }}
      >
        {walletLabel}
      </HoverButton>
    </nav>
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
