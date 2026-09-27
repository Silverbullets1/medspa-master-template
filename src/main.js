import './style.css';
import { loadConfig, applyTheme } from './config.js';
import { render } from './render.js';
import { initTilt, initReveals, initSmoothScroll, initNavScroll, initMagnetic } from './interactions.js';
import { initLeadForm } from './leadForm.js';

async function boot() {
  const config = await loadConfig();
  applyTheme(config);
  render();
  // wire interactions AFTER DOM render
  document.getElementById('nav-burger')?.addEventListener('click', () => {
    document.getElementById('mobile-nav')?.classList.toggle('hidden');
  });
  window.__leadDest = config.leadCapture?.destinationEmail || '';
  initNavScroll();
  initTilt();
  initSmoothScroll();
  initMagnetic();
  initLeadForm();
  initReveals();
}

boot().catch((err) => {
  console.error('boot failed:', err);
  document.getElementById('app').innerHTML =
    '<div class="min-h-screen flex items-center justify-center text-white/60">Config load failed — check client-config.json</div>';
});
