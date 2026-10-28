import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { analyticsBootstrap } from '../lib/analytics-config.ts';

test('configuration and early events queue before the external library loads', () => {
  const window = { dataLayer: [['existing']] };
  vm.runInNewContext(analyticsBootstrap('G-WW5XWW0YFE'), { window });
  window.gtag('event', 'network_click', { source_site: 'career' });
  assert.equal(window.dataLayer[0][0], 'existing');
  assert.equal(window.dataLayer[2][0], 'config');
  assert.equal(window.dataLayer[2][1], 'G-WW5XWW0YFE');
  assert.equal(window.dataLayer[3][1], 'network_click');
});
test('an embedded less-than sign cannot terminate the inline script', () => {
  assert(!analyticsBootstrap('</script>').includes('<'));
});
