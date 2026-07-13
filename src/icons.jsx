const O = '#5b4327';

const LIB = {
  teepee:
    '<path d="M19 4 27 14 M29 4 21 14" stroke="#8a6a45" stroke-width="2.5" stroke-linecap="round"/><path d="M24 9 41 41 H7 Z" fill="#e8cf9e" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/><path d="M14 29 l4 -3 4 3 4 -3 4 3 4 -3" stroke="#b3452f" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M24 30 29 41 H19 Z" fill="#6f5233" stroke="' + O + '" stroke-width="1.5" stroke-linejoin="round"/>',
  teepeeWhite:
    '<path d="M19 4 27 14 M29 4 21 14" stroke="#cdd8b4" stroke-width="2.5" stroke-linecap="round"/><path d="M24 9 41 41 H7 Z" fill="#e8cf9e" stroke="#faf6ec" stroke-width="2" stroke-linejoin="round"/><path d="M14 29 l4 -3 4 3 4 -3 4 3 4 -3" stroke="#b3452f" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M24 30 29 41 H19 Z" fill="#6f5233" stroke="#faf6ec" stroke-width="1.5" stroke-linejoin="round"/>',
  people3:
    '<circle cx="11" cy="18" r="4.5" fill="#ecb98c" stroke="' + O + '" stroke-width="1.5"/><circle cx="37" cy="18" r="4.5" fill="#ecb98c" stroke="' + O + '" stroke-width="1.5"/><path d="M8 16.5 h6" stroke="#4a6b35" stroke-width="1.8"/><path d="M34 16.5 h6" stroke="#b3452f" stroke-width="1.8"/><path d="M4 38 c0-5 3-8 7-8 s7 3 7 8 v1 H4 Z" fill="#8a6a45" stroke="' + O + '" stroke-width="1.5"/><path d="M30 38 c0-5 3-8 7-8 s7 3 7 8 v1 H30 Z" fill="#a8503a" stroke="' + O + '" stroke-width="1.5"/><path d="M22.5 4.5 c0 -2 1.5 -3.2 1.5 -3.2 s1.5 1.2 1.5 3.2 L24 7.5 Z" fill="#b3452f" stroke="' + O + '" stroke-width="1"/><circle cx="24" cy="13" r="5.5" fill="#ecb98c" stroke="' + O + '" stroke-width="1.5"/><path d="M18.5 11.5 h11" stroke="#b3452f" stroke-width="2"/><path d="M14 39 c0-6 4.5-10 10-10 s10 4 10 10 v1 H14 Z" fill="#4a6b35" stroke="' + O + '" stroke-width="1.8"/>',
  people2:
    '<path d="M13.5 4 c0 -2 1.5 -3.2 1.5 -3.2 s1.5 1.2 1.5 3.2 L15 7 Z" fill="#4a6b35" stroke="' + O + '" stroke-width="1"/><path d="M31.5 4 c0 -2 1.5 -3.2 1.5 -3.2 s1.5 1.2 1.5 3.2 L33 7 Z" fill="#b3452f" stroke="' + O + '" stroke-width="1"/><circle cx="15" cy="14" r="5.5" fill="#ecb98c" stroke="' + O + '" stroke-width="1.5"/><circle cx="33" cy="14" r="5.5" fill="#ecb98c" stroke="' + O + '" stroke-width="1.5"/><path d="M9.5 12.5 h11" stroke="#4a6b35" stroke-width="2"/><path d="M27.5 12.5 h11" stroke="#b3452f" stroke-width="2"/><path d="M5 39 c0-6 4.5-10 10-10 s10 4 10 10 v1 H5 Z" fill="#4a6b35" stroke="' + O + '" stroke-width="1.8"/><path d="M23 39 c0-6 4.5-10 10-10 s10 4 10 10 v1 H23 Z" fill="#a8503a" stroke="' + O + '" stroke-width="1.8"/>',
  scroll:
    '<rect x="9" y="12" width="30" height="24" fill="#f2e4c4" stroke="' + O + '" stroke-width="1.8"/><rect x="5.5" y="7" width="37" height="7.5" rx="3.75" fill="#dfc79a" stroke="' + O + '" stroke-width="1.8"/><rect x="5.5" y="33.5" width="37" height="7.5" rx="3.75" fill="#dfc79a" stroke="' + O + '" stroke-width="1.8"/><path d="M14 20 h20 M14 25 h20 M14 30 h13" stroke="#b39b6a" stroke-width="1.6" stroke-linecap="round"/><path d="M35 9 q3 6 -1 12" stroke="#b3452f" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  scrollCheck:
    '<rect x="9" y="12" width="30" height="24" fill="#f2e4c4" stroke="' + O + '" stroke-width="1.8"/><rect x="5.5" y="7" width="37" height="7.5" rx="3.75" fill="#dfc79a" stroke="' + O + '" stroke-width="1.8"/><rect x="5.5" y="33.5" width="37" height="7.5" rx="3.75" fill="#dfc79a" stroke="' + O + '" stroke-width="1.8"/><path d="M17 24 l5 5 9 -10" stroke="#4a6b35" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  shield:
    '<path d="M24 4 39 9.5 V23 c0 9 -6 14 -15 19 C15 37 9 32 9 23 V9.5 Z" fill="#d9b877" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/><path d="M24 12 l6.5 14 -6.5 -3.5 -6.5 3.5 Z" fill="#4a6b35" stroke="' + O + '" stroke-width="1.5" stroke-linejoin="round"/><circle cx="24" cy="32.5" r="2" fill="' + O + '"/>',
  chest:
    '<path d="M9 21.5 c0-8 7-11.5 15-11.5 s15 3.5 15 11.5 v1.5 H9 Z" fill="#8a6a45" stroke="' + O + '" stroke-width="2"/><circle cx="16.5" cy="20" r="3" fill="#b3452f" stroke="' + O + '" stroke-width="1.2"/><circle cx="24" cy="18.5" r="3.4" fill="#4a6b35" stroke="' + O + '" stroke-width="1.2"/><circle cx="31.5" cy="20" r="3" fill="#3f7d8c" stroke="' + O + '" stroke-width="1.2"/><rect x="9" y="23" width="30" height="17" rx="2.5" fill="#a5794f" stroke="' + O + '" stroke-width="2"/><rect x="21" y="23" width="6" height="17" fill="#8a6a45" stroke="' + O + '" stroke-width="1.5"/><circle cx="24" cy="29.5" r="2.4" fill="#e8b544" stroke="' + O + '" stroke-width="1.2"/>',
  target:
    '<circle cx="24" cy="26" r="15" fill="#f2e4c4" stroke="' + O + '" stroke-width="2"/><circle cx="24" cy="26" r="10" fill="#cf5f43" stroke="' + O + '" stroke-width="1.5"/><circle cx="24" cy="26" r="5" fill="#f2e4c4" stroke="' + O + '" stroke-width="1.5"/><path d="M24 26 40 7.5" stroke="#8a6a45" stroke-width="2.6" stroke-linecap="round"/><path d="M40 7.5 l-7 1.2 M40 7.5 l-1.2 7" stroke="#b3452f" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="26" r="2" fill="' + O + '"/>',
  mountainFlag:
    '<path d="M7 41 24 12 41 41 Z" fill="#7d9a5c" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/><path d="M19.5 20 24 12 28.5 20 26 18.5 24 21 22 18.5 Z" fill="#efe1c2" stroke="' + O + '" stroke-width="1.3" stroke-linejoin="round"/><path d="M24 12 V3" stroke="' + O + '" stroke-width="2" stroke-linecap="round"/><path d="M24 3 h9.5 l-3 3.75 3 3.75 H24 Z" fill="#b3452f" stroke="' + O + '" stroke-width="1.5" stroke-linejoin="round"/>',
  flagWhite:
    '<path d="M7 41 24 14 41 41 Z" fill="#7d9a5c" stroke="#dfe6cf" stroke-width="2" stroke-linejoin="round"/><path d="M20 22 24 14 28 22 Z" fill="#eef2e2" stroke="#dfe6cf" stroke-width="1.2" stroke-linejoin="round"/><path d="M24 14 V4" stroke="#dfe6cf" stroke-width="2" stroke-linecap="round"/><path d="M24 4 h10 l-3 4 3 4 H24 Z" fill="#e8b544" stroke="#dfe6cf" stroke-width="1.4" stroke-linejoin="round"/>',
  pouch:
    '<path d="M18.5 13.5 C11 17.5 8 23.5 8 29 c0 8 7 12 16 12 s16 -4 16 -12 c0 -5.5 -3 -11.5 -10.5 -15.5 Z" fill="#c9a36a" stroke="' + O + '" stroke-width="2"/><path d="M18 13.5 c2.2 -2.2 3 -4.5 3 -7 h6 c0 2.5 0.8 4.8 3 7 c-3 2.2 -9 2.2 -12 0 Z" fill="#8a6a45" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="24" cy="29" r="6.2" fill="#e8b544" stroke="' + O + '" stroke-width="1.5"/><text x="24" y="32.5" text-anchor="middle" font-size="10" font-weight="800" font-family="Nunito, sans-serif" fill="#8a6a45">$</text>',
  totem:
    '<path d="M19 6 h10 l3.5 5.5 h-17 Z" fill="#4a6b35" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 24 h-7 v6 h7 M32 24 h7 v6 h-7" fill="#c9a36a" stroke="' + O + '" stroke-width="1.6"/><rect x="16" y="11.5" width="16" height="28.5" rx="3" fill="#8a6a45" stroke="' + O + '" stroke-width="2"/><circle cx="20.5" cy="18" r="1.9" fill="#efe1c2"/><circle cx="27.5" cy="18" r="1.9" fill="#efe1c2"/><path d="M20 23.5 h8" stroke="#efe1c2" stroke-width="1.8" stroke-linecap="round"/><circle cx="20.5" cy="31" r="1.9" fill="#e8b544"/><circle cx="27.5" cy="31" r="1.9" fill="#e8b544"/><path d="M20 36 h8" stroke="#e8b544" stroke-width="1.8" stroke-linecap="round"/>',
  arrowR:
    '<path d="M6 24 H39 M39 24 l-7 -4.8 M39 24 l-7 4.8 M12 24 l-4.5 -4.5 M12 24 l-4.5 4.5 M17 24 l-4.5 -4.5 M17 24 l-4.5 4.5" stroke="#c2762e" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
  arrowL:
    '<path d="M42 24 H9 M9 24 l7 -4.8 M9 24 l7 4.8 M36 24 l4.5 -4.5 M36 24 l4.5 4.5 M31 24 l4.5 -4.5 M31 24 l4.5 4.5" stroke="#c2762e" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
};

/** A tribal-style SVG glyph from the icon library, sized in px. */
export function Icon({ name, size = 24, style }) {
  return (
    <span
      style={{ display: 'inline-flex', ...style }}
      dangerouslySetInnerHTML={{
        __html:
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="0 0 48 48" fill="none">' +
          LIB[name] +
          '</svg>',
      }}
    />
  );
}

const COMMUNITY_O = '#3a2f1c';

const COMMUNITY_SCENE =
  '<defs>' +
  '<linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#241d10"/><stop offset="50%" stop-color="#573f21"/><stop offset="100%" stop-color="#9a6c37"/></linearGradient>' +
  '<radialGradient id="cglow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f4b25a" stop-opacity="0.85"/><stop offset="100%" stop-color="#f4b25a" stop-opacity="0"/></radialGradient>' +
  '</defs>' +
  '<rect width="1200" height="360" fill="url(#csky)"/>' +
  '<circle cx="250" cy="66" r="26" fill="#f3e6c0" opacity="0.9"/>' +
  '<g fill="#f3e6c0" opacity="0.7"><circle cx="120" cy="48" r="2"/><circle cx="430" cy="40" r="1.6"/><circle cx="560" cy="70" r="2"/><circle cx="360" cy="96" r="1.4"/><circle cx="700" cy="44" r="1.8"/><circle cx="180" cy="112" r="1.4"/><circle cx="620" cy="30" r="1.4"/></g>' +
  '<ellipse cx="960" cy="252" rx="250" ry="130" fill="url(#cglow)"/>' +
  '<path d="M0 250 Q220 200 460 236 T900 224 T1200 236 V360 H0 Z" fill="#3f4d2c"/>' +
  '<path d="M0 286 Q260 240 520 270 T1000 262 T1200 272 V360 H0 Z" fill="#2f3b21"/>' +
  '<path d="M0 320 H1200 V360 H0 Z" fill="#3a2c19"/>' +
  '<g stroke="' + COMMUNITY_O + '" stroke-width="2" stroke-linejoin="round">' +
  '<path d="M150 296 l-16 30 h32 Z M150 308 l-19 32 h38 Z" fill="#2f4522"/><rect x="145" y="336" width="10" height="12" fill="#5b4327"/>' +
  '<path d="M1132 300 l-13 26 h26 Z M1132 310 l-16 28 h32 Z" fill="#3e5c2f"/><rect x="1128" y="334" width="9" height="12" fill="#5b4327"/>' +
  '</g>' +
  '<g stroke="' + COMMUNITY_O + '" stroke-linejoin="round">' +
  '<path d="M790 190 828 240 M846 190 810 240" stroke="#8a6a45" stroke-width="4" stroke-linecap="round"/>' +
  '<path d="M818 202 872 320 H764 Z" fill="#e8cf9e" stroke-width="3"/>' +
  '<path d="M782 268 l12 -8 12 8 12 -8 12 8 12 -8 12 8" stroke="#b3452f" stroke-width="4" fill="none" stroke-linecap="round"/>' +
  '<path d="M818 262 846 320 H790 Z" fill="#6f5233" stroke-width="2.5"/>' +
  '</g>' +
  '<g>' +
  '<path d="M930 322 q6 -30 20 -40 q-3 20 6 26 q6 -6 5 -20 q13 13 10 34 Z" fill="#e8873a" stroke="#c2762e" stroke-width="2"/>' +
  '<path d="M940 322 q5 -17 13 -23 q0 13 5 16 q5 -9 3 -16 q7 10 5 23 Z" fill="#f4c85c"/>' +
  '<path d="M912 326 l52 0 M916 331 l44 0" stroke="#5b4327" stroke-width="5" stroke-linecap="round"/>' +
  '</g>' +
  '<g stroke="' + COMMUNITY_O + '" stroke-width="2" stroke-linejoin="round">' +
  '<circle cx="1012" cy="288" r="14" fill="#ecb98c"/><path d="M1000 276 h24" stroke="#4a6b35" stroke-width="4"/><path d="M1004 262 q8 -10 16 0" stroke="#b3452f" stroke-width="3.5" fill="none"/><path d="M994 320 q0 -24 18 -24 t18 24 Z" fill="#4a6b35"/>' +
  '<circle cx="1066" cy="296" r="13" fill="#ecb98c"/><path d="M1055 285 h22" stroke="#b3452f" stroke-width="3.5"/><path d="M1049 320 q0 -22 17 -22 t17 22 Z" fill="#a8503a"/>' +
  '</g>';

/** Full-bleed nighttime camp illustration used behind the community band. */
export function CommunityScene({ style }) {
  return (
    <div
      style={style}
      dangerouslySetInnerHTML={{
        __html:
          '<svg viewBox="0 0 1200 360" style="width:100%;height:100%;display:block" preserveAspectRatio="xMidYMax slice">' +
          COMMUNITY_SCENE +
          '</svg>',
      }}
    />
  );
}
