// A thing in the fridge, and the one rule that matters most: the date it is still safe to eat (먹을 수 있는 기한).
// The rule is conservative on purpose (see docs/spec.md): a printed date is never pushed later, and anything that
// shortens it (opening, portioning, thawing) wins.

import type { Category } from './Ingredients';
import { CATEGORY_KEEP, foodById, type Place } from './foods';

export type DateKind = '소비기한' | '유통기한';

export type Item = {
  id: string;
  name: string;
  foodId?: string; // set when the name is in the dictionary
  category: Category;
  place: Place;
  placeSince: string; // the day it went into its current place (YYYY-MM-DD)
  addedAt: string; // the day it was bought or put in
  qty?: string;
  dateKind?: DateKind; // which date is printed on it
  date?: string; // the printed date
  openedAt?: string; // opened or portioned
  thawedAt?: string; // taken out of the freezer
  photo?: string; // the user's own photo; replaces the drawing everywhere
  box?: number; // number sticker on a portioned box
  note?: string;
};

// Days a thawed item keeps in the fridge.
export const THAWED_DAYS = 1;

// Dates are local calendar days written YYYY-MM-DD.
export function ymd(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function parseYmd(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(s: string, n: number) {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
}
export function daysBetween(from: string, to: string) {
  return Math.round((parseYmd(to).getTime() - parseYmd(from).getTime()) / 86400000);
}
export const today = () => ymd(new Date());

function keepDays(item: Item, place: Place): number {
  const food = foodById(item.foodId);
  // No guide for this place: the shortest the category keeps anywhere.
  const { opened: _opened, ...byPlace } = CATEGORY_KEEP[item.category];
  return food?.keep[place] ?? byPlace[place] ?? Math.min(...Object.values(byPlace));
}
function openedDays(item: Item): number {
  return foodById(item.foodId)?.opened ?? CATEGORY_KEEP[item.category].opened;
}

// The last day it is safe to eat, and why (shown under the date so the user can tell where it came from).
export function eatBy(item: Item): { date: string; why: string } {
  if (item.place === '냉동') {
    // Freezing stops the clock on the printed date, but only if it went in before that date.
    if (item.date && item.placeSince > item.date) return { date: item.date, why: `${item.dateKind ?? '표시된 날짜'}가 지난 뒤 얼렸어요` };
    return { date: addDays(item.placeSince, keepDays(item, '냉동')), why: `얼린 날부터 ${keepDays(item, '냉동')}일` };
  }
  const options: { date: string; why: string }[] = [];
  if (item.date) {
    options.push({ date: item.date, why: item.dateKind === '유통기한' ? '유통기한 (늘리지 않아요)' : '소비기한' });
  } else {
    const n = keepDays(item, item.place);
    options.push({ date: addDays(item.addedAt, n), why: `넣은 날부터 ${n}일 (${item.place} 기본값)` });
  }
  if (item.openedAt) options.push({ date: addDays(item.openedAt, openedDays(item)), why: `개봉·소분 후 ${openedDays(item)}일` });
  if (item.thawedAt) options.push({ date: addDays(item.thawedAt, THAWED_DAYS), why: `해동 후 ${THAWED_DAYS}일` });
  return options.reduce((a, b) => (b.date < a.date ? b : a));
}

export type Level = 'over' | 'soon' | 'week' | 'ok';
export function level(item: Item, on = today()): { level: Level; daysLeft: number } {
  const daysLeft = daysBetween(on, eatBy(item).date);
  const lv: Level = daysLeft < 0 ? 'over' : daysLeft <= 2 ? 'soon' : daysLeft <= 5 ? 'week' : 'ok';
  return { level: lv, daysLeft };
}

// Moving an item between places: into the freezer restarts its clock; out of the freezer counts as thawing.
export function moveTo(item: Item, place: Place, on = today()): Item {
  if (place === item.place) return item;
  return {
    ...item,
    place,
    placeSince: on,
    thawedAt: item.place === '냉동' ? on : place === '냉동' ? undefined : item.thawedAt,
  };
}

// Korean particles that depend on whether the word ends in a consonant: josa('버섯', '은', '는') → '버섯은'.
export function josa(word: string, withFinal: string, without: string) {
  const c = word.charCodeAt(word.length - 1);
  const final = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
  return word + (final ? withFinal : without);
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
