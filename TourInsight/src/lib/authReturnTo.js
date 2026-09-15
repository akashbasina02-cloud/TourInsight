export function safeReturnTo() {
  try {
    const raw = new URLSearchParams(window.location.search).get('returnTo');
    if (!raw) return '/';
    if (raw.startsWith('//') || raw.includes('\\')) return '/';
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return '/';
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return '/';
  }
}
