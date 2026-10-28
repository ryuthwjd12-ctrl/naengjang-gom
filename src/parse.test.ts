// Run: npm test
import assert from 'node:assert/strict';
import { parseSpeech } from './parse';

const on = '2026-10-27'; // a Tuesday

const pick = (text: string, place?: '냉장' | '냉동' | '실온') =>
  parseSpeech(text, { on, place }).map(({ food: _f, heard: _h, ...rest }) => rest);
const pickFood = (text: string) => parseSpeech(text, { on });

// The example from the spec.
assert.deepEqual(pick('두부 오늘 넣었고 소비기한 11월 5일, 대파 3일 전에 샀어, 우유 유통기한 10월 30일'), [
  { name: '두부', place: '냉장', addedAt: '2026-10-27', date: '2026-11-05', dateKind: '소비기한' },
  { name: '대파', place: '냉장', addedAt: '2026-10-24' },
  { name: '우유', place: '냉장', addedAt: '2026-10-27', date: '2026-10-30', dateKind: '유통기한' },
]);

// Longer names win (the said name is kept), and 양파 is not read as 파; quantities and 까지.
assert.deepEqual(pick('양파 두 개랑 다진 마늘 한 통 11/2까지'), [
  { name: '양파', place: '실온', addedAt: on, qty: '두개' },
  { name: '다진 마늘', place: '냉장', addedAt: on, qty: '한통', date: '2026-11-02', dateKind: '소비기한' },
]);

// The tapped compartment applies unless a place is said; a said place wins.
assert.deepEqual(pick('삼겹살 어제 샀어 계란 한 판 냉장', '냉동'), [
  { name: '삼겹살', place: '냉동', addedAt: '2026-10-26' },
  { name: '계란', place: '냉장', addedAt: on },
]);

// Opened, 이틀 전, next week's weekday as a printed date, and a printed date said with just 기한.
assert.deepEqual(pick('햄 이틀 전에 뜯었어, 요거트 기한 다음 주 금요일'), [
  { name: '햄', place: '냉장', addedAt: '2026-10-25', opened: true },
  { name: '요거트', place: '냉장', addedAt: on, date: '2026-11-06', dateKind: '소비기한' },
]);

// A bought date never lands in the future: "12월 20일에 샀어" said in October means last December.
assert.equal(pick('김치 12월 20일에 샀어')[0].addedAt, '2025-12-20');
// A printed date in January read in late December is next year's.
assert.equal(parseSpeech('우유 1월 3일까지', { on: '2026-12-28' })[0].date, '2027-01-03');
// Words that merely contain a name are not ingredients.
assert.deepEqual(pick('파스타 소스'), []);

// The said alias is kept as the name but the drawing and keep days come from the food.
assert.equal(parseSpeech('삼겹살', { on })[0].food.id, 'pork');
// Numbers the recognizer writes out, 일주일, and a date said before the name ("어제 산 두부").
assert.equal(pick('대파 삼일 전에 샀어')[0].addedAt, '2026-10-24');
assert.equal(pick('김치 일주일 전에 받았어')[0].addedAt, '2026-10-20');
assert.equal(pick('버섯 2주 전')[0].addedAt, '2026-10-13');
assert.deepEqual(pick('어제 산 두부랑 오늘 산 계란').map((p) => p.addedAt), ['2026-10-26', '2026-10-27']);
assert.deepEqual(pick('두부 어제 샀고 계란 그저께').map((p) => p.addedAt), ['2026-10-26', '2026-10-25']);
// 파 alone is 대파, but not inside 양파.
assert.deepEqual(pickFood('파 한 단이랑 양파').map((p) => p.food.id), ['greenOnion', 'onion']);
console.log('parse: ok');
