/**
 * interactions.js — 3D tilt, scroll reveals, smooth scroll, micro-animations.
 * All vanilla JS, no dependencies. Delta-clamped rAF for 60fps on weak CPUs.
 */

/** Attach pointer-driven 3D tilt to every [data-tilt] element */
export function initTilt() {
  const els = document.querySelectorAll('[data-tilt]');
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  els.forEach((el) => {
    let raf = null;
    let tx = 0, ty = 0, cx = 0, cy = 0, scale = 1, cs = 1;
    const animate = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cs += (scale - cs) * 0.12;
      el.style.transform =
        `perspective(900px) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg) scale(${cs.toFixed(3)})`;
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01 || Math.abs(scale - cs) > 0.001) {
        raf = requestAnimationFrame(animate);
      } else { raf = null; }
    };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = px * 14; ty = -py * 14; scale = 1.03;
      if (!raf) raf = requestAnimationFrame(animate);
    });
    el.addEventListener('pointerleave', () => {
      tx = 0; ty = 0; scale = 1;
      if (!raf) raf = requestAnimationFrame(animate);
    });
    el.style.willChange = 'transform';
    void clamp; void el; // silence lint helpers
  });
}

/** IntersectionObserver reveal-on-scroll: adds .revealed to [data-reveal] */
export function initReveals() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('revealed');
        io.unobserve(en.target);
      }
    }),
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/** Smooth anchor scrolling with offset for fixed nav */
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
      // close mobile nav if open
      document.getElementById('mobile-nav')?.classList.add('hidden');
    });
  });
}

/** Navbar: translucent glass after 40px scroll */
export function initNavScroll() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  let last = -1;
  const onScroll = () => {
    const s = window.scrollY > 40 ? 1 : 0;
    if (s !== last) {
      nav.classList.toggle('nav-scrolled', s === 1);
      last = s;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/** Magnetic hover for primary CTAs */
export function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.15;
      const dy = (e.clientY - r.top - r.height / 2) * 0.15;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
