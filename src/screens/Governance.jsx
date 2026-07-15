import { ACTION_PREVIEW_META, KIND_META, MARGIN_MIN_PCT, TRADABLE, TOKENS, YES_MIN_PCT } from '../domain';
import { Icon } from '../icons';
import { C, Card, HoverButton, SectionHead } from '../ui';
import { useIsTablet } from '../useMediaQuery';

const INPUT = {
  width: '100%',
  boxSizing: 'border-box',
  font: 'inherit',
  fontSize: 14,
  padding: '11px 14px',
  border: '1.5px solid #ded4bc',
  borderRadius: 12,
  background: C.cream,
  color: C.ink,
  outline: 'none',
};

const LABEL = {
  display: 'block',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: C.faint,
  marginBottom: 8,
};

export default function Governance(v) {
  return (
    <section style={{ padding: '40px 0 90px' }}>
      <SectionHead title="Proposals">
        <div style={{ textAlign: 'right', fontSize: 13.5 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{v.votingPowerFmt}</div>
          <div style={{ color: C.soft }}>voting power · {v.govStatusNote}</div>
        </div>
      </SectionHead>

      <div
        style={{
          background: C.sage,
          borderRadius: 16,
          padding: '16px 22px',
          marginBottom: 20,
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 900, color: C.greenDark }}>How a proposal passes</span>
        <span style={{ fontSize: 12.5, color: C.greenDark }}>
          ① <strong>YES ≥ {YES_MIN_PCT}%</strong> of active voting power &nbsp;·&nbsp; ②{' '}
          <strong>YES − NO ≥ {MARGIN_MIN_PCT}%</strong> of active voting power. Both must hold when voting closes.
        </span>
      </div>

      <CreateProposal {...v} />

      {v.isDelegated && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
            padding: '16px 22px',
            background: C.sage,
            borderRadius: 18,
          }}
        >
          <span style={{ fontSize: 13.5, color: C.greenDark }}>
            Your voting power is delegated to <strong>{v.delegatedToName}</strong> — they vote on your behalf.{' '}
            {v.lockBannerNote}
          </span>
          <HoverButton
            onClick={v.revokeDelegation}
            hoverBg="#f2f5e9"
            style={{
              marginLeft: 'auto',
              flex: 'none',
              border: `1.5px solid ${C.green}`,
              background: '#fff',
              color: C.green,
              fontSize: 13,
              fontWeight: 800,
              padding: '8px 18px',
              borderRadius: 999,
              opacity: v.delegationLocked ? 0.5 : 1,
            }}
          >
            Revoke delegation
          </HoverButton>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {v.proposals.map((p) => (
          <ProposalCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

function CreateProposal(v) {
  const { state, patch, actionTabs, protocolChips, npTk, curAction } = v;
  const prev = ACTION_PREVIEW_META[curAction];
  const isTablet = useIsTablet();

  return (
    <Card style={{ borderRadius: 20, padding: 26, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: C.sand,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name="scroll" size={30} />
        </span>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Create a proposal</h3>
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: C.soft }}>
            Propose a trade for the DAO. It passes when YES reaches {YES_MIN_PCT}% of active voting power and leads NO by
            at least {MARGIN_MIN_PCT}%.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 16,
          padding: '12px 16px',
          borderRadius: 14,
          background: v.meetsThreshold ? '#eef3e5' : '#f8e8e2',
          border: `1px solid ${v.meetsThreshold ? '#d3e0c1' : '#ecccc0'}`,
          color: v.meetsThreshold ? C.greenDark : '#8a3b28',
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 800 }}>
          Proposal threshold · hold ≥ {v.thresholdFmt} voting power
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12 }}>
          You hold <strong>{v.ownershipPctFmt}</strong> ·{' '}
          <strong>{v.meetsThreshold ? 'Eligible ✓' : 'Below minimum'}</strong>
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1fr 330px',
          gap: 26,
          marginTop: 20,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={LABEL}>Action</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {actionTabs.map((a) => (
                <button
                  key={a.key}
                  onClick={a.onClick}
                  style={{
                    border: `1.5px solid ${a.on ? C.green : '#ded4bc'}`,
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: 13,
                    fontWeight: 800,
                    padding: '9px 18px',
                    borderRadius: 999,
                    background: a.on ? C.green : '#fff',
                    color: a.on ? C.cream : C.muted,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  {a.label}
                  {a.soon && <SoonTag />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={LABEL}>Execution protocol</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {protocolChips.map((p) => (
                <button
                  key={p.key}
                  onClick={p.onClick}
                  disabled={!p.live}
                  style={{
                    border: `1.5px solid ${p.on ? C.green : '#ded4bc'}`,
                    cursor: p.live ? 'pointer' : 'not-allowed',
                    font: 'inherit',
                    fontSize: 13,
                    fontWeight: 800,
                    padding: '7px 15px 7px 8px',
                    borderRadius: 999,
                    background: p.on ? C.sage : '#fff',
                    color: C.ink,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: p.live ? 1 : 0.55,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: p.dot,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 900,
                      flex: 'none',
                    }}
                  >
                    {p.badge}
                  </span>
                  {p.name}
                  {p.soon && <SoonTag />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ ...LABEL, marginBottom: 6 }}>Token</label>
              <select
                className="tribe-input"
                value={state.npToken}
                onChange={(e) => patch({ npToken: e.target.value })}
                style={{ ...INPUT, fontWeight: 700 }}
              >
                {TRADABLE.map((sym) => (
                  <option key={sym} value={sym}>
                    {sym} · {TOKENS[sym].name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ ...LABEL, marginBottom: 6 }}>Amount (USDC)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={state.npAmount}
                onChange={(e) => patch({ npAmount: e.target.value })}
                style={INPUT}
              />
            </div>
          </div>

          <div>
            <label style={{ ...LABEL, marginBottom: 6 }}>Investment thesis · required</label>
            <textarea
              rows={4}
              placeholder="Why should the DAO make this trade? Entry rationale, valuation, target and time horizon — members vote on your analysis."
              value={state.npThesis}
              onChange={(e) => patch({ npThesis: e.target.value })}
              style={{ ...INPUT, fontSize: 13.5, lineHeight: 1.55, resize: 'vertical', minHeight: 96 }}
            />
          </div>

          <div>
            <label style={LABEL}>Voting period · {v.votingDaysLabel}</label>
            <input
              type="range"
              min="3"
              max="10"
              value={state.votingDays}
              onChange={(e) => patch({ votingDays: parseInt(e.target.value, 10) })}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: C.faint, marginTop: 2 }}>
              <span>3 days min</span>
              <span>10 days max</span>
            </div>
          </div>
        </div>

        <div style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: C.faint,
              marginBottom: 12,
            }}
          >
            Order preview
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 999,
                background: prev.bg,
                color: prev.c,
              }}
            >
              {actionTabs.find((a) => a.on).label}
            </span>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: npTk.sw,
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {npTk.badge}
            </span>
            <strong style={{ fontSize: 16, fontWeight: 900 }}>{state.npToken}</strong>
            <span style={{ fontSize: 12, color: C.soft }}>{npTk.name}</span>
          </div>

          <PreviewRow label="Amount" value={v.npAmountFmt} />
          <PreviewRow label="Est. size" value={`${v.previewUnits} ${state.npToken}`} />
          <PreviewRow label="Price" value={v.previewPrice} />
          <PreviewRow label="Route" value={v.previewRoute} noBorder />
          <PreviewRow label="Voting period" value={v.votingDaysLabel} top />
          <PreviewRow
            label="Thesis"
            value={v.thesisOk ? 'Added ✓' : 'Required'}
            valueColor={v.thesisOk ? C.up : C.down}
            top
          />
          <PreviewRow
            label="Voting power"
            value={`${v.ownershipPctFmt} · ${v.meetsThreshold ? 'Eligible ✓' : 'Below minimum'}`}
            valueColor={v.meetsThreshold ? C.up : C.down}
            top
          />

          <HoverButton
            onClick={v.submitProposal}
            disabled={v.submitDisabled}
            hoverBg={C.greenDark}
            style={{
              width: '100%',
              marginTop: 14,
              border: 'none',
              fontSize: 14,
              fontWeight: 800,
              color: C.cream,
              background: C.green,
              padding: '12px 24px',
              borderRadius: 12,
              opacity: v.submitDisabled ? 0.45 : 1,
              cursor: v.submitDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            Submit proposal
          </HoverButton>
          <div style={{ fontSize: 11.5, color: C.faint, marginTop: 10, lineHeight: 1.5 }}>{v.createHint}</div>
        </div>
      </div>
    </Card>
  );
}

function SoonTag() {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        background: '#efe9d7',
        color: C.soft,
        padding: '1px 7px',
        borderRadius: 999,
      }}
    >
      SOON
    </span>
  );
}

function PreviewRow({ label, value, valueColor, noBorder, top }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '7px 0',
        fontSize: 13,
        borderBottom: noBorder || top ? undefined : `1px solid ${C.line}`,
        borderTop: top ? `1px solid ${C.line}` : undefined,
      }}
    >
      <span style={{ color: C.soft }}>{label}</span>
      <strong style={{ color: valueColor }}>{value}</strong>
    </div>
  );
}

function ProposalCard({ p }) {
  const km = KIND_META[p.kind] || KIND_META.other;
  const isActive = p.status === 'active';
  const tagBg = isActive ? '#efe9d7' : p.status === 'executed' ? C.sage : '#f1ede2';
  const tagColor = isActive ? '#6f6142' : p.status === 'executed' ? C.up : C.soft;

  return (
    <article style={{ background: '#fff', border: `1.5px solid ${C.line}`, borderRadius: 18, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 900, fontSize: 13, color: C.green }}>{p.id}</span>
        <span
          style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 9px', borderRadius: 999, background: km.bg, color: km.c }}
        >
          {km.label}
        </span>
        <h3 style={{ margin: 0, flex: 1, fontSize: 17, fontWeight: 900 }}>{p.title}</h3>
        <span
          style={{ fontSize: 11.5, fontWeight: 800, padding: '4px 14px', borderRadius: 999, background: tagBg, color: tagColor }}
        >
          {p.statusLabel}
        </span>
      </div>

      <p style={{ color: C.muted, fontSize: 13.5, margin: '10px 0 14px', maxWidth: 740, lineHeight: 1.6 }}>{p.summary}</p>

      <div style={{ display: 'flex', gap: 20, fontSize: 12.5, marginBottom: 16, color: C.soft }}>
        <span>
          Proposed by <strong style={{ color: C.ink }}>{p.analyst}</strong>
        </span>
        <span>{p.timing}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 150px', gap: 12, alignItems: 'center', fontSize: 12.5 }}>
        <span style={{ fontWeight: 800 }}>For</span>
        <Bar pct={p.forPct} color={C.green} />
        <span style={{ textAlign: 'right', color: C.soft }}>
          {p.forFmt} · {p.forPct}%
        </span>
        <span style={{ fontWeight: 800 }}>Against</span>
        <Bar pct={p.againstPct} color="#c2b98f" />
        <span style={{ textAlign: 'right', color: C.soft }}>
          {p.againstFmt} · {p.againstPct}%
        </span>
      </div>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.rule}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>Passing requirements</span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 11.5,
              padding: '3px 12px',
              borderRadius: 999,
              background: p.passOk ? C.sage : '#f6e3d6',
              color: p.passOk ? C.up : C.down,
            }}
          >
            {p.passBadgeLabel}
          </span>
        </div>

        <RuleBar
          label={`YES ≥ ${YES_MIN_PCT}% of active voting power`}
          valueFmt={p.yesPctFmt}
          met={p.yesMet}
          barPct={p.yesBarPct}
          markerPct={YES_MIN_PCT}
          markerLabel={`▲ ${YES_MIN_PCT}% min`}
        />
        <RuleBar
          label={`YES leads NO by ≥ ${MARGIN_MIN_PCT}% of active power`}
          valueFmt={p.marginPctFmt}
          met={p.marginMet}
          barPct={p.marginBarPct}
          markerPct={MARGIN_MIN_PCT}
          markerLabel={`▲ ${MARGIN_MIN_PCT}% lead`}
        />
      </div>

      {p.showVoteButtons && (
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <HoverButton
            onClick={p.voteFor}
            hoverBg={C.greenDark}
            style={{
              border: 'none',
              fontSize: 13.5,
              fontWeight: 800,
              color: C.cream,
              background: C.green,
              padding: '10px 24px',
              borderRadius: 999,
            }}
          >
            Vote For
          </HoverButton>
          <HoverButton
            onClick={p.voteAgainst}
            hoverBg="#f7f2e4"
            style={{
              border: '1.5px solid #d8ceb5',
              fontSize: 13.5,
              fontWeight: 800,
              color: C.ink,
              background: '#fff',
              padding: '10px 24px',
              borderRadius: 999,
            }}
          >
            Vote Against
          </HoverButton>
        </div>
      )}

      {p.note && <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 800, color: C.green }}>{p.note}</div>}
    </article>
  );
}

function Bar({ pct, color }) {
  return (
    <div style={{ height: 8, background: C.rule, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
    </div>
  );
}

function RuleBar({ label, valueFmt, met, barPct, markerPct, markerLabel }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
        <span style={{ fontWeight: 700, color: C.muted }}>{label}</span>
        <span style={{ fontWeight: 800, color: met ? C.up : C.down }}>
          {valueFmt} {met ? '✓' : '✗'}
        </span>
      </div>
      <div style={{ position: 'relative', height: 8, background: C.rule, borderRadius: 999 }}>
        <div
          style={{
            height: '100%',
            width: `${barPct}%`,
            background: met ? C.up : '#c2762e',
            borderRadius: 999,
          }}
        />
        <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${markerPct}%`, width: 2, background: '#8a6a45' }} />
      </div>
      <div style={{ position: 'relative', height: 14, margin: '2px 0 12px', fontSize: 10, color: '#8a6a45' }}>
        <span style={{ position: 'absolute', left: `${markerPct}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
          {markerLabel}
        </span>
      </div>
    </>
  );
}
