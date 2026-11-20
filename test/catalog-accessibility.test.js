import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('all five catalog filter selects receive distinct accessible labels', async () => {
  const source = await readFile(new URL('../src/pages/shop/Catalog.jsx', import.meta.url), 'utf8');
  const groupMatch = source.match(/const filterGroups = \[(.*?)\];/s);

  assert.ok(groupMatch, 'catalog filter groups must remain declared');
  assert.equal((groupMatch[1].match(/\['[^']+', '[^']+'\]/g) || []).length, 5);
  assert.match(source, /<select className="select select-bordered" aria-label=\{`\$\{label\} bo‘yicha filtr`\}/);
});
