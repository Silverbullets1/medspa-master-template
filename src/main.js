import './style.css';
import { loadConfig, applyTheme } from './config.js';
import { render } from './render.js';
import { initTilt, initReveals, initSmoothScroll, initNavScroll, initMagnetic } from './interactions.js';

async function boot() {
  const config = await loadConfig();
  applyTheme(config);
  render();
  // wire interactions AFTER DOM render
  document.getElementById('nav-burger')?.addEventListener('click', () => {
    document.getElementById('mobile-nav')?.classList.toggle('hidden');
  });
  initNavScroll();
  initTilt();
  initSmoothScroll();
  initMagnetic();
  initReveals();
}

boot().catch((err) => {
  console.error('boot failed:', err);
  document.getElementById('app').innerHTML =
    '<div class="min-h-screen flex items-center justify-center text-white/60">Config load failed — check client-config.json</div>';
});
