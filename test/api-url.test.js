import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiBase } from '../src/services/api-url.js';
test('API base has exactly one /api', () => {
    assert.equal(normalizeApiBase('/api/'), '/api');
    assert.equal(normalizeApiBase('http://127.0.0.1:5000/api/'), 'http://127.0.0.1:5000/api');
    for (const bad of ['https://x.invalid/api/api', 'https://x.invalid', 'https://x.invalid/api?secret=x', 'https://u:p@x.invalid/api', 'javascript:alert(1)', '/api/api']) assert.throws(() => normalizeApiBase(bad));
});
