import { C, Card, HoverButton } from '../ui';

const INPUT = {
  width: 180,
  boxSizing: 'border-box',
  font: 'inherit',
  fontSize: 14,
  padding: '10px 12px',
  border: '1.5px solid #ded4bc',
  borderRadius: 12,
  background: C.cream,
  color: C.ink,
  outline: 'none',
};

const BTN = {
  border: 'none',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 12.5,
  fontWeight: 800,
  padding: '10px 16px',
  borderRadius: 999,
  color: C.cream,
  background: C.green,
};

/**
 * Compact lock/unlock control (plan decision #11). Real voting power only
 * accrues to LOCKED shares (`VoterWeightRecord.voter_weight`) — this is the
 * only affordance that lets that number move off zero. Reuses `Card`/
 * `HoverButton` from ui.jsx; not a redesign, four buttons + one input + one
 * read-only status line.
 */
export default function LockPanel(v) {
  const {
    state,
    patch,
    lockerStatusNote,
    unlockWaitNote,
    lockDisabled,
    requestUnlockDisabled,
    cancelUnlockDisabled,
    withdrawDisabled,
    lockSharesAction,
    requestUnlockAction,
    cancelUnlockAction,
    withdrawUnlockedAction,
  } = v;

  return (
    <Card style={{ borderRadius: 20, padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Lock shares for voting power</h3>
        <span style={{ fontSize: 12, color: C.soft }}>{lockerStatusNote}</span>
      </div>
      <p style={{ margin: '6px 0 16px', fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
        Locking converts vault shares into real, on-chain voting power. {unlockWaitNote}
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="number"
          min="0"
          placeholder="Amount to lock"
          value={state.lockAmount}
          onChange={(e) => patch({ lockAmount: e.target.value })}
          style={INPUT}
        />
        <HoverButton
          onClick={lockSharesAction}
          disabled={lockDisabled}
          hoverBg={C.greenDark}
          style={{ ...BTN, opacity: lockDisabled ? 0.45 : 1, cursor: lockDisabled ? 'not-allowed' : 'pointer' }}
        >
          Lock
        </HoverButton>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
        <input
          type="number"
          min="0"
          placeholder="Amount to unlock"
          value={state.unlockAmount}
          onChange={(e) => patch({ unlockAmount: e.target.value })}
          style={INPUT}
        />
        <HoverButton
          onClick={requestUnlockAction}
          disabled={requestUnlockDisabled}
          hoverBg="#f7f2e4"
          style={{
            ...BTN,
            color: C.ink,
            background: '#fff',
            border: '1.5px solid #d8ceb5',
            opacity: requestUnlockDisabled ? 0.45 : 1,
            cursor: requestUnlockDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Request unlock
        </HoverButton>
        <HoverButton
          onClick={cancelUnlockAction}
          disabled={cancelUnlockDisabled}
          hoverBg="#f7f2e4"
          style={{
            ...BTN,
            color: C.ink,
            background: '#fff',
            border: '1.5px solid #d8ceb5',
            opacity: cancelUnlockDisabled ? 0.45 : 1,
            cursor: cancelUnlockDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel unlock
        </HoverButton>
        <HoverButton
          onClick={withdrawUnlockedAction}
          disabled={withdrawDisabled}
          hoverBg={C.greenDark}
          style={{ ...BTN, opacity: withdrawDisabled ? 0.45 : 1, cursor: withdrawDisabled ? 'not-allowed' : 'pointer' }}
        >
          Withdraw
        </HoverButton>
      </div>
    </Card>
  );
}
