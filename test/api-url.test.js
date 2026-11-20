import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiBase } from '../src/services/api-url.js';
import {resolveApiBase} from '../src/services/api.js';
test('API base has exactly one /api', () => {
    assert.equal(normalizeApiBase('/api/'), '/api');
    assert.equal(normalizeApiBase('http://127.0.0.1:5000/api/'), 'http://127.0.0.1:5000/api');
    for (const bad of ['https://x.invalid/api/api', 'https://x.invalid', 'https://x.invalid/api?secret=x', 'https://u:p@x.invalid/api', 'javascript:alert(1)', '/api/api']) assert.throws(() => normalizeApiBase(bad));
});
test('production customer API is always same-origin so owner cookie remains first-party',()=>{
    assert.equal(resolveApiBase({configured:'https://backend.invalid/api',production:true}),'/api');
    assert.equal(resolveApiBase({configured:'http://127.0.0.1:5000/api',production:false}),'http://127.0.0.1:5000/api');
});
