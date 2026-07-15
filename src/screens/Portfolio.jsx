import { useState } from 'react';
import { CHART_RANGES, HWM, tvlSeries, usd } from '../domain';
import { C, Card, SectionHead, Stat, ScrollX } from '../ui';
import { useIsMobile, useIsTablet } from '../useMediaQuery';

const W = 560;
const Y_TOP = 24;
const Y_BOT = 182;

/** Maps the selected range's TVL slice into chart coordinates. */
function useChart(nav, range) {
  const full = tvlSeries(nav);
  const n = Math.min(CHART_RANGES[range] || 13, full.length);
  const slice = full.slice(full.length - n);
  const tvls = slice.map((d) => d.tvl);
  const min = Math.min(...tvls);
  const span = Math.max(...tvls) - min || 1;

  const xs = slice.map((_, i) => (n === 1 ? W : Math.round((i / (n - 1)) * W)));
  const ys = slice.map((d) => Math.round(Y_BOT - ((d.tvl - min) / span) * (Y_BOT - Y_TOP)));
  const pts = xs.map((x, i) => `${x},${ys[i]}`);

  return {
    slice,
    xs,
    ys,
    linePts: pts.join(' '),
    areaPath: `M${pts.join(' L')} L${W},210 L0,210 Z`,
    change: (slice[slice.length - 1].tvl / slice[0].tvl - 1) * 100,
  };
}

export default function Portfolio(v) {
  const { state, patch, vaultName, navFmt, sharePriceFmt, userValueFmt, sharesFmt, ownershipFmt } = v;
  const { treasuryFmt, treasuryPctFmt, tokenRows, allocation, allocActive, allocLeave, executions } = v;
  const [hover, setHover] = useState(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const range = state.chartRange;
  const chart = useChart(v.NAV, range);
  const hasHover = hover != null && hover < chart.slice.length;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width) return;
    const i = Math.round(((e.clientX - r.left) / r.width) * (chart.slice.length - 1));
    setHover(Math.max(0, Math.min(chart.slice.length - 1, i)));
  };

  return (
    <section style={{ padding: '40px 0 90px' }}>
      <SectionHead title={vaultName}>
        <p style={{ maxWidth: 430, fontSize: 13.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Every asset, trade and vote is transparent on-chain. Live prices, weights and unrealized P&L for the entire
          fund.
        </p>
      </SectionHead>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        <Stat label="Total Value Locked" value={navFmt} sub="▲ +4.8% this month" subColor={C.up} />
        <Stat label="NAV / share" value={sharePriceFmt} sub={`High-water mark ${HWM.toFixed(3)}`} />
        <Stat
          label="Your Position"
          value={userValueFmt}
          valueColor={C.green}
          sub={`${sharesFmt} shares · ${ownershipFmt} of vault`}
        />
        <Stat label="Cash reserve" value={treasuryFmt} sub={`${treasuryPctFmt} in USDC`} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1.45fr 1fr',
          gap: 16,
          marginTop: 16,
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Total Value Locked</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: chart.change >= 0 ? C.up : C.down }}>
                {(chart.change >= 0 ? '+' : '') + chart.change.toFixed(2)}%
              </span>
              <div style={{ display: 'flex', gap: 3, background: C.rule, padding: 3, borderRadius: 999 }}>
                {Object.keys(CHART_RANGES).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      patch({ chartRange: k });
                      setHover(null);
                    }}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      font: 'inherit',
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: '5px 12px',
                      borderRadius: 999,
                      background: k === range ? C.green : 'transparent',
                      color: k === range ? C.cream : C.muted,
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{ position: 'relative', cursor: 'crosshair' }}
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            <svg viewBox="0 0 560 210" style={{ width: '100%', display: 'block' }}>
              <defs>
                <linearGradient id="greenFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.greenMid} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={C.greenMid} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[52, 104, 156].map((y) => (
                <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="#f0ead9" strokeWidth="1" />
              ))}
              <path d={chart.areaPath} fill="url(#greenFill2)" />
              <polyline
                points={chart.linePts}
                fill="none"
                stroke={C.greenMid}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {hasHover ? (
                <>
                  <line
                    x1={chart.xs[hover]}
                    y1="6"
                    x2={chart.xs[hover]}
                    y2="210"
                    stroke="#8a6a45"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={chart.xs[hover]}
                    cy={chart.ys[hover]}
                    r="5.5"
                    fill={C.cream}
                    stroke={C.green}
                    strokeWidth="2.5"
                  />
                </>
              ) : (
                <circle cx={chart.xs.at(-1)} cy={chart.ys.at(-1)} r="4.5" fill={C.greenMid} />
              )}
              <text x="8" y="202" fontSize="10.5" fill={C.faint} fontFamily="Nunito">
                {chart.slice[0].label}
              </text>
              <text x="495" y="202" fontSize="10.5" fill={C.faint} fontFamily="Nunito">
                {chart.slice.at(-1).label}
              </text>
            </svg>

            {hasHover && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(chart.xs[hover] / W) * 100}%`,
                  top: `${(chart.ys[hover] / 210) * 100}%`,
                  transform: 'translate(-50%, -118%)',
                  background: C.ink,
                  color: C.cream,
                  borderRadius: 12,
                  padding: '9px 14px',
                  fontSize: 12,
                  boxShadow: '0 8px 22px rgba(56,48,31,.28)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 3 }}>{chart.slice[hover].label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: '#7d9a5c' }} />
                  <span style={{ color: '#cdbfa4' }}>TVL</span> <strong>{usd(chart.slice[hover].tvl)}</strong>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900 }}>Allocation</h3>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden' }}>
              {allocation.map((a) => (
                <div
                  key={a.sym}
                  onMouseEnter={a.onEnter}
                  onMouseLeave={allocLeave}
                  style={{
                    width: `${a.w}%`,
                    background: a.color,
                    cursor: 'pointer',
                    opacity: a.dim,
                    transition: 'opacity .12s',
                  }}
                />
              ))}
            </div>
            {allocActive && (
              <div
                style={{
                  position: 'absolute',
                  left: `${allocActive.mid}%`,
                  top: -12,
                  transform: 'translate(-50%, -100%)',
                  background: C.ink,
                  color: C.cream,
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 22px rgba(56,48,31,.28)',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: allocActive.color }} />
                  <strong>{allocActive.sym}</strong> <span style={{ color: '#cdbfa4' }}>{allocActive.wFmt}</span>
                </span>
                <span style={{ color: '#cdbfa4' }}> · {usd(Math.round(allocActive.value))}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {allocation.map((a) => (
              <div
                key={a.sym}
                onMouseEnter={a.onEnter}
                onMouseLeave={allocLeave}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '12px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: '7px 8px',
                  margin: '0 -8px',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: a.rowBg,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 999, background: a.color }} />
                <span style={{ fontWeight: 800 }}>{a.sym}</span>
                <span style={{ color: C.soft, fontWeight: 700 }}>{a.wFmt}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <HoldingsTable rows={tokenRows} onPropose={v.goGovernance} />
      <Executions rows={executions} />
    </section>
  );
}

const COLS = '1.5fr 1fr 0.8fr 1fr 1fr 1.1fr 0.7fr 1.2fr';
const HEADS = ['Token', 'Price', '24h', 'Holdings', 'Avg cost', 'Value', 'Weight', 'Unrl. P&L'];

function HoldingsTable({ rows, onPropose }) {
  return (
    <Card style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Holdings — token tracking</h3>
        <button
          onClick={onPropose}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 13,
            fontWeight: 800,
            color: C.green,
          }}
        >
          Propose a trade →
        </button>
      </div>

      <ScrollX minWidth={720}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLS,
          gap: 10,
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: '.05em',
          color: C.faint,
          textTransform: 'uppercase',
          paddingBottom: 10,
          borderBottom: `1px solid ${C.rule}`,
        }}
      >
        {HEADS.map((h, i) => (
          <span key={h} style={{ textAlign: i === 0 ? 'left' : 'right' }}>
            {h}
          </span>
        ))}
      </div>

      {rows.map((r) => (
        <div
          key={r.sym}
          style={{
            display: 'grid',
            gridTemplateColumns: COLS,
            gap: 10,
            alignItems: 'center',
            fontSize: 13,
            padding: '11px 0',
            borderBottom: `1px solid ${C.rule}`,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: r.swatch,
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 900,
                flex: 'none',
              }}
            >
              {r.badge}
            </span>
            <span>
              <strong style={{ fontWeight: 800 }}>{r.sym}</strong>{' '}
              <span style={{ color: C.faint, fontSize: 11.5 }}>{r.name}</span>
            </span>
          </span>
          <span style={{ textAlign: 'right', fontWeight: 700 }}>{r.priceFmt}</span>
          <span style={{ textAlign: 'right', fontWeight: 800, color: r.chgColor }}>{r.chgFmt}</span>
          <span style={{ textAlign: 'right', color: C.muted }}>{r.qtyFmt}</span>
          <span style={{ textAlign: 'right', color: C.soft }}>{r.avgFmt}</span>
          <span style={{ textAlign: 'right', fontWeight: 800 }}>{r.valueFmt}</span>
          <span style={{ textAlign: 'right', color: C.soft }}>{r.weightFmt}</span>
          <span style={{ textAlign: 'right', fontWeight: 800, color: r.pnlColor }}>{r.pnlFmt}</span>
        </div>
      ))}
      </ScrollX>
    </Card>
  );
}

const EXEC_COLS = '90px 1.6fr 1fr 1.2fr auto 80px';

function Executions({ rows }) {
  return (
    <Card style={{ marginTop: 16 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 900 }}>Recent Executions</h3>
      <div style={{ fontSize: 12.5, color: C.soft, marginBottom: 14 }}>
        Routed via <span style={{ color: C.green, fontWeight: 800 }}>Jupiter Aggregator</span> on Solana
      </div>

      <ScrollX minWidth={640}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: EXEC_COLS,
          gap: 12,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.06em',
          color: C.faint,
          textTransform: 'uppercase',
          paddingBottom: 10,
          borderBottom: `1px solid ${C.rule}`,
        }}
      >
        {['Proposal', 'Action', 'Size', 'Route', 'Status', 'Date'].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>

      {rows.map((e) => (
        <div
          key={e.id}
          style={{
            display: 'grid',
            gridTemplateColumns: EXEC_COLS,
            gap: 12,
            alignItems: 'center',
            fontSize: 13.5,
            padding: '12px 0',
            borderBottom: `1px solid ${C.rule}`,
          }}
        >
          <span style={{ fontWeight: 800, color: C.green }}>{e.id}</span>
          <span>{e.action}</span>
          <span style={{ fontWeight: 700 }}>{e.size}</span>
          <span style={{ color: C.soft }}>{e.route}</span>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: C.up,
              background: C.sage,
              padding: '4px 12px',
              borderRadius: 999,
              justifySelf: 'start',
            }}
          >
            Executed
          </span>
          <span style={{ color: C.soft }}>{e.date}</span>
        </div>
      ))}
      </ScrollX>
    </Card>
  );
}
