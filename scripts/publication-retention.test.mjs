import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retainObservedNewsUrl } from '../lib/publication-retention.ts';
test('an already published observed URL is retained when freshness changes', () => {
  assert.equal(retainObservedNewsUrl({slug:'existing',status:'published'},['existing']),true);
});
test('a draft cannot be promoted through the retention list', () => {
  assert.equal(retainObservedNewsUrl({slug:'existing',status:'draft'},['existing']),false);
});
test('a previously unobserved URL has no retention exemption', () => {
  assert.equal(retainObservedNewsUrl({slug:'new',status:'published'},['existing']),false);
});
