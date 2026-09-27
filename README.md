# Med-Spa Master Template

Config-driven, $10k-tier website template for med-spas & salons. Launch a new
client by editing **one JSON file** — no HTML/JS changes, ever.

## Stack
- Vite 5 + TailwindCSS 3 (purged, fast, no runtime CSS)
- Vanilla JS only — zero framework weight
- Glassmorphism UI, 3D pointer-tilt cards, scroll reveals, ken-burns hero, magnetic CTAs
- `prefers-reduced-motion` respected

## Launch a client in 3 minutes
1. Edit `public/client-config.json`:
   - `client.name`, `client.logoUrl`, `client.primaryColor`, `client.accentColor`
   - `client.bookingLink` (Calendly / Square / Vagaro — any URL)
   - `services[]`, `testimonials[]`, `gallery[]`, `hours[]`
2. `npm run build` → deploy `dist/` (Netlify config included)
3. Done. Colors/branding flow through CSS variables automatically.

## Dev
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
```

## Deploy (Netlify)
Repo includes `netlify.toml` — connect repo, deploy. `client-config.json` is
served with `Cache-Control: no-store` so client edits show instantly.

## File map
```
public/client-config.json   ← THE client file (only file you touch)
src/config.js               ← fetch + theme injection (CSS vars)
src/render.js               ← full DOM render from config
src/interactions.js         ← tilt / reveal / smooth-scroll / magnetic
src/style.css               ← glass primitives + brand var hooks
```
