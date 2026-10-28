// Shared look: colours, the item thumbnail (photo > box > drawing), level badges and small controls.

import { useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { BoxIcon, Ingredient } from './Ingredients';
import { foodById, type Place } from './foods';
import { addDays, daysBetween, level, parseYmd, today, ymd, type Item, type Level } from './item';
import { photoUri } from './store';

export const C = {
  bg: '#FFF8EE',
  card: '#FFFFFF',
  ink: '#5A4A48',
  soft: '#9A8A86',
  line: '#EFE4D6',
  fridge: '#DDF2EC',
  fridgeLine: '#B8E0D4',
  mint: '#7CC8B4',
  mintInk: '#4E9C88',
  week: '#FFE58A',
  soon: '#FFC48A',
  over: '#F59A9A',
  chip: '#F3E9DC',
};

export const PLACES: Place[] = ['냉장', '냉동', '실온'];
export const ROOM: Record<Place, string> = { 냉장: '냉장실', 냉동: '냉동실', 실온: '실온 칸' };

// The user's own photo wins over any drawing; then a numbered box; then the ingredient's drawing.
export function Thumb({ item, size }: { item: Pick<Item, 'photo' | 'box' | 'foodId' | 'category'>; size: number }) {
  if (item.photo) return <Image source={{ uri: photoUri(item.photo) }} style={{ width: size, height: size, borderRadius: size * 0.28 }} />;
  if (item.box != null) return <BoxIcon n={item.box} size={size} />;
  return <Ingredient id={foodById(item.foodId)?.art ?? item.foodId} category={item.category} size={size} />;
}

const LEVEL_COLOR: Record<Level, string | null> = { over: C.over, soon: C.soon, week: C.week, ok: null };

export function LevelBadge({ item }: { item: Item }) {
  const { level: lv, daysLeft } = level(item);
  const color = LEVEL_COLOR[lv];
  if (!color) return <Text style={s.days}>{daysLeft}일 남음</Text>;
  const label = lv === 'over' ? '먹지 마세요' : daysLeft === 0 ? '오늘까지' : `D-${daysLeft}`;
  return (
    <View style={[s.badge, { backgroundColor: color }]}>
      <Text style={s.badgeText}>{label}</Text>
    </View>
  );
}

const WEEK = '일월화수목금토';
export function dateLabel(d: string) {
  const t = parseYmd(d);
  return `${t.getMonth() + 1}월 ${t.getDate()}일 (${WEEK[t.getDay()]})`;
}
export function relLabel(d: string) {
  const n = daysBetween(today(), d);
  if (n === 0) return '오늘';
  if (n === -1) return '어제';
  if (n === 1) return '내일';
  return n < 0 ? `${-n}일 전` : `${n}일 뒤`;
}

// A date with ‹ › to nudge it a day at a time ("3 days ago" fixes); tap the date itself for a calendar.
export function DateStepper({ value, onChange, max }: { value: string; onChange: (v: string) => void; max?: string }) {
  const [picking, setPicking] = useState(false);
  const next = addDays(value, 1);
  return (
    <View style={s.stepper}>
      <Pressable hitSlop={8} onPress={() => onChange(addDays(value, -1))} style={s.stepBtn}>
        <Text style={s.stepText}>‹</Text>
      </Pressable>
      <Pressable onPress={() => setPicking(true)} style={{ flex: 1 }}>
        <Text style={s.stepValue}>
          {dateLabel(value)} <Text style={s.stepRel}>{relLabel(value)}</Text> <Text style={s.stepCal}>📅</Text>
        </Text>
      </Pressable>
      <Pressable hitSlop={8} disabled={!!max && next > max} onPress={() => onChange(next)} style={[s.stepBtn, !!max && next > max && { opacity: 0.3 }]}>
        <Text style={s.stepText}>›</Text>
      </Pressable>
      {picking && (
        <Calendar
          value={value}
          max={max}
          onPick={(v) => {
            setPicking(false);
            onChange(v);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </View>
  );
}

// A month at a time; days after `max` can't be picked.
function Calendar({ value, max, onPick, onClose }: { value: string; max?: string; onPick: (v: string) => void; onClose: () => void }) {
  const [month, setMonth] = useState(() => {
    const d = parseYmd(value);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const first = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => ymd(new Date(month.getFullYear(), month.getMonth(), i + 1)))];
  while (cells.length % 7) cells.push(null);
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const nextMonth = ymd(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  const now = today();
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.calBack} onPress={onClose}>
        <Pressable style={s.cal} onPress={() => {}}>
          <View style={s.calHead}>
            <Pressable hitSlop={10} onPress={() => shift(-1)} style={s.stepBtn}>
              <Text style={s.stepText}>‹</Text>
            </Pressable>
            <Text style={s.calTitle}>
              {month.getFullYear()}년 {month.getMonth() + 1}월
            </Text>
            <Pressable hitSlop={10} disabled={!!max && nextMonth > max} onPress={() => shift(1)} style={[s.stepBtn, !!max && nextMonth > max && { opacity: 0.3 }]}>
              <Text style={s.stepText}>›</Text>
            </Pressable>
          </View>
          <View style={s.calGrid}>
            {WEEK.split('').map((w, i) => (
              <Text key={w} style={[s.calWeek, i === 0 && { color: '#E08A8A' }]}>
                {w}
              </Text>
            ))}
            {cells.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={s.calCell} />;
              const off = !!max && d > max;
              const on = d === value;
              return (
                <Pressable key={d} disabled={off} onPress={() => onPick(d)} style={s.calCell}>
                  <View style={[s.calDay, on && s.calDayOn, d === now && !on && s.calToday]}>
                    <Text style={[s.calDayText, on && { color: '#FFFFFF' }, off && { opacity: 0.25 }]}>{+d.slice(8)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={s.calFoot}>
            <Chip small label="오늘" onPress={() => onPick(now)} />
            <Chip small label="닫기" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// A text box with a soft mint border when focused (the browser's own blue outline gets clipped at the sheet edges).
export function Input({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={C.soft}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[style, focused && { borderColor: C.mint, borderWidth: 2 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
    />
  );
}

// How many: − n + over the item's quantity text ("두 개", "3팩"), keeping its unit.
const WORD_NUM: Record<string, number> = { 한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5, 여섯: 6, 일곱: 7, 여덟: 8, 아홉: 9, 열: 10 };
export function qtyParts(qty?: string): { n: number; unit: string } {
  const m = qty?.match(/^(\d+|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|반)?\s*(.*)$/);
  const n = !m?.[1] ? 1 : m[1] === '반' ? 1 : WORD_NUM[m[1]] ?? +m[1];
  return { n, unit: m?.[2] || '개' };
}
export function QtyStepper({ qty, onChange }: { qty?: string; onChange: (qty: string) => void }) {
  const { n, unit } = qtyParts(qty);
  return (
    <View style={s.qty}>
      <Pressable hitSlop={8} disabled={n <= 1} onPress={() => onChange(`${n - 1}${unit}`)} style={[s.qtyBtn, n <= 1 && { opacity: 0.3 }]}>
        <Text style={s.stepText}>−</Text>
      </Pressable>
      <Text style={s.qtyText}>
        {n}
        {unit}
      </Text>
      <Pressable hitSlop={8} onPress={() => onChange(`${n + 1}${unit}`)} style={s.qtyBtn}>
        <Text style={s.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

export function Chip({ label, on, onPress, small, style }: { label: string; on?: boolean; onPress?: () => void; small?: boolean; style?: object }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, small && s.chipSmall, on && s.chipOn, style]}>
      <Text style={[s.chipText, small && { fontSize: 13 }, on && s.chipTextOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Button({ label, onPress, kind = 'main', style }: { label: string; onPress?: () => void; kind?: 'main' | 'plain' | 'danger'; style?: object }) {
  return (
    <Pressable onPress={onPress} style={[s.btn, kind === 'main' ? s.btnMain : kind === 'danger' ? s.btnDanger : s.btnPlain, style]}>
      <Text style={[s.btnText, kind === 'main' && { color: '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

export const s = StyleSheet.create({
  days: { marginTop: 3, fontSize: 12, color: C.soft },
  badge: { marginTop: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '800', color: C.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.chip, borderRadius: 14, paddingHorizontal: 4, paddingVertical: 2 },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 22, fontWeight: '700', color: C.ink },
  stepValue: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: C.ink },
  stepRel: { fontSize: 12, fontWeight: '600', color: C.soft },
  stepCal: { fontSize: 12 },
  qty: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.chip, borderRadius: 14, paddingHorizontal: 4 },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qtyText: { minWidth: 44, textAlign: 'center', fontSize: 15, fontWeight: '800', color: C.ink },
  calBack: { flex: 1, backgroundColor: 'rgba(90,74,72,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  cal: { width: '100%', maxWidth: 360, backgroundColor: C.bg, borderRadius: 22, padding: 14 },
  calHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calTitle: { fontSize: 17, fontWeight: '800', color: C.ink },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  calWeek: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontWeight: '700', color: C.soft, paddingVertical: 4 },
  calCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  calDay: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  calDayOn: { backgroundColor: C.mint },
  calToday: { borderWidth: 2, borderColor: C.fridgeLine },
  calDayText: { fontSize: 15, fontWeight: '700', color: C.ink },
  calFoot: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: C.chip, alignItems: 'center' },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  chipOn: { backgroundColor: C.mint },
  chipText: { fontSize: 15, fontWeight: '700', color: C.soft },
  chipTextOn: { color: '#FFFFFF' },
  btn: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  btnMain: { backgroundColor: C.mint },
  btnPlain: { backgroundColor: C.card, borderWidth: 2, borderColor: C.fridgeLine },
  btnDanger: { backgroundColor: '#FFE9E9' },
  btnText: { fontSize: 16, fontWeight: '800', color: C.ink },
});
