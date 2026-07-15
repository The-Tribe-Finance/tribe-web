// Must be imported before any Solana/Anchor code. ESM hoists imports, so the
// Buffer global has to be installed in its own module that is imported first —
// setting it inline in main.jsx runs too late, after App's imports execute.
import { Buffer } from 'buffer';

globalThis.Buffer = globalThis.Buffer ?? Buffer;
globalThis.global = globalThis.global ?? globalThis;
