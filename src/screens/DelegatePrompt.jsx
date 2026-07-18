import { LOCK_DAYS } from '../domain';
import { Icon } from '../icons';
import { C } from '../ui';

/** Shown right after a deposit when the member holds voting power but hasn't delegated. */
export default function DelegatePrompt({ delegateOptions, keepDirectVoting, closeDelegatePrompt }) {
  return (
    <div
      onClick={closeDelegatePrompt}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(40,32,20,.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 22,
          padding: 30,
          maxWidth: 560,
          width: '100%',
          boxShadow: '0 30px 70px rgba(20,16,8,.4)',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 6 }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: C.sage,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <Icon name="people3" size={30} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Put your voting power to work</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
              You've locked shares — you now hold voting power but haven't delegated it. Pick an analyst to vote on
              your behalf, or keep voting yourself.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0 8px' }}>
          {delegateOptions.map((d) => (
            <button
              key={d.key}
              onClick={d.choose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                border: `1.5px solid ${C.line}`,
                background: C.cream,
                cursor: 'pointer',
                font: 'inherit',
                padding: '14px 16px',
                borderRadius: 16,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  background: C.green,
                  color: C.cream,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  flex: 'none',
                }}
              >
                {d.initials}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 900, color: C.ink }}>{d.name}</span>
                <span style={{ display: 'block', fontSize: 12, color: C.soft }}>{d.record}</span>
              </span>
              <span style={{ textAlign: 'right', flex: 'none' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 900, color: C.up }}>{d.stakeFmt}</span>
                <span style={{ display: 'block', fontSize: 10.5, color: C.soft, fontWeight: 700 }}>analyst stake</span>
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={keepDirectVoting}
          style={{
            width: '100%',
            border: '1.5px solid #ded4bc',
            background: '#fff',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 13.5,
            fontWeight: 800,
            color: C.ink,
            padding: '12px 20px',
            borderRadius: 12,
            marginTop: 6,
          }}
        >
          I'll vote myself
        </button>
        <p style={{ margin: '12px 0 0', fontSize: 11.5, color: C.faint, lineHeight: 1.5 }}>
          For governance stability we suggest keeping a delegate for at least {LOCK_DAYS} days before switching — you're
          always free to change or revoke it on-chain immediately.
        </p>
      </div>
    </div>
  );
}
