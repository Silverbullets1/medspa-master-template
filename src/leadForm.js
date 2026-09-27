/**
 * leadForm.js — Gate-1 lead capture: glass form logic, webhook POST, toasts.
 * buildPayload() and submitLead() are DOM-free + dependency-free so they can be
 * unit-tested directly in Node.
 *
 * Live-mode delivery paths (first one wins):
 *   1. gate1WebhookUrl  -> JSON POST (client-owned webhook / Zapier / worker)
 *   2. netlifyFormName  -> urlencoded multipart POST to "/" (Netlify form
 *      detection pipeline; retrievable via /api/v1/forms/:form_id/submissions)
 */

/** Build the Gate-1 payload from a form element (or FormData). Pure. */
export function buildPayload(form, destinationEmail = '') {
  const data = form instanceof FormData ? form : new FormData(form);
  return {
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    service: String(data.get('service') || '').trim(),
    message: String(data.get('message') || '').trim(),
    destinationEmail,
    source: 'medspa-master-template',
    submittedAt: new Date().toISOString(),
    _honeypot: String(data.get('company') || ''),
  };
}

/** Encode a payload as Netlify-compatible multipart/form-data. Pure. */
export function _toMultipart(payload, formName) {
  const fd = new FormData();
  fd.set('form-name', formName);
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined && v !== null) fd.set(k, String(v));
  }
  return fd;
}

/**
 * POST the lead through the configured live-mode path.
 * - gate1WebhookUrl set  -> real POST (JSON), expects 2xx
 * - netlifyFormName set  -> multipart POST to same-origin "/",
 *                           Content-Type left to the fetch body (FormData)
 * - no URL + demoMode    -> simulated success, payload logged in console
 * - no URL + no demo     -> throws
 */
export async function submitLead(leadCapture, payload) {
  const url = leadCapture && leadCapture.gate1WebhookUrl;
  if (url) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`GATE-1 webhook responded ${res.status}`);
    return { ok: true, demo: false };
  }

  const formName = leadCapture && leadCapture.netlifyFormName;
  if (formName) {
    // NOTE: trailing-slash + no custom Content-Type are required by Netlify
    // form detection for static form POSTs. netlifyFormEndpoint overrides the
    // target (same-origin "/" by default; absolute URL in tests/Node).
    const endpoint = (leadCapture && leadCapture.netlifyFormEndpoint) || '/';
    const res = await fetch(endpoint, { method: 'POST', body: _toMultipart(payload, formName) });
    if (!res.ok) throw new Error(`GATE-1 netlify form responded ${res.status}`);
    return { ok: true, demo: false };
  }

  if (leadCapture && leadCapture.demoMode) {
    console.warn('[GATE-1] demoMode active — payload NOT sent. Set leadCapture.gate1WebhookUrl (or netlifyFormName) to go live.', payload);
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, demo: true };
  }
  throw new Error('GATE-1: no gate1WebhookUrl configured and demoMode is off');
}

/** Toast notification (glassmorphism, bottom-right, auto-dismiss). */
export function showToast(type, title, messageHTML, ttl = 4600) {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    host.className = 'fixed bottom-6 right-6 z-[100] flex flex-col gap-3';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  const icon = type === 'success'
    ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--brand-rgb))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>'
    : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';
  el.className = 'toast glass-strong rounded-2xl px-5 py-4 flex items-start gap-3 max-w-sm shadow-2xl';
  el.innerHTML = `${icon}<div><p class="font-semibold text-sm">${title}</p><p class="text-white/60 text-sm mt-0.5">${messageHTML}</p></div>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-in'));
  setTimeout(() => {
    el.classList.remove('toast-in');
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 380);
  }, ttl);
}

/** Wire the rendered #lead-form: validation, honeypot, loading state, toasts. */
export function initLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;
  const btn = document.getElementById('lead-submit');
  const btnText = document.getElementById('lead-submit-text');
  const spinner = document.getElementById('lead-spinner');
  const mail = (window.__leadDest) || '';

  const setLoading = (on) => {
    btn.disabled = on;
    btn.classList.toggle('opacity-70', on);
    btn.classList.toggle('cursor-wait', on);
    btnText.textContent = on ? 'Sending...' : 'Request Consultation';
    spinner.classList.toggle('hidden', !on);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const destEmail = form.dataset.destinationEmail || '';
    const payload = buildPayload(form, destEmail);
    if (payload._honeypot) {
      // bot filled the hidden field — silently accept & drop
      form.reset();
      return;
    }
    delete payload._honeypot;
    setLoading(true);
    try {
      const result = await submitLead(JSON.parse(form.dataset.leadCapture), payload);
      showToast('success', 'Consultation Requested!', 'Our care team will reach out within one business day.');
      if (result.demo) console.info('[GATE-1] demo success toast shown (demoMode=true)');
      form.reset();
    } catch (err) {
      console.error('[GATE-1] lead submit failed:', err);
      const mailLink = mail
        ? ` Or <a class="brand-text underline" href="mailto:${mail}">email us directly</a>.`
        : '';
      showToast('error', 'Something went wrong', `Please try again in a moment.${mailLink}`, 6000);
    } finally {
      setLoading(false);
    }
  });
}
