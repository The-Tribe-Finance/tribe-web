import { EXECUTED_COUNT, STEPS } from '../domain';
import { CommunityScene, Icon } from '../icons';
import { C, HoverButton } from '../ui';
import { useIsMobile, useIsTablet } from '../useMediaQuery';

const WRAP = { maxWidth: 1180, margin: '0 auto' };
// Horizontal page padding shrinks on small screens.
const PAD_X = 'clamp(16px, 4vw, 32px)';

export default function Landing(v) {
  return (
    <section>
      <Hero {...v} />
      <HowItWorks />
      <StatBand {...v} />
      <TwoWays {...v} />
      <RewardsExplainer {...v} />
      <FeesAndCta {...v} />
      <Community />
      <Footer />
    </section>
  );
}

function Hero({ vaultName, navFmt, topHoldings, ownershipFmt, userValueFmt, userPnlFmt, goPosition, goAnalysts }) {
  const isTablet = useIsTablet();
  return (
    <div
      style={{
        ...WRAP,
        padding: `clamp(32px, 6vw, 56px) ${PAD_X} 40px`,
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
        gap: isTablet ? 32 : 48,
        alignItems: 'center',
      }}
    >
      <div>
        <h1
          style={{
            margin: '0 0 18px',
            fontSize: 'clamp(34px, 6vw, 52px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.06,
          }}
        >
          Invest together.
          <br />
          <span style={{ color: C.greenMid }}>Grow together.</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.65, maxWidth: 440, margin: '0 0 26px' }}>
          A community-owned fund on Solana. Analysts propose trades, the community votes to quorum, and smart contracts
          execute via Jupiter. Redeem anytime — as USDC or the exact tokens you own.
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <HoverButton
            onClick={goPosition}
            hoverBg={C.greenDark}
            style={{
              border: 'none',
              fontSize: 15,
              fontWeight: 800,
              color: C.cream,
              background: C.green,
              padding: '13px 26px',
              borderRadius: 999,
            }}
          >
            Start investing →
          </HoverButton>
          <HoverButton
            onClick={goAnalysts}
            hoverBg="#f2ecdc"
            style={{
              border: '1.5px solid #d8ceb5',
              fontSize: 15,
              fontWeight: 800,
              color: C.ink,
              background: 'transparent',
              padding: '13px 26px',
              borderRadius: 999,
            }}
          >
            Become an analyst
          </HoverButton>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#fff',
            border: `1px solid ${C.line}`,
            padding: '8px 18px 8px 12px',
            borderRadius: 999,
            boxShadow: '0 4px 14px rgba(56,48,31,.06)',
          }}
        >
          <SolanaMark />
          <span style={{ fontSize: 13, fontWeight: 800 }}>
            Built on <span style={{ color: C.greenMid }}>Solana</span>
          </span>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: `1px solid ${C.line}`,
          borderRadius: 22,
          padding: 24,
          boxShadow: '0 18px 44px rgba(56,48,31,.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span
            style={{
              width: 46,
              height: 46,
              borderRadius: 999,
              background: C.sage,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <Icon name="teepee" size={26} />
          </span>
          <div style={{ marginRight: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16, fontWeight: 900 }}>{vaultName}</strong>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.green,
                  background: C.sage,
                  padding: '2px 10px',
                  borderRadius: 999,
                }}
              >
                Public
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: C.soft }}>A community-owned on-chain fund</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>Total Value Locked</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{navFmt}</div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.up }}>▲ 18.24% (30D)</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 14 }}>
          <div style={{ background: C.cream, borderRadius: 14, padding: 16, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>Portfolio Performance</span>
              <span style={{ fontSize: 10.5, color: C.soft }}>All Time</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.up, margin: '4px 0 8px' }}>+24.56%</div>
            <svg viewBox="0 0 240 90" style={{ width: '100%', display: 'block' }}>
              <defs>
                <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.greenMid} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={C.greenMid} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,78 L20,72 L40,76 L60,60 L80,66 L100,48 L120,54 L140,38 L160,30 L180,36 L200,18 L220,12 L240,6 L240,90 L0,90 Z"
                fill="url(#greenFill)"
              />
              <polyline
                points="0,78 20,72 40,76 60,60 80,66 100,48 120,54 140,38 160,30 180,36 200,18 220,12 240,6"
                fill="none"
                stroke={C.greenMid}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="240" cy="6" r="3.5" fill={C.greenMid} />
            </svg>
          </div>

          <div style={{ background: C.cream, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, marginBottom: 10 }}>Top Holdings</div>
            {topHoldings.map((t) => (
              <div key={t.sym} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '5px 0' }}>
                <span style={{ fontWeight: 800 }}>{t.sym}</span>
                <span style={{ color: C.muted, fontWeight: 700 }}>{t.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 14 }}>
          <MiniStat label="Your Share" value={ownershipFmt} />
          <MiniStat label="Your Value" value={userValueFmt} />
          <MiniStat label="Unrealized P&L" value={userPnlFmt} color={C.up} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: C.soft, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

function SolanaMark() {
  return (
    <span style={{ display: 'inline-flex' }}>
      <svg width="22" height="17" viewBox="0 0 24 19" fill="none">
        <defs>
          <linearGradient id="solmarkH" x1="0" y1="0" x2="24" y2="19" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9945FF" />
            <stop offset="1" stopColor="#14F195" />
          </linearGradient>
        </defs>
        <path d="M5.2 2 H23 L18.8 6 H1 Z" fill="url(#solmarkH)" />
        <path d="M1 7.5 H18.8 L23 11.5 H5.2 Z" fill="url(#solmarkH)" />
        <path d="M5.2 13 H23 L18.8 17 H1 Z" fill="url(#solmarkH)" />
      </svg>
    </span>
  );
}

function HowItWorks() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  return (
    <div style={{ ...WRAP, padding: `44px ${PAD_X} 24px` }}>
      <h2
        style={{
          margin: '0 0 32px',
          fontSize: 'clamp(24px, 4vw, 30px)',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        <Icon name="arrowR" size={26} />
        How Tribe Works
        <Icon name="arrowL" size={26} />
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: 18,
        }}
      >
        {STEPS.map((st) => (
          <div key={st.n} style={{ textAlign: 'center' }}>
            <span
              style={{
                width: 92,
                height: 92,
                borderRadius: 999,
                background: '#efe9d7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Icon name={st.icon} size={50} />
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: C.green,
                  color: C.cream,
                  fontSize: 11,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {st.n}
              </span>
              <span style={{ fontSize: 15, fontWeight: 900 }}>{st.title}</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, maxWidth: 190, margin: '0 auto' }}>
              {st.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BandCell({ icon, value, label, note, noteColor, cols = 4, idx = 0 }) {
  const endOfRow = (idx + 1) % cols === 0;
  const lastRow = idx >= Math.floor((4 - 1) / cols) * cols;
  return (
    <div
      style={{
        padding: '22px 20px',
        display: 'flex',
        gap: 13,
        alignItems: 'center',
        borderRight: endOfRow ? undefined : '1px solid rgba(255,255,255,.14)',
        borderBottom: lastRow ? undefined : '1px solid rgba(255,255,255,.14)',
      }}
    >
      <span
        style={{
          width: 46,
          height: 46,
          borderRadius: 999,
          background: '#eef2e2',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name={icon} size={30} />
      </span>
      <div>
        <div style={{ fontSize: 23, fontWeight: 900, color: C.cream, lineHeight: 1.05 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: '#cbd8ba', fontWeight: 700, margin: '3px 0 2px' }}>{label}</div>
        <div style={{ fontSize: 11.5, color: noteColor || '#9db98e', fontWeight: noteColor ? 800 : 700 }}>{note}</div>
      </div>
    </div>
  );
}

function StatBand({ navFmt, analystPoolFmt }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const cols = isMobile ? 1 : isTablet ? 2 : 4;
  return (
    <div style={{ ...WRAP, padding: `44px ${PAD_X} 12px` }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 900, letterSpacing: '-0.01em' }}>
        Tribe by the numbers
      </h2>
      <div
        style={{
          background: C.green,
          borderRadius: 22,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          boxShadow: '0 18px 44px rgba(56,48,31,.14)',
        }}
      >
        <BandCell icon="totem" value={navFmt} label="Total Value Locked" note="▲ 4.8% (30D)" noteColor="#a7d494" cols={cols} idx={0} />
        <BandCell icon="people3" value="3,214" label="Members" note="▲ 8.32% (30D)" noteColor="#a7d494" cols={cols} idx={1} />
        <BandCell icon="target" value={EXECUTED_COUNT} label="Proposals Executed" note="All-time" cols={cols} idx={2} />
        <BandCell
          icon="scroll"
          value={
            <>
              {analystPoolFmt}
              <span style={{ fontSize: 13, color: '#cbd8ba' }}>/yr</span>
            </>
          }
          label="Analyst rewards pool"
          note="Split by voting power"
          cols={cols}
          idx={3}
        />
      </div>
    </div>
  );
}

function TwoWays({ analystPoolFmt, goPosition, goAnalysts }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ ...WRAP, padding: `40px ${PAD_X} 8px` }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 900, letterSpacing: '-0.01em' }}>
        Two ways to take part
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: C.muted, maxWidth: 560 }}>
        Bring capital, bring conviction, or both. Tribe rewards each on its own terms.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div
          style={{
            background: '#fff',
            border: `1px solid ${C.line}`,
            borderRadius: 20,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: C.sage,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Icon name="pouch" size={34} />
          </span>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900 }}>Invest</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            Deposit USDC and receive vault shares. Vote directly or delegate to an analyst. Redeem your slice anytime —
            auto-swapped to USDC or sent to you in-kind.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 13 }}>✓ Own real assets pro-rata, always</span>
            <span style={{ fontSize: 13 }}>✓ Voting power scales with your position</span>
            <span style={{ fontSize: 13 }}>✓ No lock-up — redeem when you want</span>
          </div>
          <HoverButton
            onClick={goPosition}
            hoverBg={C.greenDark}
            style={{
              marginTop: 'auto',
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
            Deposit USDC →
          </HoverButton>
        </div>

        <div style={{ background: C.green, borderRadius: 20, padding: 28, color: C.cream, display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: 'rgba(255,255,255,.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Icon name="scroll" size={34} />
          </span>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900, color: C.cream }}>Become an analyst</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#d6dfc4', lineHeight: 1.6 }}>
            No capital required. Publish your thesis, propose trades, and earn from the analyst rewards pool — a share of
            every fee, split by the voting power delegated to you.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#eef2e2' }}>✓ Earn from the {analystPoolFmt}/yr rewards pool</span>
            <span style={{ fontSize: 13, color: '#eef2e2' }}>✓ Build a public, on-chain track record</span>
            <span style={{ fontSize: 13, color: '#eef2e2' }}>✓ More delegations → a bigger share</span>
          </div>
          <HoverButton
            onClick={goAnalysts}
            hoverBg="#efe9d7"
            style={{
              marginTop: 'auto',
              alignSelf: 'flex-start',
              border: 'none',
              fontSize: 14,
              fontWeight: 800,
              color: C.green,
              background: C.cream,
              padding: '12px 24px',
              borderRadius: 999,
            }}
          >
            Start as an analyst →
          </HoverButton>
        </div>
      </div>
    </div>
  );
}

function RewardsExplainer({ poolMgmtFmt, poolPerfFmt, analystPoolFmt }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  return (
    <div style={{ ...WRAP, padding: `24px ${PAD_X} 8px` }}>
      <div
        style={{
          background: C.sand,
          border: `1px solid ${C.line}`,
          borderRadius: 20,
          padding: 'clamp(20px, 4vw, 30px)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1.1fr 1fr 1fr 1fr',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900 }}>How analysts get paid</h3>
          <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Half of every protocol fee flows into a shared rewards pool, distributed to analysts in proportion to the
            voting power delegated to them.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.greenMid }}>{poolMgmtFmt}</div>
          <div style={{ fontSize: 12.5, fontWeight: 800 }}>Management fee</div>
          <div style={{ fontSize: 11.5, color: C.soft }}>0.5% NAV / yr</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.greenMid }}>{poolPerfFmt}</div>
          <div style={{ fontSize: 12.5, fontWeight: 800 }}>Performance fee</div>
          <div style={{ fontSize: 11.5, color: C.soft }}>10% above high-water mark</div>
        </div>
        <div style={{ background: C.green, borderRadius: 16, padding: '18px 20px', color: C.cream }}>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{analystPoolFmt}</div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#eef2e2' }}>Analyst rewards pool / yr</div>
          <div style={{ fontSize: 11.5, color: '#d6dfc4' }}>Split by voting power</div>
        </div>
      </div>
    </div>
  );
}

function FeesAndCta({ goPosition, goAnalysts }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  return (
    <div
      style={{
        ...WRAP,
        padding: `24px ${PAD_X}`,
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1.5fr 1fr',
        gap: 16,
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          background: C.sand,
          border: `1px solid ${C.line}`,
          borderRadius: 20,
          padding: 'clamp(20px, 4vw, 30px)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto auto',
          gap: isMobile ? 18 : 30,
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900 }}>Simple. Fair. Aligned.</h3>
          <p style={{ margin: 0, fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            Our fee model is designed to align incentives and grow together with the community.
          </p>
        </div>
        <Icon name="totem" size={46} />
        <div>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.greenMid }}>0.5%</div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Management Fee</div>
          <div style={{ fontSize: 11.5, color: C.soft }}>Charged annually on NAV</div>
        </div>
        <div>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.greenMid }}>10%</div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Performance Fee</div>
          <div style={{ fontSize: 11.5, color: C.soft }}>
            Only on profits above
            <br />
            High-Water Mark
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.green,
          borderRadius: 20,
          padding: 30,
          color: C.cream,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 21, fontWeight: 900, color: C.cream }}>Ready to join the tribe?</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#d6dfc4', lineHeight: 1.6 }}>
            Invest alongside the community, or put your analysis to work — the tribe grows together.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <HoverButton
              onClick={goPosition}
              hoverBg="#efe9d7"
              style={{
                border: 'none',
                fontSize: 13.5,
                fontWeight: 800,
                color: C.green,
                background: C.cream,
                padding: '11px 22px',
                borderRadius: 999,
              }}
            >
              Start investing
            </HoverButton>
            <HoverButton
              onClick={goAnalysts}
              hoverBg="rgba(255,255,255,.1)"
              style={{
                border: '1.5px solid rgba(255,255,255,.4)',
                fontSize: 13.5,
                fontWeight: 800,
                color: C.cream,
                background: 'transparent',
                padding: '11px 22px',
                borderRadius: 999,
              }}
            >
              Become an analyst
            </HoverButton>
          </div>
        </div>
        <span
          style={{
            width: 104,
            height: 104,
            borderRadius: 999,
            background: 'rgba(255,255,255,.1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name="flagWhite" size={60} />
        </span>
      </div>
    </div>
  );
}

function SocialLink({ href, brandColor, icon, name, meta }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background: C.cream,
        color: C.ink,
        padding: '15px 22px',
        borderRadius: 16,
        minWidth: 210,
        boxShadow: '0 8px 22px rgba(20,16,8,.28)',
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 999,
          background: brandColor,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        {icon}
      </span>
      <span style={{ lineHeight: 1.3 }}>
        <strong style={{ fontSize: 15, fontWeight: 900 }}>{name}</strong>
        <br />
        <span style={{ fontSize: 12, color: C.soft }}>{meta}</span>
      </span>
    </a>
  );
}

function Community() {
  return (
    <div style={{ ...WRAP, padding: `40px ${PAD_X} 8px` }}>
      <div
        style={{
          position: 'relative',
          borderRadius: 22,
          overflow: 'hidden',
          border: `1px solid ${C.line}`,
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <CommunityScene style={{ position: 'absolute', inset: 0 }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(40,32,20,.94) 0%, rgba(40,32,20,.9) 38%, rgba(40,32,20,.55) 66%, rgba(40,32,20,.18) 100%)',
          }}
        />
        <div style={{ position: 'relative', padding: '44px 40px', color: C.cream, width: '100%' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 900, color: C.cream, letterSpacing: '-0.01em' }}>
            Join the tribe community
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#e2d6bd', lineHeight: 1.6, maxWidth: 460 }}>
            Discuss theses, debate proposals, and follow analysts in real time. Come help shape what the DAO buys next.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <SocialLink
              href="https://t.me"
              brandColor="#229ED9"
              name="Telegram"
              meta="12,480 members"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                  <path d="M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.16L16.9 6.6c.4-.36-.09-.56-.62-.2L6.7 12.7l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6l19.4-7.48c.9-.33 1.7.2 1.55 1.24z" />
                </svg>
              }
            />
            <SocialLink
              href="https://discord.com"
              brandColor="#5865F2"
              name="Discord"
              meta="8,210 online"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                  <path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a13 13 0 0 1 3.7 1.9 12 12 0 0 0-10.9 0A13 13 0 0 1 11.3 4.4L11 4A17 17 0 0 0 6.7 5.3C3.9 9.5 3.2 13.6 3.5 17.6A17 17 0 0 0 8.7 20l.6-.9c-.9-.3-1.7-.7-2.5-1.2l.6-.4a12 12 0 0 0 10.3 0l.6.4c-.8.5-1.6.9-2.5 1.2l.6.9a17 17 0 0 0 5.2-2.4c.4-4.6-.7-8.7-2.8-12.3zM9.5 15.3c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm5 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const FOOTER_COLS = [
  ['Product', ['Portfolio', 'Governance', 'How It Works', 'Fees']],
  ['For Analysts', ['Become an Analyst', 'Analyst Dashboard', 'Earnings', 'Resources']],
  ['Support', ['Docs', 'Guides', 'FAQ', 'Contact']],
];

function Footer() {
  const isMobile = useIsMobile();
  return (
    <footer style={{ borderTop: `1px solid ${C.line}`, background: C.sand, marginTop: 40 }}>
      <div
        style={{
          ...WRAP,
          padding: `36px ${PAD_X}`,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr',
          gap: isMobile ? 24 : 32,
          fontSize: 13,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: C.green,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="teepeeWhite" size={20} />
            </span>
            <strong style={{ fontSize: 17, fontWeight: 900 }}>Tribe</strong>
          </div>
          <p style={{ margin: 0, color: C.muted, lineHeight: 1.6, maxWidth: 260 }}>
            A community-owned investment platform on Solana. Transparent, secure, and built for everyone.
          </p>
        </div>
        {FOOTER_COLS.map(([title, links]) => (
          <div key={title}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, color: C.muted }}>
              {links.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, margin: '0 32px' }} />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 32px 26px' }}>
        <span style={{ fontSize: 12, color: C.soft }}>© 2026 Tribe. All rights reserved.</span>
      </div>
    </footer>
  );
}
