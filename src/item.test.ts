// Run: npm test
import assert from 'node:assert/strict';
import { eatBy, level, moveTo, type Item } from './item';

const base: Item = { id: '1', name: '두부', foodId: 'tofu', category: 'other', place: '냉장', placeSince: '2026-10-20', addedAt: '2026-10-20' };

// No printed date: the day it went in plus the fridge default (두부 3일).
assert.equal(eatBy(base).date, '2026-10-23');
// A printed 소비기한 is used as is.
assert.equal(eatBy({ ...base, dateKind: '소비기한', date: '2026-11-05' }).date, '2026-11-05');
// A printed 유통기한 is never pushed later.
const milk: Item = { ...base, name: '우유', foodId: 'milk', category: 'dairy', dateKind: '유통기한', date: '2026-10-30' };
assert.equal(eatBy(milk).date, '2026-10-30');
// Opening shortens it: 우유 개봉 후 3일.
assert.equal(eatBy({ ...milk, openedAt: '2026-10-25' }).date, '2026-10-28');
// ...but never lengthens it.
assert.equal(eatBy({ ...milk, openedAt: '2026-10-29' }).date, '2026-10-30');

// Freezing restarts the clock (두부 냉동 30일) if it went in before the printed date.
const frozen = moveTo({ ...base, dateKind: '소비기한', date: '2026-10-25' }, '냉동', '2026-10-22');
assert.equal(eatBy(frozen).date, '2026-11-21');
// Frozen after the printed date: still past it.
assert.equal(eatBy(moveTo({ ...base, dateKind: '소비기한', date: '2026-10-21' }, '냉동', '2026-10-22')).date, '2026-10-21');
// Thawed: one day in the fridge.
const thawed = moveTo(frozen, '냉장', '2026-11-01');
assert.equal(thawed.thawedAt, '2026-11-01');
assert.equal(eatBy(thawed).date, '2026-10-25'); // the printed date had already passed by then
assert.equal(eatBy(moveTo(moveTo(base, '냉동', '2026-10-21'), '냉장', '2026-10-22')).date, '2026-10-23');

// Unknown food: the category default (other, 냉장 3일).
assert.equal(eatBy({ ...base, foodId: undefined, name: '나물무침' }).date, '2026-10-23');

// Levels.
assert.deepEqual(level(base, '2026-10-24'), { level: 'over', daysLeft: -1 });
assert.deepEqual(level(base, '2026-10-21'), { level: 'soon', daysLeft: 2 });
assert.equal(level({ ...base, dateKind: '소비기한', date: '2026-10-30' }, '2026-10-25').level, 'week');
assert.equal(level({ ...base, dateKind: '소비기한', date: '2026-11-30' }, '2026-10-25').level, 'ok');

console.log('item: ok');
