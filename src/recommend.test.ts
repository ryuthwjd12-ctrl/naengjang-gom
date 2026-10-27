// Run: node --experimental-strip-types src/recommend.test.ts
import assert from 'node:assert/strict';
import { recommend, type Recipe, type Stock } from './recommend.ts';

const stock: Stock[] = [
  { name: '두부', daysLeft: 1 },
  { name: '대파', daysLeft: 5 },
  { name: '계란', daysLeft: 12 },
  { name: '양파', daysLeft: 14 },
  { name: '버섯', daysLeft: -1 }, // past its date: never used
  { name: '밥', daysLeft: 28 },
];
const recipes: Recipe[] = [
  { id: 'a', name: '계란볶음밥', ingredients: ['계란', '밥', '대파'] },
  { id: 'g', name: '양파계란덮밥', ingredients: ['양파', '계란', '밥'], saved: true },
  { id: 'b', name: '두부조림', ingredients: ['두부', '대파', '고춧가루'] },
  { id: 'c', name: '내 계란말이', ingredients: ['계란', '쪽파'], mine: true },
  { id: 'd', name: '버섯볶음', ingredients: ['버섯', '양파'] },
  { id: 'e', name: '내 두부부침', ingredients: ['두부', '계란'], mine: true },
  { id: 'f', name: '김치찌개', ingredients: ['김치', '돼지고기', '두부'] },
];
const subs = { 쪽파: ['대파'] };

const out = recommend(recipes, stock, subs);
const names = out.map((m) => m.recipe.name);

// Urgent (두부, 1 day) first, mine before built-in; then the rest, mine and bookmarked first.
assert.deepEqual(names, ['내 두부부침', '두부조림', '양파계란덮밥', '내 계란말이', '계란볶음밥', '버섯볶음']);
// 쪽파 is covered by 대파.
assert.deepEqual(out.find((m) => m.recipe.id === 'c')!.swaps, [{ need: '쪽파', use: '대파' }]);
// The expired 버섯 counts as missing, and 김치찌개 (2 missing) is not shown.
assert.deepEqual(out.find((m) => m.recipe.id === 'd')!.missing, ['버섯']);
assert.equal(out.find((m) => m.recipe.id === 'f'), undefined);
assert.equal(out[0].urgentIn, 1);
console.log('recommend: ok', names.join(' > '));
