/**
 * client-config.js — the ONLY file you ever touch to launch a new client site.
 * Everything (name, logo, colors, booking link, services, gallery) is read from
 * /public/client-config.json at runtime. This module fetches it and exposes
 * helpers for theming + copy.
 */
let CFG = null;

export async function loadConfig() {
  if (CFG) return CFG;
  const res = await fetch('/client-config.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`client-config.json fetch failed: ${res.status}`);
  CFG = await res.json();
  return CFG;
}

export const cfg = () => CFG;

/** hex -> {r,g,b} for CSS var injection */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Inject brand colors as CSS custom properties so Tailwind-agnostic CSS can use them */
export function applyTheme(config) {
  const primary = hexToRgb(config.client.primaryColor);
  const accent = hexToRgb(config.client.accentColor || config.client.primaryColor);
  const root = document.documentElement;
  root.style.setProperty('--brand', config.client.primaryColor);
  root.style.setProperty('--brand-rgb', `${primary.r} ${primary.g} ${primary.b}`);
  root.style.setProperty('--accent', config.client.accentColor || config.client.primaryColor);
  root.style.setProperty('--accent-rgb', `${accent.r} ${accent.g} ${accent.b}`);
  document.title = `${config.client.name} — ${config.client.tagline}`;
}
