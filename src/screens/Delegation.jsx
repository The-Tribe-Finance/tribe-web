import { STATUS_META } from '../domain';
import { Icon } from '../icons';
import { C, Card, HoverButton, SectionHead } from '../ui';

export default function Delegation(v) {
  return (
    <section style={{ padding: '40px 0 90px' }}>
      {v.ad ? <AnalystDetail {...v} /> : <AnalystList {...v} />}
    </section>
  );
}

function AnalystList(v) {
  const { selfPanel } = v;

  return (
    <>
      <SectionHead title="Delegation">
        <p style={{ maxWidth: 430, fontSize: 13.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Delegate your voting power to an analyst you trust. Tap any analyst to see their full track record, investment
          history and proposals.
        </p>
      </SectionHead>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.green, borderRadius: 18, padding: '22px 24px', color: C.cream }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: '#d6dfc4',
              marginBottom: 6,
            }}
          >
            <Icon name="totem" size={16} />
            Your voting power
          </div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{v.votingPowerFmt}</div>
          <div style={{ fontSize: 12, color: '#d6dfc4', marginTop: 4 }}>
            {v.sharesFmt} shares · {v.ownershipFmt} of vault
          </div>
        </div>

        <Card style={{ padding: '22px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>Currently allocated to</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: v.isDelegated ? C.green : '#c2762e' }}>
            {v.dpStatusLabel}
          </div>
          <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>{v.dpStatusNote}</div>
        </Card>

        <div
          style={{
            background: C.sand,
            border: `1px solid ${C.line}`,
            borderRadius: 18,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
            Voting power scales with your position — <strong>deposit more</strong> to gain influence, whether you vote
            directly or delegate.
          </div>
          <HoverButton
            onClick={v.goPosition}
            hoverBg={C.greenDark}
            style={{
              alignSelf: 'flex-start',
              marginTop: 12,
              border: 'none',
              fontSize: 13,
              fontWeight: 800,
              color: C.cream,
              background: C.green,
              padding: '9px 18px',
              borderRadius: 999,
            }}
          >
            Deposit to add power →
          </HoverButton>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16, marginBottom: 20, alignItems: 'stretch' }}>
        <Card style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Analyst rewards pool</h3>
            <span style={{ fontSize: 12, color: C.soft }}>{v.poolShareNote}</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.green }}>
            {v.analystPoolFmt}
            <span style={{ fontSize: 13, fontWeight: 700, color: C.soft }}> / yr</span>
          </div>

          <div style={{ display: 'flex', gap: 8, margin: '12px 0 16px' }}>
            <FeeChip label="Management fee" value={v.poolMgmtFmt} />
            <FeeChip label="Performance fee" value={v.poolPerfFmt} />
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: C.faint,
              marginBottom: 10,
            }}
          >
            Distributed by voting power
          </div>
          {v.poolDist.map((d) => (
            <div
              key={d.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr 84px',
                gap: 10,
                alignItems: 'center',
                padding: '6px 0',
                fontSize: 12.5,
              }}
            >
              <span style={{ fontWeight: 800, color: d.self ? '#c2762e' : C.ink }}>{d.name}</span>
              <div style={{ height: 7, background: C.rule, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.barPct}%`, background: d.barColor, borderRadius: 999 }} />
              </div>
              <span style={{ textAlign: 'right', color: C.soft }}>
                <strong style={{ color: C.ink }}>{d.rewardsYrFmt}</strong> · {d.sharePct}
              </span>
            </div>
          ))}
        </Card>

        {selfPanel.isAnalyst ? (
          <div style={{ background: C.green, borderRadius: 18, padding: 24, color: C.cream }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="totem" size={16} />
              </span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>Your analyst earnings</div>
                <div style={{ fontSize: 11.5, color: '#d6dfc4' }}>Live · profile open to delegations</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <SelfTile label="Accrued rewards" value={selfPanel.accruedFmt} big />
              <SelfTile label="Projected / yr" value={selfPanel.rewardsYrFmt} big />
              <SelfTile
                label="Delegated to you"
                value={selfPanel.delegatedFmt}
                note={`${selfPanel.delegatorsFmt} delegators`}
              />
              <SelfTile label="Pool share" value={selfPanel.sharePct} note="grows with delegations" />
            </div>
          </div>
        ) : (
          <div
            style={{
              background: C.sand,
              border: `1px solid ${C.line}`,
              borderRadius: 18,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 900 }}>Become an analyst</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              Publish your investment thesis and let the community delegate voting power to you. You don't need capital —
              you earn a share of the rewards pool proportional to the voting power delegated to you, plus
              performance-based rewards for the trades you propose.
            </p>
            <HoverButton
              onClick={v.becomeAnalyst}
              hoverBg={C.greenDark}
              style={{
                alignSelf: 'flex-start',
                border: 'none',
                fontSize: 14,
                fontWeight: 800,
                color: C.cream,
                background: C.green,
                padding: '12px 24px',
                borderRadius: 999,
              }}
            >
              Become an analyst →
            </HoverButton>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {v.analysts.map((a) => (
          <AnalystRow key={a.key} a={a} />
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: '20px 24px',
          background: C.sage,
          borderRadius: 18,
          fontSize: 13,
          display: 'flex',
          gap: 32,
          color: C.greenDark,
        }}
      >
        <span>
          <strong>How analysts earn.</strong> No fees per proposal — income scales with delegated capital and long-term
          performance.
        </span>
        <span>
          <strong>Your control.</strong> Switch analysts, revoke, or return to direct voting at any time.
        </span>
      </div>
    </>
  );
}

function FeeChip({ label, value }) {
  return (
    <span
      style={{
        flex: 1,
        fontSize: 12,
        background: C.cream,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: '10px 12px',
      }}
    >
      {label}
      <br />
      <strong style={{ fontSize: 14 }}>{value}</strong>
    </span>
  );
}

function SelfTile({ label, value, note, big }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, color: '#d6dfc4' }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 18, fontWeight: 900 }}>{value}</div>
      {note && <div style={{ fontSize: 11, color: '#d6dfc4' }}>{note}</div>}
    </div>
  );
}

function DelegateButton({ a, large }) {
  const mine = a.isDelegated;
  return (
    <button
      onClick={a.toggleDelegate}
      disabled={a.disabled}
      style={{
        border: mine ? `1.5px solid ${C.green}` : 'none',
        cursor: a.disabled ? 'not-allowed' : 'pointer',
        font: 'inherit',
        fontSize: large ? 13.5 : 13,
        fontWeight: 800,
        color: mine ? C.green : C.cream,
        background: mine ? '#fff' : C.green,
        padding: large ? '11px 22px' : '9px 18px',
        borderRadius: 999,
        opacity: a.disabled ? 0.5 : 1,
      }}
    >
      {mine ? (large ? 'Revoke delegation' : 'Revoke') : large ? `Delegate to ${a.name}` : 'Delegate'}
    </button>
  );
}

function Metric({ label, value, color, small }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: small ? 13 : 17, color }}>{value}</div>
    </div>
  );
}

function AnalystRow({ a }) {
  return (
    <div
      onClick={a.openDetail}
      style={{
        background: '#fff',
        border: `1.5px solid ${a.isDelegated ? '#a9bd8a' : C.line}`,
        borderRadius: 18,
        padding: '22px 24px',
        display: 'grid',
        gridTemplateColumns: '230px repeat(5, 1fr) 130px',
        gap: 16,
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              background: C.sage,
              color: C.green,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {a.initials}
          </span>
          <span style={{ fontWeight: 900, fontSize: 16 }}>{a.name}</span>
          {a.isDelegated && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: C.green,
                background: C.sage,
                padding: '3px 10px',
                borderRadius: 999,
              }}
            >
              Your analyst
            </span>
          )}
        </div>
        <div style={{ color: C.faint, fontSize: 12, marginTop: 4 }}>
          {a.handle} · {a.thesis}
        </div>
      </div>

      <Metric label="Delegated TVL" value={a.tvl} />
      <Metric label="Delegators" value={a.delegators} />
      <Metric label="12m Perf" value={a.perf} color={C.up} />
      <Metric label="Sharpe" value={a.sharpe} />
      <Metric label="Max Drawdown" value={a.drawdown} color={C.down} />

      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}
        onClick={(e) => e.stopPropagation()}
      >
        <DelegateButton a={a} />
        {a.lockNote && (
          <span style={{ color: C.down, fontSize: 10.5, fontWeight: 800, textAlign: 'center' }}>🔒 {a.lockNote}</span>
        )}
        <span style={{ color: C.faint, fontSize: 11, textAlign: 'center' }}>{a.record}</span>
      </div>
    </div>
  );
}

function AnalystDetail({ ad }) {
  return (
    <div>
      <button
        onClick={ad.close}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          font: 'inherit',
          fontSize: 13,
          fontWeight: 800,
          color: C.green,
          marginBottom: 16,
          padding: 0,
        }}
      >
        ← All analysts
      </button>

      <Card style={{ borderRadius: 20, padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: C.sage,
              color: C.green,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 20,
              flex: 'none',
            }}
          >
            {ad.initials}
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{ad.name}</h2>
              {ad.isDelegated && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: C.green,
                    background: C.sage,
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  Your analyst
                </span>
              )}
            </div>
            <div style={{ color: C.soft, fontSize: 13, marginTop: 2 }}>
              {ad.handle} · {ad.thesis}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <DelegateButton a={ad} large />
            {ad.lockNote && <span style={{ color: C.down, fontSize: 11, fontWeight: 800 }}>🔒 {ad.lockNote}</span>}
          </div>
        </div>

        <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6, margin: '16px 0 0', maxWidth: 720 }}>{ad.bio}</p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 14,
            marginTop: 20,
            paddingTop: 20,
            borderTop: `1px solid ${C.rule}`,
          }}
        >
          <Metric label="Delegated TVL" value={ad.tvl} />
          <Metric label="Delegators" value={ad.delegators} />
          <Metric label="12m Perf" value={ad.perf} color={C.up} />
          <Metric label="Sharpe" value={ad.sharpe} />
          <Metric label="Max Drawdown" value={ad.drawdown} color={C.down} />
          <Metric label="Track record" value={ad.record} small />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.rule}` }}>
          <RewardTile bg={C.sage} labelColor="#6f7d5a" label="Accrued rewards" value={ad.accruedFmt} valueColor={C.green} />
          <RewardTile bg={C.sand} labelColor={C.soft} label="Rewards / yr" value={ad.rewardsYrFmt} />
          <RewardTile bg={C.cream} labelColor={C.soft} label="Pool share" value={ad.poolSharePct} bordered />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, alignItems: 'start' }}>
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900 }}>Investment history</h3>
          {ad.history.map((h) => (
            <div
              key={h.date + h.action}
              style={{
                display: 'grid',
                gridTemplateColumns: '58px 1fr auto',
                gap: 12,
                alignItems: 'baseline',
                padding: '11px 0',
                borderBottom: `1px solid ${C.rule}`,
                fontSize: 13,
              }}
            >
              <span style={{ color: C.faint, fontWeight: 700 }}>{h.date}</span>
              <span>
                <strong style={{ fontWeight: 800 }}>{h.action}</strong>
                <span style={{ display: 'block', color: C.soft, fontSize: 12 }}>{h.detail}</span>
              </span>
              <span style={{ fontWeight: 800, color: h.resultColor, textAlign: 'right' }}>{h.result}</span>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900 }}>
            Proposals created ({ad.created.length})
          </h3>
          {ad.created.map((p) => {
            const sm = STATUS_META[p.status] || STATUS_META.active;
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 0',
                  borderBottom: `1px solid ${C.rule}`,
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 900, color: C.green, flex: 'none' }}>{p.id}</span>
                <span style={{ flex: 1 }}>{p.title}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 11px',
                    borderRadius: 999,
                    background: sm.bg,
                    color: sm.c,
                    flex: 'none',
                  }}
                >
                  {sm.l}
                </span>
              </div>
            );
          })}
          {ad.created.length === 0 && (
            <div style={{ fontSize: 13, color: C.faint, padding: '8px 0' }}>No proposals created yet.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function RewardTile({ bg, label, labelColor, value, valueColor, bordered }) {
  return (
    <div
      style={{
        flex: 1,
        background: bg,
        border: bordered ? `1px solid ${C.line}` : undefined,
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: labelColor }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 19, color: valueColor }}>{value}</div>
    </div>
  );
}
