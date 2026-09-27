/**
 * Gate-1 unit + integration tests (node, zero deps):
 *   node tests/gate1.test.mjs
 * Covers: payload build, demoMode path, missing-config error, real webhook
 * POST against a local receiver, and 500-failure handling.
 */
import http from 'node:http';
import assert from 'node:assert/strict';
import { buildPayload, submitLead } from '../src/leadForm.js';

let received = null;

function makeFormData() {
  const fd = new FormData();
  fd.set('name', 'Test Lead');
  fd.set('email', 'lead@test.com');
  fd.set('phone', '+1 (555) 111-2222');
  fd.set('service', 'Laser Resurfacing');
  fd.set('message', 'I want glowing skin before my wedding');
  fd.set('company', ''); // honeypot empty (human)
  return fd;
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    received = JSON.parse(body);
    if (req.url === '/gate1-fail') {
      res.writeHead(500);
      res.end('{"error":"simulated"}');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
  });
});
await new Promise((r) => server.listen(8897, r));

try {
  // 1. payload build
  const p = buildPayload(makeFormData(), 'leads@lumieremedspa.com');
  assert.equal(p.name, 'Test Lead');
  assert.equal(p.email, 'lead@test.com');
  assert.equal(p.service, 'Laser Resurfacing');
  assert.equal(p.destinationEmail, 'leads@lumieremedspa.com');
  assert.equal(p.source, 'medspa-master-template');
  assert.ok(!Number.isNaN(Date.parse(p.submittedAt)));
  console.log('PASS payload-build');

  // 2. demoMode -> simulated success, no network
  const demo = await submitLead({ demoMode: true }, p);
  assert.ok(demo.ok && demo.demo);
  console.log('PASS demoMode');

  // 3. no config + no demo -> clear error
  await assert.rejects(() => submitLead({}, p), /no gate1WebhookUrl configured/);
  console.log('PASS missing-config-error');

  // 4. real webhook POST -> 200, payload integrity end-to-end
  const real = await submitLead({ gate1WebhookUrl: 'http://127.0.0.1:8897/gate1' }, p);
  assert.ok(real.ok && !real.demo);
  assert.equal(received.name, 'Test Lead');
  assert.equal(received.destinationEmail, 'leads@lumieremedspa.com');
  assert.equal(received.source, 'medspa-master-template');
  console.log('PASS webhook-200 + payload-integrity');

  // 5. webhook 500 -> throws with status
  await assert.rejects(
    () => submitLead({ gate1WebhookUrl: 'http://127.0.0.1:8897/gate1-fail' }, p),
    /responded 500/,
  );
  console.log('PASS webhook-500-handling');

  console.log('GATE-1 TESTS: 5/5 PASS');
} finally {
  server.close();
}
