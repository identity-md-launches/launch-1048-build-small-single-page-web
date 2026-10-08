import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAmount, quote, format } from '../src/model.ts';

test('a 1 ETH swap into a 100 ETH / 100,000 TOKEN pool has the expected quote', () => {
  const q = quote(1, 100, 0.5);
  assert.ok(Math.abs(q.output - 987.1580343970613) < 1e-9);
  assert.ok(Math.abs(q.minimum - 982.222244225076) < 1e-9);
  assert.ok(Math.abs(q.impact - 0.9871580343970613) < 1e-10);
  assert.equal(q.fee, 0.003);
});

test('pool conservation, output bounds, and fee accounting hold at supported extremes', () => {
  for (const reserve of [10, 100, 1000]) {
    for (const amount of [0.001, 0.1, 1, 50, 1000]) {
      const q = quote(amount, reserve, 3);
      assert.ok(q.output > 0 && q.output < reserve * 1000);
      assert.ok(q.minimum > 0 && q.minimum < q.output);
      assert.ok(q.impact > 0 && q.impact < 100);
      const kBefore = reserve * reserve * 1000;
      const kAfter = (reserve + amount - q.fee) * (reserve * 1000 - q.output);
      assert.ok(Math.abs(kAfter / kBefore - 1) < 1e-12);
    }
  }
});

test('deeper liquidity improves the same trade and larger trades increase impact', () => {
  assert.ok(quote(10, 1000, 0.5).output > quote(10, 100, 0.5).output);
  assert.ok(quote(10, 1000, 0.5).impact < quote(10, 100, 0.5).impact);
  assert.ok(quote(50, 100, 0.5).impact > quote(1, 100, 0.5).impact);
});

test('tolerance changes only the minimum, never the quote or price impact', () => {
  const tight = quote(1, 100, 0.1);
  const loose = quote(1, 100, 3);
  assert.equal(tight.output, loose.output);
  assert.equal(tight.impact, loose.impact);
  assert.ok(loose.minimum < tight.minimum);
});

test('amount validation accepts decimals and rejects missing, ambiguous, and out-of-range values', () => {
  for (const input of ['.5', ' 1 ', '0.001', '1000', '1.']) assert.equal(parseAmount(input).error, null);
  for (const input of ['', ' ', '0', '-1', '0.0001', '1000.1', '1,000', '1e3', 'NaN', 'Infinity', '1.2.3', '<script>']) assert.ok(parseAmount(input).error);
});

test('model rejects nonfinite and invalid numeric parameters', () => {
  for (const args of [[0, 100, 1], [1, 0, 1], [Infinity, 10, 1], [1, 100, -1], [1, 100, 100], [1, NaN, 1]]) {
    assert.throws(() => quote(args[0], args[1], args[2]), RangeError);
  }
});

test('small fees remain visible and large outputs remain readable', () => {
  assert.equal(format(0.000003, 6), '0.000003');
  assert.equal(format(498497.74661993), '498,497.75');
});
