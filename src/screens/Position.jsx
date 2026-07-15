import { C, Card, HoverButton, SectionHead } from '../ui';
import { useIsMobile } from '../useMediaQuery';

const INPUT = {
  width: '100%',
  boxSizing: 'border-box',
  font: 'inherit',
  fontSize: 15,
  padding: '12px 16px',
  border: '1.5px solid #ded4bc',
  borderRadius: 12,
  background: C.cream,
  outline: 'none',
};

const NOTES = [
  [
    '01 — Convert or keep',
    'By default your slice is swapped to USDC. Prefer the raw tokens? Switch to in-kind and receive each asset directly.',
  ],
  ['02 — No liquidation', 'In-kind redemption never touches the portfolio of remaining investors.'],
  [
    '03 — Fair fees',
    'Performance fee only above the high-water mark — never charged twice on the same gain.',
  ],
];

export default function Position(v) {
  const { state, patch, isUsdc } = v;
  const isMobile = useIsMobile();

  return (
    <section style={{ padding: '40px 0 90px' }}>
      <SectionHead title="Deposit & Redeem">
        <div style={{ textAlign: 'right', fontSize: 13.5 }}>
          <div style={{ fontWeight: 900, fontSize: 20, color: C.green }}>{v.userValueFmt}</div>
          <div style={{ color: C.soft }}>
            {v.sharesFmt} shares · wallet {v.usdcFmt} USDC
          </div>
        </div>
      </SectionHead>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <Card style={{ padding: 26 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 900 }}>Deposit</h3>
          <p style={{ color: C.muted, fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.6 }}>
            Deposit USDC — the protocol mints vault shares at the current NAV per share ({v.sharePriceFmt}).
          </p>

          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: C.soft, marginBottom: 6 }}>
            Amount (USDC)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0.00"
            value={state.depositAmt}
            onChange={(e) => patch({ depositAmt: e.target.value })}
            style={INPUT}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 0',
              fontSize: 13.5,
              borderBottom: `1px solid ${C.rule}`,
            }}
          >
            <span style={{ color: C.soft }}>You receive</span>
            <strong>{v.depositSharesFmt} shares</strong>
          </div>
          <div style={{ fontSize: 12, color: C.faint, paddingTop: 10 }}>
            Management fee 0.5% NAV / yr · Performance fee 10% above High-Water Mark
          </div>

          <HoverButton
            onClick={v.confirmDeposit}
            disabled={v.depositDisabled}
            hoverBg={C.greenDark}
            style={{
              width: '100%',
              marginTop: 18,
              border: 'none',
              fontSize: 14,
              fontWeight: 800,
              color: C.cream,
              background: C.green,
              padding: '13px 24px',
              borderRadius: 999,
              opacity: v.depositDisabled ? 0.45 : 1,
              cursor: v.depositDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            Deposit & mint shares
          </HoverButton>
        </Card>

        <Card style={{ padding: 26 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 900 }}>Redeem</h3>
          <p style={{ color: C.muted, fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.6 }}>
            {isUsdc
              ? 'Your slice of the portfolio is automatically swapped to USDC and sent to your wallet — the simplest way out.'
              : 'Receive your exact pro-rata slice of every asset directly — no forced selling, no bank run.'}
          </p>

          <div
            style={{
              display: 'inline-flex',
              border: '1.5px solid #ded4bc',
              borderRadius: 12,
              overflow: 'hidden',
              width: '100%',
              marginBottom: 16,
            }}
          >
            <ModeButton on={isUsdc} onClick={() => patch({ redeemMode: 'usdc' })}>
              Convert to USDC
            </ModeButton>
            <ModeButton on={!isUsdc} onClick={() => patch({ redeemMode: 'inkind' })} divider>
              Receive tokens (in-kind)
            </ModeButton>
          </div>

          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: C.soft, marginBottom: 6 }}>
            Redeem {state.redeemPct}% of your shares ({v.redeemSharesFmt} shares · {v.redeemValueFmt})
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={state.redeemPct}
            onChange={(e) => patch({ redeemPct: parseInt(e.target.value, 10) })}
            style={{ width: '100%' }}
          />

          {isUsdc ? (
            <div style={{ marginTop: 16, background: C.cream, borderRadius: 14, padding: '16px 18px' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '.06em',
                  color: C.faint,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                You receive
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: C.green }}>{v.redeemUsdcOut}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.soft }}>USDC</span>
              </div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 6 }}>
                Your slice of every asset is auto-swapped to USDC via Jupiter · est. slippage {v.slippageFmt}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '.06em',
                  color: C.faint,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                You receive
              </div>
              {v.redeemBreakdown.map((r) => (
                <div
                  key={r.sym}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '8px 0',
                    borderBottom: `1px solid ${C.rule}`,
                    fontSize: 13.5,
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>
                    <strong>{r.amount}</strong> {r.sym}
                  </span>
                  <span style={{ color: C.soft }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}

          <HoverButton
            onClick={v.confirmRedeem}
            hoverBg="#f2f5e9"
            style={{
              width: '100%',
              marginTop: 18,
              border: `1.5px solid ${C.green}`,
              fontSize: 14,
              fontWeight: 800,
              color: C.green,
              background: '#fff',
              padding: '13px 24px',
              borderRadius: 999,
            }}
          >
            {isUsdc ? 'Redeem for USDC' : 'Redeem in-kind'}
          </HoverButton>
        </Card>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
        {NOTES.map(([title, body]) => (
          <Card key={title} style={{ padding: '20px 22px', fontSize: 13 }}>
            <div style={{ fontWeight: 900, color: C.green, marginBottom: 6 }}>{title}</div>
            <span style={{ color: C.muted, lineHeight: 1.6 }}>{body}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ModeButton({ on, onClick, divider, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: 'none',
        borderLeft: divider ? '1.5px solid #ded4bc' : undefined,
        cursor: 'pointer',
        font: 'inherit',
        fontSize: 13,
        fontWeight: 800,
        padding: '10px 0',
        background: on ? C.green : '#fff',
        color: on ? C.cream : C.muted,
      }}
    >
      {children}
    </button>
  );
}
