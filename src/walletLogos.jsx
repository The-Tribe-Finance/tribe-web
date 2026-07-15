/**
 * Official wallet brand marks. Sourced from each wallet's own repo/brand kit
 * and inlined (the app's CSP blocks remote images):
 *   - Phantom : @solana/wallet-adapter-phantom (official data-URI icon)
 *   - Backpack: coral-xyz/backpack web/public/logo.svg (icon portion)
 *   - MetaMask: MetaMask/metamask-extension app/images/logo/metamask-fox.svg
 */

const TILE = {
  width: 38,
  height: 38,
  borderRadius: 11,
  flex: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

// Phantom's official icon (rounded purple tile + white ghost), already a
// self-contained data URI, so it renders as-is at the tile size.
const PHANTOM_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9IiNBQjlGRjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00Ni41MjY3IDY5LjkyMjlDNDIuMDA1NCA3Ni44NTA5IDM0LjQyOTIgODUuNjE4MiAyNC4zNDggODUuNjE4MkMxOS41ODI0IDg1LjYxODIgMTUgODMuNjU2MyAxNSA3NS4xMzQyQzE1IDUzLjQzMDUgNDQuNjMyNiAxOS44MzI3IDcyLjEyNjggMTkuODMyN0M4Ny43NjggMTkuODMyNyA5NCAzMC42ODQ2IDk0IDQzLjAwNzlDOTQgNTguODI1OCA4My43MzU1IDc2LjkxMjIgNzMuNTMyMSA3Ni45MTIyQzcwLjI5MzkgNzYuOTEyMiA2OC43MDUzIDc1LjEzNDIgNjguNzA1MyA3Mi4zMTRDNjguNzA1MyA3MS41NzgzIDY4LjgyNzUgNzAuNzgxMiA2OS4wNzE5IDY5LjkyMjlDNjUuNTg5MyA3NS44Njk5IDU4Ljg2ODUgODEuMzg3OCA1Mi41NzU0IDgxLjM4NzhDNDcuOTkzIDgxLjM4NzggNDUuNjcxMyA3OC41MDYzIDQ1LjY3MTMgNzQuNDU5OEM0NS42NzEzIDcyLjk4ODQgNDUuOTc2OCA3MS40NTU2IDQ2LjUyNjcgNjkuOTIyOVpNODMuNjc2MSA0Mi41Nzk0QzgzLjY3NjEgNDYuMTcwNCA4MS41NTc1IDQ3Ljk2NTggNzkuMTg3NSA0Ny45NjU4Qzc2Ljc4MTYgNDcuOTY1OCA3NC42OTg5IDQ2LjE3MDQgNzQuNjk4OSA0Mi41Nzk0Qzc0LjY5ODkgMzguOTg4NSA3Ni43ODE2IDM3LjE5MzEgNzkuMTg3NSAzNy4xOTMxQzgxLjU1NzUgMzcuMTkzMSA4My42NzYxIDM4Ljk4ODUgODMuNjc2MSA0Mi41Nzk0Wk03MC4yMTAzIDQyLjU3OTVDNzAuMjEwMyA0Ni4xNzA0IDY4LjA5MTYgNDcuOTY1OCA2NS43MjE2IDQ3Ljk2NThDNjMuMzE1NyA0Ny45NjU4IDYxLjIzMyA0Ni4xNzA0IDYxLjIzMyA0Mi41Nzk1QzYxLjIzMyAzOC45ODg1IDYzLjMxNTcgMzcuMTkzMSA2NS43MjE2IDM3LjE5MzFDNjguMDkxNiAzNy4xOTMxIDcwLjIxMDMgMzguOTg4NSA3MC4yMTAzIDQyLjU3OTVaIiBmaWxsPSIjRkZGREY4Ii8+Cjwvc3ZnPg==';

function PhantomLogo() {
  return (
    <span style={TILE}>
      <img src={PHANTOM_ICON} alt="Phantom" width={38} height={38} />
    </span>
  );
}

function BackpackLogo() {
  // Backpack's current brand mark: the red (#E33E3F) backpack icon from
  // backpack.app/logo.svg, on the dark tile the extension uses.
  return (
    <span style={{ ...TILE, background: '#0e0e10' }}>
      <svg width="20" height="20" viewBox="0 0 19.25 28" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.4485 2.20159C12.4662 2.20159 13.4208 2.33802 14.3047 2.59104C13.4394 0.574296 11.6427 0 9.64316 0C7.6397 0 5.83992 0.576553 4.97656 2.60292C5.85392 2.341 6.80442 2.20159 7.81865 2.20159H11.4485ZM7.58586 4.22632C2.75337 4.22632 0 8.028 0 12.7176V17.535C0 18.004 0.391751 18.375 0.875 18.375H18.375C18.8582 18.375 19.25 18.004 19.25 17.535V12.7176C19.25 8.028 16.0482 4.22632 11.2157 4.22632H7.58586ZM9.61816 12.7593C11.3095 12.7593 12.6807 11.3881 12.6807 9.69678C12.6807 8.00541 11.3095 6.63428 9.61816 6.63428C7.92679 6.63428 6.55566 8.00541 6.55566 9.69678C6.55566 11.3881 7.92679 12.7593 9.61816 12.7593ZM0 21.2066C0 20.7376 0.391751 20.3574 0.875 20.3574H18.375C18.8582 20.3574 19.25 20.7376 19.25 21.2066V26.3013C19.25 27.2392 18.4665 27.9996 17.5 27.9996H1.75C0.783501 27.9996 0 27.2392 0 26.3013V21.2066Z"
          fill="#E33E3F"
        />
      </svg>
    </span>
  );
}

function MetaMaskLogo() {
  // MetaMask's official fox, on a light tile.
  return (
    <span style={{ ...TILE, background: '#fff7f2' }}>
      <svg width="26" height="25" viewBox="0 0 35 33" fill="none" aria-hidden="true">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth=".25">
          <path d="m32.9582 1-13.1341 9.7183 2.4424-5.72731z" fill="#e17726" stroke="#e17726" />
          <g fill="#e27625" stroke="#e27625">
            <path d="m2.66296 1 13.01714 9.809-2.3254-5.81802z" />
            <path d="m28.2295 23.5335-3.4947 5.3386 7.4829 2.0603 2.1436-7.2823z" />
            <path d="m1.27281 23.6501 2.13055 7.2823 7.46994-2.0603-3.48166-5.3386z" />
            <path d="m10.4706 14.5149-2.0786 3.1358 7.405.3369-.2469-7.969z" />
            <path d="m25.1505 14.5149-5.1575-4.58704-.1688 8.05974 7.4049-.3369z" />
            <path d="m10.8733 28.8721 4.4819-2.1639-3.8583-3.0062z" />
            <path d="m20.2659 26.7082 4.4689 2.1639-.6105-5.1701z" />
          </g>
          <path d="m24.7348 28.8721-4.469-2.1639.3638 2.9025-.039 1.231z" fill="#d5bfb2" stroke="#d5bfb2" />
          <path d="m10.8732 28.8721 4.1572 1.9696-.026-1.231.3508-2.9025z" fill="#d5bfb2" stroke="#d5bfb2" />
          <path d="m15.1084 21.7842-3.7155-1.0884 2.6243-1.2051z" fill="#233447" stroke="#233447" />
          <path d="m20.5126 21.7842 1.0913-2.2935 2.6372 1.2051z" fill="#233447" stroke="#233447" />
          <path d="m10.8733 28.8721.6495-5.3386-4.13117.1167z" fill="#cc6228" stroke="#cc6228" />
          <path d="m24.0982 23.5335.6366 5.3386 3.4946-5.2219z" fill="#cc6228" stroke="#cc6228" />
          <path d="m27.2291 17.6507-7.405.3369.6885 3.7966 1.0913-2.2935 2.6372 1.2051z" fill="#cc6228" stroke="#cc6228" />
          <path d="m11.3929 20.6958 2.6242-1.2051 1.0913 2.2935.6885-3.7966-7.40495-.3369z" fill="#cc6228" stroke="#cc6228" />
          <path d="m8.392 17.6507 3.1049 6.0513-.1039-3.0062z" fill="#e27525" stroke="#e27525" />
          <path d="m24.2412 20.6958-.1169 3.0062 3.1049-6.0513z" fill="#e27525" stroke="#e27525" />
          <path d="m15.797 17.9876-.6886 3.7967.8704 4.4833.1949-5.9087z" fill="#e27525" stroke="#e27525" />
          <path d="m19.8242 17.9876-.3638 2.3584.1819 5.9216.8704-4.4833z" fill="#e27525" stroke="#e27525" />
          <path d="m20.5127 21.7842-.8704 4.4834.6236.4406 3.8584-3.0062.1169-3.0062z" fill="#f5841f" stroke="#f5841f" />
          <path d="m11.3929 20.6958.104 3.0062 3.8583 3.0062.6236-.4406-.8704-4.4834z" fill="#f5841f" stroke="#f5841f" />
          <path d="m20.5906 30.8417.039-1.231-.3378-.2851h-4.9626l-.3248.2851.026 1.231-4.1572-1.9696 1.4551 1.1921 2.9489 2.0344h5.0536l2.962-2.0344 1.442-1.1921z" fill="#c0ac9d" stroke="#c0ac9d" />
          <path d="m20.2659 26.7082-.6236-.4406h-3.6635l-.6236.4406-.3508 2.9025.3248-.2851h4.9626l.3378.2851z" fill="#161616" stroke="#161616" />
          <path d="m33.5168 11.3532 1.1043-5.36447-1.6629-4.98873-12.6923 9.3944 4.8846 4.1205 6.8983 2.0085 1.52-1.7752-.6626-.4795 1.0523-.9588-.8054-.622 1.0523-.8034z" fill="#763e1a" stroke="#763e1a" />
          <path d="m1 5.98873 1.11724 5.36447-.71451.5313 1.06527.8034-.80545.622 1.05228.9588-.66255.4795 1.51997 1.7752 6.89835-2.0085 4.8846-4.1205-12.69233-9.3944z" fill="#763e1a" stroke="#763e1a" />
          <path d="m32.0489 16.5234-6.8983-2.0085 2.0786 3.1358-3.1049 6.0513 4.1052-.0519h6.1318z" fill="#f5841f" stroke="#f5841f" />
          <path d="m10.4705 14.5149-6.89828 2.0085-2.29944 7.1267h6.11883l4.10519.0519-3.10487-6.0513z" fill="#f5841f" stroke="#f5841f" />
          <path d="m19.8241 17.9876.4417-7.5932 2.0007-5.4034h-8.9119l2.0006 5.4034.4417 7.5932.1689 2.3842.013 5.8958h3.6635l.013-5.8958z" fill="#f5841f" stroke="#f5841f" />
        </g>
      </svg>
    </span>
  );
}

const LOGOS = {
  phantom: PhantomLogo,
  backpack: BackpackLogo,
  metamask: MetaMaskLogo,
};

/** Render a wallet's brand logo by id; falls back to nothing if unknown. */
export function WalletLogo({ id }) {
  const L = LOGOS[id];
  return L ? <L /> : null;
}
