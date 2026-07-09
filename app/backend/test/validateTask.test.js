import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTask } from '../src/middleware/validateTask.js';

function run(body) {
  let calledNext = false;
  let statusCode;
  let jsonBody;
  const req = { body };
  const res = {
    status(code) { statusCode = code; return this; },
    json(payload) { jsonBody = payload; return this; },
  };
  validateTask(req, res, () => { calledNext = true; });
  return { calledNext, statusCode, jsonBody };
}

test('accepts a non-empty title', () => {
  const { calledNext } = run({ title: 'Buy milk' });
  assert.equal(calledNext, true);
});

test('accepts a body with no title (e.g. PUT toggling done only)', () => {
  const { calledNext } = run({ done: true });
  assert.equal(calledNext, true);
});

test('rejects an empty title', () => {
  const { calledNext, statusCode } = run({ title: '   ' });
  assert.equal(calledNext, false);
  assert.equal(statusCode, 400);
});

test('rejects a non-string title', () => {
  const { calledNext, statusCode } = run({ title: 42 });
  assert.equal(calledNext, false);
  assert.equal(statusCode, 400);
});
