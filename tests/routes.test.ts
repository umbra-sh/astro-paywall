import assert from 'node:assert/strict';
import test from 'node:test';

import { GET as localHealthGET } from '../src/pages/local_health';
import { GET as paywallGET } from '../src/pages/paywall';

test('/local_health returns 200 and ok body', async () => {
  const response = localHealthGET();
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'ok');
});

test('/paywall renders default variant', async () => {
  const response = paywallGET({
    request: new Request('https://example.com/paywall?dismissable=true&context=workspace'),
  });

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /closePaywall/);
  assert.match(html, /target="_parent"/);
  assert.match(html, /See Pro plans/);
});

test('/paywall renders sitewide variant', async () => {
  const response = paywallGET({
    request: new Request('https://example.com/paywall?variant=sitewide&dismissable=true'),
  });

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Limited Time Offer/);
  assert.match(html, /countdown.js/);
});

test('/paywall renders free-week variant', async () => {
  const response = paywallGET({
    request: new Request('https://example.com/paywall?variant=free-week&dismissable=true&context=courses'),
  });

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Free Access/);
  assert.match(html, /Try everything free for 7 days/);
});

test('/paywall renders free-group variant', async () => {
  const response = paywallGET({
    request: new Request('https://example.com/paywall?variant=free-group&dismissable=true'),
  });

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Team Access/);
  assert.match(html, /5 members included/);
});

test('/paywall renders survey variant', async () => {
  const response = paywallGET({
    request: new Request('https://example.com/paywall?variant=survey&dismissable=true'),
  });

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Help us improve/);
  assert.match(html, /radio-item/);
});

test('/paywall returns error for invalid variant', async () => {
  const response = paywallGET({
    request: new Request('https://example.com/paywall?variant=invalid'),
  });

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Invalid Variant/);
});
