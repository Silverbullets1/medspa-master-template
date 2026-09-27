/**
 * render.js — builds the entire DOM from client-config.json.
 * Never edited per client; all content comes from the JSON.
 */
import { cfg } from './config.js';

const svg = {
  injectable: '<path d="M18 2l4 4M11 9l4 4M6 22l3-3M4.5 13.5L9 18m-6.5-3L9 8.5 15.5 15 8 22.5 2.5 17z"/>',
  laser: '<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4l2.2 2.2m0-12.8l-2.2 2.2M7.8 16.2l-2.2 2.2"/><circle cx="12" cy="12" r="3"/>',
  skin: '<path d="M12 21c-4.97 0-9-3.58-9-8 0-3.5 2-6.5 5-8.5M12 21c4.97 0 9-3.58 9-8 0-3.5-2-6.5-5-8.5M9 10h.01M15 10h.01M9.5 14.5c1.5 1.5 3.5 1.5 5 0"/>',
  body: '<path d="M4 8c4-4 12-4 16 0M4 16c4 4 12 4 16 0M8 4c-2 5-2 11 0 16M16 4c2 5 2 11 0 16"/>',
  wellness: '<path d="M12 21C7 16.5 3 13 3 8.8 3 6 5.2 4 7.8 4c1.7 0 3.2.8 4.2 2.2C13 4.8 14.5 4 16.2 4 18.8 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z"/>',
  hair: '<path d="M12 2c2 3 5 5 5 9a5 5 0 01-10 0c0-4 3-6 5-9zM12 21v-5"/>',
};

function nav() {
  const c = cfg();
  return `
  <nav data-nav class="fixed top-0 inset-x-0 z-40 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="#home" class="flex items-center gap-3">
        <img src="${c.client.logoUrl}" alt="${c.client.name} logo" class="h-9 w-auto rounded" />
      </a>
      <div class="hidden md:flex items-center gap-8 text-sm tracking-wide text-white/70">
        <a href="#services" class="nav-link hover:text-white transition">Treatments</a>
        <a href="#gallery" class="nav-link hover:text-white transition">Gallery</a>
        <a href="#testimonials" class="nav-link hover:text-white transition">Stories</a>
        <a href="#contact" class="nav-link hover:text-white transition">Visit</a>
        <a href="${c.client.bookingLink}" target="_blank" rel="noopener"
           data-magnetic class="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white">
          Book Now
        </a>
      </div>
      <button id="nav-burger" class="md:hidden glass rounded-lg p-2" aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
    <div id="mobile-nav" class="hidden md:hidden glass-strong mx-4 rounded-2xl p-4 space-y-2 text-sm">
      <a href="#services" class="block px-3 py-2 rounded-lg hover:bg-white/10">Treatments</a>
      <a href="#gallery" class="block px-3 py-2 rounded-lg hover:bg-white/10">Gallery</a>
      <a href="#testimonials" class="block px-3 py-2 rounded-lg hover:bg-white/10">Stories</a>
      <a href="#contact" class="block px-3 py-2 rounded-lg hover:bg-white/10">Visit</a>
      <a href="${c.client.bookingLink}" target="_blank" rel="noopener" class="btn-primary block text-center rounded-lg px-3 py-2 font-semibold">Book Now</a>
    </div>
  </nav>`;
}

function hero() {
  const c = cfg();
  return `
  <section id="home" class="relative min-h-screen flex items-end overflow-hidden">
    <img src="${c.hero.imageUrl}" alt="" class="absolute inset-0 h-full w-full object-cover kenburns" />
    <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/55 to-transparent"></div>
    <div class="relative z-10 max-w-7xl mx-auto px-6 pb-28 pt-48 w-full">
      <div data-reveal class="max-w-2xl">
        <p class="accent-text text-xs tracking-[0.35em] uppercase mb-5">Physician-led aesthetics</p>
        <h1 class="font-display text-5xl md:text-7xl leading-[1.05] font-light">${c.hero.headline}</h1>
        <p class="mt-6 text-white/70 text-lg max-w-xl">${c.hero.subheadline}</p>
        <div class="mt-9 flex flex-wrap gap-4">
          <a href="${c.client.bookingLink}" target="_blank" rel="noopener"
             data-magnetic class="btn-primary rounded-full px-8 py-4 font-semibold">${c.hero.ctaPrimary}</a>
          <a href="#services" data-magnetic
             class="glass rounded-full px-8 py-4 font-medium hover:bg-white/10 transition">${c.hero.ctaSecondary}</a>
        </div>
      </div>
    </div>
  </section>`;
}

function services() {
  const c = cfg();
  const cards = c.services.map((s, i) => `
    <article data-reveal data-tilt style="--reveal-delay:${(i % 3) * 90}ms"
      class="glass rounded-3xl p-8 flex flex-col gap-4 group hover:border-white/25 transition-colors duration-300">
      <div class="h-11 w-11 rounded-xl flex items-center justify-center" style="background:rgb(var(--brand-rgb)/0.15)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--brand-rgb))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${svg[s.icon] || svg.skin}</svg>
      </div>
      <h3 class="font-display text-2xl">${s.title}</h3>
      <p class="text-white/60 text-sm leading-relaxed flex-1">${s.description}</p>
      <div class="flex items-center justify-between pt-2 border-t border-white/10">
        <span class="accent-text text-sm font-medium">${s.price}</span>
        <a href="${c.client.bookingLink}" target="_blank" rel="noopener" class="text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition">Book →</a>
      </div>
    </article>`).join('');
  return `
  <section id="services" class="relative py-28 max-w-7xl mx-auto px-6">
    <p data-reveal class="accent-text text-xs tracking-[0.35em] uppercase mb-4">Our treatments</p>
    <h2 data-reveal class="font-display text-4xl md:text-5xl mb-14">Signature Care</h2>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${cards}</div>
  </section>`;
}

function gallery() {
  const c = cfg();
  const imgs = c.gallery.map((g, i) => `
    <figure data-reveal data-tilt style="--reveal-delay:${(i % 3) * 80}ms" class="glass rounded-3xl overflow-hidden">
      <img src="${g.src}" alt="${g.alt}" loading="lazy" class="h-64 w-full object-cover group-hover:scale-105 transition duration-700" />
Head      </figure>`).join('');
  return `
  <section id="gallery" class="relative py-28 max-w-7xl mx-auto px-6">
    <p data-reveal class="accent-text text-xs tracking-[0.35em] uppercase mb-4">The space</p>
    <h2 data-reveal class="font-display text-4xl md:text-5xl mb-14">Step Inside</h2>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${imgs}</div>
  </section>`;
}

function testimonials() {
  const c = cfg();
  const cards = c.testimonials.map((t, i) => `
    <blockquote data-reveal style="--reveal-delay:${i * 110}ms"
      class="glass-strong rounded-3xl p-8 flex flex-col gap-5">
      <div class="accent-text text-3xl font-display leading-none">"</div>
      <p class="text-white/80 leading-relaxed flex-1">${t.quote}</p>
      <footer class="text-sm">
        <span class="font-semibold">${t.author}</span>
        <span class="text-white/40"> · ${t.service}</span>
      </footer>
    </blockquote>`).join('');
  return `
  <section id="testimonials" class="relative py-28 max-w-7xl mx-auto px-6">
    <p data-reveal class="accent-text text-xs tracking-[0.35em] uppercase mb-4">Client stories</p>
    <h2 data-reveal class="font-display text-4xl md:text-5xl mb-14">Real Results</h2>
    <div class="grid gap-6 md:grid-cols-3">${cards}</div>
  </section>`;
}

function contact() {
  const c = cfg();
  const hours = c.hours.map((h) => `
    <div class="flex justify-between text-sm py-2 border-b border-white/10 last:border-0">
      <span class="text-white/60">${h.days}</span><span>${h.time}</span>
    </div>`).join('');
  const socials = Object.entries(c.client.socials || {}).map(([k, url]) =>
    `<a href="${url}" target="_blank" rel="noopener" class="nav-link text-white/60 hover:text-white text-sm capitalize">${k}</a>`).join('');
  return `
  <section id="contact" class="relative py-28 max-w-7xl mx-auto px-6">
    <div class="grid gap-10 lg:grid-cols-2">
      <div data-reveal>
        <p class="accent-text text-xs tracking-[0.35em] uppercase mb-4">Visit us</p>
        <h2 class="font-display text-4xl md:text-5xl mb-8">Book Your Visit</h2>
        <p class="text-white/70 leading-relaxed">${c.client.address}</p>
        <p class="mt-4"><a href="tel:${c.client.phone.replace(/[^+\d]/g, '')}" class="brand-text hover:underline">${c.client.phone}</a></p>
        <p class="mt-1"><a href="mailto:${c.client.email}" class="text-white/60 hover:text-white">${c.client.email}</a></p>
        <div class="mt-6 flex gap-6">${socials}</div>
        <a href="${c.client.bookingLink}" target="_blank" rel="noopener" data-magnetic
           class="btn-primary inline-block mt-9 rounded-full px-8 py-4 font-semibold">${c.hero.ctaPrimary}</a>
      </div>
      <div data-reveal class="glass rounded-3xl p-8">
        <h3 class="font-display text-2xl mb-5">Hours</h3>
        ${hours}
      </div>
    </div>
  </section>`;
}

function leadFormSection() {
  const c = cfg();
  const lc = c.leadCapture || {};
  if (lc.enabled === false) return '';
  const options = (c.services || [])
    .map((s) => `<option value="${s.title}">${s.title}</option>`).join('');
  return `
  <section id="consult" class="relative py-28 max-w-7xl mx-auto px-6">
    <div class="grid gap-10 lg:grid-cols-2 items-start">
      <div data-reveal>
        <p class="accent-text text-xs tracking-[0.35em] uppercase mb-4">Start here</p>
        <h2 class="font-display text-4xl md:text-5xl mb-6">${lc.heading || 'Request a Consultation'}</h2>
        <p class="text-white/70 leading-relaxed max-w-md">${lc.subtext || 'Tell us your goals and our care team will respond promptly.'}</p>
        <ul class="mt-8 space-y-3 text-sm text-white/60">
          <li class="flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full accent-bg"></span>No-pressure consultation</li>
          <li class="flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full accent-bg"></span>Personalized treatment plan</li>
          <li class="flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full accent-bg"></span>Response within one business day</li>
        </ul>
      </div>
      <form id="lead-form" data-reveal novalidate
        data-destination-email="${lc.destinationEmail || ''}"
        data-lead-capture='${JSON.stringify(lc).replace(/'/g, '&#39;')}'
        class="glass-strong rounded-3xl p-8 space-y-5">
        <input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true"
               class="hidden" style="position:absolute;left:-9999px;height:0;width:0;" />
        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="text-xs uppercase tracking-widest text-white/50">Name *</span>
            <input required name="name" type="text" placeholder="Jane Doe"
              class="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder-white/30 outline-none focus:border-[rgb(var(--brand-rgb))] transition" />
          </label>
          <label class="block">
            <span class="text-xs uppercase tracking-widest text-white/50">Email *</span>
            <input required name="email" type="email" placeholder="jane@email.com"
              class="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder-white/30 outline-none focus:border-[rgb(var(--brand-rgb))] transition" />
          </label>
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="text-xs uppercase tracking-widest text-white/50">Phone</span>
            <input name="phone" type="tel" placeholder="+1 (555) 000-0000"
              class="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder-white/30 outline-none focus:border-[rgb(var(--brand-rgb))] transition" />
          </label>
          <label class="block">
            <span class="text-xs uppercase tracking-widest text-white/50">Preferred Service</span>
            <select name="service"
              class="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[rgb(var(--brand-rgb))] transition [&>option]:bg-[#12121a]">
              <option value="">General inquiry</option>
              ${options}
            </select>
          </label>
        </div>
        <label class="block">
          <span class="text-xs uppercase tracking-widest text-white/50">Message</span>
          <textarea name="message" rows="4" placeholder="Tell us about your goals…"
            class="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder-white/30 outline-none focus:border-[rgb(var(--brand-rgb))] transition resize-none"></textarea>
        </label>
        <button id="lead-submit" type="submit"
          class="btn-primary w-full rounded-xl px-6 py-4 font-semibold flex items-center justify-center gap-3">
          <svg id="lead-spinner" class="hidden animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 3a9 9 0 109 9"/></svg>
          <span id="lead-submit-text">Request Consultation</span>
        </button>
        <p class="text-center text-xs text-white/35">Your details stay private — used only to plan your visit.</p>
      </form>
    </div>
  </section>`;
}

function footer() {
  const c = cfg();
  return `
  <footer class="border-t border-white/10 py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
      <span>© ${new Date().getFullYear()} ${c.client.name}. All rights reserved.</span>
      <span class="italic">"${c.client.tagline}"</span>
    </div>
  </footer>`;
}

export function render() {
  document.getElementById('app').innerHTML = `
    ${nav()}
    <main>${hero()}${services()}${gallery()}${testimonials()}${leadFormSection()}${contact()}</main>
    ${footer()}`;
  document.getElementById('loader')?.remove();
}
