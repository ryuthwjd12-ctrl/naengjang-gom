// Shared look: colours, the item thumbnail (photo > box > drawing), level badges and small controls.

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BoxIcon, Ingredient } from './Ingredients';
import { foodById, type Place } from './foods';
import { addDays, daysBetween, level, parseYmd, today, type Item, type Level } from './item';
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

// A date with ‹ › to nudge it a day at a time (easier than a calendar for "3 days ago" fixes).
export function DateStepper({ value, onChange, max }: { value: string; onChange: (v: string) => void; max?: string }) {
  const next = addDays(value, 1);
  return (
    <View style={s.stepper}>
      <Pressable hitSlop={8} onPress={() => onChange(addDays(value, -1))} style={s.stepBtn}>
        <Text style={s.stepText}>‹</Text>
      </Pressable>
      <Text style={s.stepValue}>
        {dateLabel(value)} <Text style={s.stepRel}>{relLabel(value)}</Text>
      </Text>
      <Pressable hitSlop={8} disabled={!!max && next > max} onPress={() => onChange(next)} style={[s.stepBtn, !!max && next > max && { opacity: 0.3 }]}>
        <Text style={s.stepText}>›</Text>
      </Pressable>
    </View>
  );
}

export function Chip({ label, on, onPress, small }: { label: string; on?: boolean; onPress?: () => void; small?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, small && s.chipSmall, on && s.chipOn]}>
      <Text style={[s.chipText, small && { fontSize: 13 }, on && s.chipTextOn]}>{label}</Text>
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
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: C.chip },
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
