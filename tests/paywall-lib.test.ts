import assert from 'node:assert/strict';
import test from 'node:test';

import {
  detectCurrencyCode,
  getContext,
  money,
  normalizeLocale,
  sanitizeColor,
  sanitizeImageUrl,
  sanitizePosition,
  sanitizeSize,
} from '../src/lib/paywall';

test('normalizeLocale maps short and mixed locale values', () => {
  assert.equal(normalizeLocale('pt'), 'pt-BR');
  assert.equal(normalizeLocale('es-es'), 'es-ES');
  assert.equal(normalizeLocale('de-DE,de;q=0.9'), 'de-DE');
  assert.equal(normalizeLocale('invalid-locale-value'), 'en-US');
});

test('getContext defaults to courses for unknown context', () => {
  const unknown = new URL('https://example.com/templates/paywall?context=unknown');
  const known = new URL('https://example.com/templates/paywall?context=workspace');
  assert.equal(getContext(unknown), 'courses');
  assert.equal(getContext(known), 'workspace');
});

test('money supports locale-aware currency formatting', () => {
  assert.equal(money(12.5, { locale: 'en-US', currency: 'USD' }), '$12.50');
  assert.match(money(12.5, { locale: 'de-DE', currency: 'EUR' }), /12,50/);
  assert.equal(money('bad', { symbol: '$' }), '$0.00');
});

test('detectCurrencyCode finds valid code in payload-like records', () => {
  const code = detectCurrencyCode(
    { annual_in_currency: 100 },
    { currency_code: 'eur' },
  );
  assert.equal(code, 'EUR');
});

test('style sanitizers reject unsafe values', () => {
  assert.equal(sanitizeImageUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeImageUrl('https://cdn.example.com/image.png'), 'https://cdn.example.com/image.png');
  assert.equal(sanitizeColor('rgb(20, 20, 20)', '#000000'), 'rgb(20, 20, 20)');
  assert.equal(sanitizeColor('url(javascript:1)', '#000000'), '#000000');
  assert.equal(sanitizePosition('left', 'top'), 'left top');
  assert.equal(sanitizePosition('evil', 'top', 'center center'), 'center center');
  assert.equal(sanitizeSize('contain'), 'contain');
  assert.equal(sanitizeSize('expression(alert(1))', 'cover'), 'cover');
});
