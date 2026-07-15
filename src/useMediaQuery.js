import { useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query and re-render when it flips.
 *
 * The UI is built with inline styles, which a CSS stylesheet cannot override at
 * a breakpoint (inline wins specificity). So layout that must change on small
 * screens reads these booleans and picks a different style object instead.
 */
function makeStore(query) {
  const mql = window.matchMedia(query);
  return {
    subscribe(cb) {
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    get: () => mql.matches,
  };
}

const stores = new Map();

export function useMediaQuery(query) {
  let store = stores.get(query);
  if (!store) {
    store = makeStore(query);
    stores.set(query, store);
  }
  // Server has no matchMedia; default to desktop (false) during any SSR/prerender.
  return useSyncExternalStore(store.subscribe, store.get, () => false);
}

/** Breakpoints shared across the app. */
export const useIsMobile = () => useMediaQuery('(max-width: 640px)');
export const useIsTablet = () => useMediaQuery('(max-width: 960px)');
