/**
 * Gate-1 live-mode Netlify-path tests (node, zero deps):
 *   node tests/gate1_netlify.test.mjs
 * Covers: multipart encoding (form-name + all fields), submitLead
 * netlifyFormName branch against a local urlencoded-style receiver,
 * and demoMode fallback when neither path is configured.
 */
import http from 'node:http';
import assert from 'node:assert/strict';
import { _toMultipart, submitLead } from '../src/leadForm.js';

let received = null;

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    received = { url: req.url, body: Buffer.concat(chunks).toString('utf8') };
    res.writeHead(200);
    res.end('{}');
  });
});
await new Promise((r) => server.listen(8898, r));

try {
  // 1. multipart encoding — form-name first, every payload field present
  const payload = {
    name: 'Asha V', email: 'asha@x.com', phone: '+1 555 000 1111',
    service: 'HydraFacial', message: 'Booking for Friday',
    destinationEmail: 'leads@glowmedspa.com',
    source: 'medspa-master-template', submittedAt: new Date().toISOString(),
  };
  const fd = _toMultipart(payload, 'lead-capture');
  assert.equal(fd.get('form-name'), 'lead-capture');
  for (const [k, v] of Object.entries(payload)) assert.equal(fd.get(k), v);
  console.log('PASS multipart-encode');

  // 2. submitLead({netlifyFormName}) -> POST to netlifyFormEndpoint with
  //    multipart body (production omits the endpoint -> same-origin "/")
  const result = await submitLead(
    { netlifyFormName: 'lead-capture', netlifyFormEndpoint: 'http://127.0.0.1:8898/' },
    payload,
  );
  assert.ok(result.ok && !result.demo);
  assert.equal(received.url, '/');
  assert.ok(received.body.includes('form-data; name="form-name"'));
  assert.ok(received.body.includes('asha@x.com'));
  console.log('PASS netlify-form-branch');

  // 3. demoMode still works when no live path configured
  const demo = await submitLead({ demoMode: true }, payload);
  assert.ok(demo.ok && demo.demo);
  console.log('PASS demoMode-fallback');

  console.log('GATE-1 NETLIFY-PATH TESTS: 3/3 PASS');
} finally {
  server.close();
}
