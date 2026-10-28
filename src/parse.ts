// Turns what the user said ("두부 오늘 넣었고 소비기한 11월 5일, 대파 3일 전에 샀어") into fridge items.
// No AI: ingredient names come from the dictionary, dates and places from fixed Korean phrasings. Whatever it gets
// wrong, the user fixes on the confirm card before anything is saved.

import { NAMES, type Food, type Place } from './foods';
import { addDays, parseYmd, ymd, type DateKind } from './item';

export type Parsed = {
  food: Food;
  name: string; // the name as said ("삼겹살"), which may be an alias of the food ("돼지고기")
  heard: string; // the words this item came from
  place: Place;
  addedAt: string;
  qty?: string;
  dateKind?: DateKind;
  date?: string;
  opened?: boolean;
};

const NUM: Record<string, number> = {
  한: 1, 하루: 1, 두: 2, 이틀: 2, 세: 3, 사흘: 3, 네: 4, 나흘: 4, 다섯: 5, 여섯: 6, 일곱: 7, 여덟: 8, 아홉: 9, 열: 10,
};
const WEEKDAY: Record<string, number> = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };

// A date phrase, matched in this order. Each returns the date given today, and `past` says whether a bare month/day
// should be read as the most recent one (when something was bought) or the next one (a printed date).
type Rule = { re: RegExp; date: (m: RegExpMatchArray, on: string, past: boolean) => string };
const RULES: Rule[] = [
  { re: /(\d{1,2})\s*월\s*(\d{1,2})\s*일/, date: (m, on, past) => monthDay(+m[1], +m[2], on, past) },
  { re: /(\d{1,2})\s*[./]\s*(\d{1,2})(?!\d)/, date: (m, on, past) => monthDay(+m[1], +m[2], on, past) },
  { re: /(\d{1,2})\s*일\s*(?:전|앞)/, date: (m, on) => addDays(on, -+m[1]) },
  { re: /(\d{1,2})\s*일\s*(?:뒤|후)/, date: (m, on) => addDays(on, +m[1]) },
  { re: /(하루|이틀|사흘|나흘)\s*(?:전|앞)/, date: (m, on) => addDays(on, -NUM[m[1]]) },
  { re: /(하루|이틀|사흘|나흘)\s*(?:뒤|후)/, date: (m, on) => addDays(on, NUM[m[1]]) },
  { re: /(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(?:주|주일)\s*(?:전|앞)/, date: (m, on) => addDays(on, -7 * NUM[m[1]]) },
  { re: /(?:다음\s*주|담주)\s*([일월화수목금토])\s*요일/, date: (m, on) => weekday(on, WEEKDAY[m[1]], 1) },
  { re: /(?:이번\s*주)\s*([일월화수목금토])\s*요일/, date: (m, on) => weekday(on, WEEKDAY[m[1]], 0) },
  { re: /(?:지난\s*주|저번\s*주)\s*([일월화수목금토])\s*요일/, date: (m, on) => weekday(on, WEEKDAY[m[1]], -1) },
  { re: /그(?:저)?께|그제/, date: (_m, on) => addDays(on, -2) },
  { re: /어제/, date: (_m, on) => addDays(on, -1) },
  { re: /오늘/, date: (_m, on) => on },
  { re: /모레/, date: (_m, on) => addDays(on, 2) },
  { re: /내일/, date: (_m, on) => addDays(on, 1) },
];

function monthDay(month: number, day: number, on: string, past: boolean) {
  const now = parseYmd(on);
  let d = new Date(now.getFullYear(), month - 1, day);
  // A bought date is never in the future; a printed date more than two months back is next year's.
  if (past && ymd(d) > on) d = new Date(now.getFullYear() - 1, month - 1, day);
  if (!past && ymd(d) < addDays(on, -60)) d = new Date(now.getFullYear() + 1, month - 1, day);
  return ymd(d);
}
function weekday(on: string, target: number, weekOffset: number) {
  const d = parseYmd(on);
  const monday = addDays(on, -((d.getDay() + 6) % 7)); // weeks start on Monday
  return addDays(monday, ((target + 6) % 7) + 7 * weekOffset);
}

function findDate(text: string, on: string, past: boolean): { date: string; index: number; length: number } | null {
  let best: { date: string; index: number; length: number } | null = null;
  for (const rule of RULES) {
    const m = text.match(rule.re);
    if (m && m.index != null && (!best || m.index < best.index)) best = { date: rule.date(m, on, past), index: m.index, length: m[0].length };
  }
  return best;
}

const QTY = /(\d+|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|반)\s*(개|알|팩|봉지|봉|모|단|줄|통|마리|캔|병|덩이|근|g|그램|kg|키로)/;

// Where each item starts: every dictionary name in the text, longest match first, not inside a longer word.
function mentions(text: string) {
  const found: { index: number; length: number; food: Food; name: string }[] = [];
  const taken = new Array(text.length).fill(false);
  for (const { text: name, food } of NAMES) {
    let from = 0;
    while (true) {
      const i = text.indexOf(name, from);
      if (i < 0) break;
      from = i + 1;
      if (taken.slice(i, i + name.length).some(Boolean)) continue;
      // Skip names glued to the end of a longer Hangul word ("양파" inside "자색양파" is fine to take, but not "파" in "파스타").
      const after = text[i + name.length];
      if (after && /[가-힣]/.test(after) && !/^(은|는|이|가|을|를|도|랑|이랑|하고|과|와|만|좀|요|두|한|세|네)/.test(text.slice(i + name.length))) continue;
      for (let k = i; k < i + name.length; k++) taken[k] = true;
      found.push({ index: i, length: name.length, food, name });
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

export function parseSpeech(text: string, opts: { on: string; place?: Place }): Parsed[] {
  const marks = mentions(text);
  return marks.map((mark, n) => {
    const end = n + 1 < marks.length ? marks[n + 1].index : text.length;
    let rest = text.slice(mark.index + mark.length, end);
    const heard = text.slice(mark.index, end).replace(/[\s,.;]+$/, '').trim();
    const food = mark.food;
    const item: Parsed = { food, name: mark.name, heard, place: opts.place ?? food.place, addedAt: opts.on };

    // A place said out loud wins over the compartment the user tapped.
    if (/냉동/.test(rest)) item.place = '냉동';
    else if (/냉장/.test(rest)) item.place = '냉장';
    else if (/실온|상온|밖에/.test(rest)) item.place = '실온';

    const q = rest.match(QTY);
    if (q) item.qty = q[0].replace(/\s+/g, '');
    if (/개봉|뜯었|뜯은|따놓|땄|소분/.test(rest)) item.opened = true;

    // The printed date: after the words 소비기한/유통기한, or a date followed by 까지.
    const kind = rest.match(/(소비\s*기한|유통\s*기한|기한)/);
    if (kind && kind.index != null) {
      const after = rest.slice(kind.index + kind[0].length);
      const d = findDate(after, opts.on, false);
      if (d) {
        item.date = d.date;
        item.dateKind = /유통/.test(kind[0]) ? '유통기한' : /소비/.test(kind[0]) ? '소비기한' : food.usesSellBy ? '유통기한' : '소비기한';
        rest = rest.slice(0, kind.index) + ' ' + after.slice(0, d.index) + after.slice(d.index + d.length);
      }
    }
    if (!item.date) {
      const until = rest.match(/(.*?)까지/);
      if (until) {
        const d = findDate(until[1], opts.on, false);
        if (d) {
          item.date = d.date;
          item.dateKind = food.usesSellBy ? '유통기한' : '소비기한';
          rest = rest.slice(until[0].length);
        }
      }
    }
    // Any other date is when it was bought or put in.
    const bought = findDate(rest, opts.on, true);
    if (bought && bought.date <= opts.on) item.addedAt = bought.date;
    return item;
  });
}
