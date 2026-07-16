import { useState } from 'react';
import { CHART_RANGES, HWM, tvlSeries, usd } from '../domain';
import { C, Card, SectionHead, Stat, ScrollX, TokenIcon } from '../ui';
import { useIsMobile, useIsTablet } from '../useMediaQuery';

const W = 560;
const PLOT_LEFT = 18;
const PLOT_RIGHT = W - 18;
const Y_TOP = 22;
const Y_BOT = 166;
const CHART_BOTTOM = 190;

function rangeStart(range, now) {
  const config = CHART_RANGES[range];
  return config.durationMs ? now - config.durationMs : now - config.days * 86400000;
}

function axisLabel(at, range) {
  const date = new Date(at);
  if (range === '24H') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (range === '3M' || range === '6M' || range === '12M') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function coverageLabel(ms) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes}m coverage`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(minutes < 600 ? 1 : 0)}h coverage`;
  return `${(minutes / 1440).toFixed(1)}d coverage`;
}

/** Maps the selected range's TVL slice into chart coordinates. */
function useChart(nav, range, history) {
  const slice = tvlSeries(nav, history, range);
  const n = slice.length;
  const isFallback = n < 2;
  const tvls = slice.map((d) => d.tvl);
  const min = Math.min(...tvls);
  const rawSpan = Math.max(...tvls) - min;
  // A little breathing room avoids a visually violent chart for small market moves.
  const pad = Math.max(rawSpan * 0.12, Math.max(...tvls, 1) * 0.006, 1);
  const lower = min - pad;
  const span = rawSpan + pad * 2;
  const now = Date.now();
  const start = isFallback ? rangeStart(range, now) : slice[0].at;
  const end = isFallback ? now : slice.at(-1).at;
  const tickCount = 5;

  // Charts are laid out across the period that has actually been recorded. This
  // prevents a few fresh samples from being squeezed into the edge of 24H/7D.
  const xs = isFallback ? [PLOT_LEFT, PLOT_RIGHT] : slice.map((_, i) => Math.round(PLOT_LEFT + (i / (n - 1)) * (PLOT_RIGHT - PLOT_LEFT)));
  const ys = isFallback
    ? [94, 94]
    : slice.map((d) => Math.round(Y_BOT - ((d.tvl - lower) / span) * (Y_BOT - Y_TOP)));
  const pts = xs.map((x, i) => `${x},${ys[i]}`);
  const axisTicks = Array.from({ length: tickCount }, (_, i) => {
    const ratio = i / (tickCount - 1);
    return { x: PLOT_LEFT + ratio * (PLOT_RIGHT - PLOT_LEFT), label: axisLabel(start + (end - start) * ratio, range) };
  });

  return {
    slice,
    xs,
    ys,
    linePts: pts.join(' '),
    areaPath: `M${pts.join(' L')} L${PLOT_RIGHT},${CHART_BOTTOM} L${PLOT_LEFT},${CHART_BOTTOM} Z`,
    change: slice.length > 1 && slice[0].tvl > 0 ? (slice[slice.length - 1].tvl / slice[0].tvl - 1) * 100 : 0,
    isFallback,
    axisTicks,
    coverage: coverageLabel(Math.max(0, end - start)),
    snapshotCount: n,
  };
}

export default function Portfolio(v) {
  const { state, patch, vaultName, navFmt, sharePriceFmt, userValueFmt, sharesFmt, ownershipFmt } = v;
  const { treasuryFmt, treasuryPctFmt, tokenRows, allocation, allocActive, allocLeave, executions } = v;
  const [hover, setHover] = useState(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const range = state.chartRange;
  const chart = useChart(v.NAV, range, v.vaultHistory);
  const canInspectChart = !chart.isFallback;
  const hasHover = canInspectChart && hover != null && hover < chart.slice.length;

  const onMove = (e) => {
    if (!canInspectChart) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width) return;
    const i = Math.round(((e.clientX - r.left) / r.width) * (chart.slice.length - 1));
    setHover(Math.max(0, Math.min(chart.slice.length - 1, i)));
  };

  return (
    <section style={{ padding: '40px 0 90px' }}>
      <SectionHead title={vaultName}>
        <div style={{ maxWidth: 430, textAlign: 'right' }}>
          <p style={{ fontSize: 13.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Vault balances refresh from Surfpool every 15 seconds. RPC failures display zero balances.
          </p>
          <button onClick={v.refreshVault} style={{ marginTop: 8, border: 'none', background: 'transparent', color: C.green, cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: 800 }}>
            {v.vaultSource === 'live' ? '● Live Surfpool · refresh' : '○ RPC unavailable · balances set to 0'}
          </button>
        </div>
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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, gap: 14, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Total Value Locked</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: chart.change >= 0 ? C.up : C.down }}>
                {(chart.change >= 0 ? '+' : '') + chart.change.toFixed(2)}%
              </span>
              <div style={{ display: 'flex', gap: 4, background: C.rule, padding: 4, borderRadius: 999, overflowX: 'auto', maxWidth: '100%' }}>
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
                      minWidth: 45,
                      padding: '6px 11px',
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
            style={{ position: 'relative', cursor: canInspectChart ? 'crosshair' : 'default' }}
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            <svg viewBox="0 0 560 218" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
              <defs>
                <linearGradient id="greenFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.greenMid} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={C.greenMid} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[46, 94, 142].map((y) => (
                <line key={y} x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} stroke="#eee7d5" strokeWidth="1" strokeDasharray="3 5" />
              ))}
              <path d={chart.areaPath} fill="url(#greenFill2)" />
              <polyline points={chart.linePts} fill="none" stroke={C.greenMid} strokeWidth="2.5" strokeLinejoin="round" />
              {hasHover ? (
                <>
                  <line
                    x1={chart.xs[hover]}
                    y1="6"
                    x2={chart.xs[hover]}
                    y2={CHART_BOTTOM}
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
              {chart.axisTicks.map((tick, index) => (
                <text
                  key={`${tick.x}-${tick.label}`}
                  x={tick.x}
                  y="208"
                  textAnchor={index === 0 ? 'start' : index === chart.axisTicks.length - 1 ? 'end' : 'middle'}
                  fontSize="10"
                  fill={C.faint}
                  fontFamily="Nunito"
                >
                  {tick.label}
                </text>
              ))}
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, color: C.faint, marginTop: 8 }}>
              {canInspectChart
                ? <span>{CHART_RANGES[range].caption} · {chart.snapshotCount} points · {chart.coverage}</span>
                : <span>Collecting {CHART_RANGES[range].caption.toLowerCase()} · current TVL shown as a flat line.</span>}
              <span style={{ whiteSpace: 'nowrap' }}>{range}</span>
            </div>

            {hasHover && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(chart.xs[hover] / W) * 100}%`,
                  top: `${(chart.ys[hover] / 218) * 100}%`,
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
const HEADS = ['Token', 'Price', '24H', 'Holdings', 'Avg cost', 'Value', 'Weight', 'Unrl. P&L'];

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
            <TokenIcon logo={r.logo} swatch={r.swatch} badge={r.badge} size={26} />
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
