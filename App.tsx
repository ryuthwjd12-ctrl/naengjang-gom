import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AddSheet, type AddMode } from './src/AddSheet';
import { Character } from './src/Character';
import { Fridge as FridgeBody } from './src/Fridge';
import { BoxIcon, Category, Ingredient } from './src/Ingredients';
import { ItemSheet, takePhoto } from './src/ItemSheet';
import type { Place } from './src/foods';
import { addDays, josa, level, newId, today, type Item } from './src/item';
import { addItems, nextBoxNumber, useItems } from './src/store';
import { C, LevelBadge, PLACES, ROOM, Thumb } from './src/ui';

function param(key: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(key);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {param('screen') === 'art' ? <ArtScreen /> : <Fridge />}
    </SafeAreaProvider>
  );
}

// What the bear says, from the most pressing thing in the fridge.
function bearSays(items: Item[]) {
  if (!items.length) return { text: '냉장고가 비었어요.\n장 본 걸 말로 넣어 보세요!', mood: 'normal' as const };
  const ranked = items.map((i) => ({ i, ...level(i) })).sort((a, b) => a.daysLeft - b.daysLeft);
  const over = ranked.filter((r) => r.level === 'over');
  if (over.length) return { text: `${over.length > 1 ? `${over[0].i.name} 외 ${over.length - 1}개는` : josa(over[0].i.name, '은', '는')} 기한이 지났어요.\n아깝지만 버려 주세요.`, mood: 'shock' as const };
  const soon = ranked[0];
  if (soon.level === 'soon')
    return { text: `${soon.daysLeft === 0 ? `${josa(soon.i.name, '은', '는')} 오늘까지예요!` : soon.daysLeft === 1 ? `${josa(soon.i.name, '이', '가')} 내일까지예요!` : `${josa(soon.i.name, '이', '가')} ${soon.daysLeft}일 남았어요!`}\n먼저 먹어 주세요.`, mood: 'normal' as const };
  return { text: `냉장고 친구들 ${items.length}개,\n모두 괜찮아요!`, mood: 'happy' as const };
}

function Fridge() {
  const insets = useSafeAreaInsets();
  const [items, ready] = useItems();
  const [place, setPlace] = useState<Place>('냉장');
  const [adding, setAdding] = useState<{ place?: Place; mode?: AddMode } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  useDemo(ready, items);

  const shown = items.filter((i) => i.place === place).sort((a, b) => level(a).daysLeft - level(b).daysLeft);
  const bear = bearSays(items);
  const open = items.find((i) => i.id === openId) ?? null;

  async function addBox() {
    const photo = await takePhoto();
    if (!photo) return;
    const on = today();
    const box: Item = { id: newId(), name: `${nextBoxNumber()}번 통`, box: nextBoxNumber(), photo, category: 'other', place: '냉동', placeSince: on, addedAt: on, openedAt: on };
    addItems([box]);
    setOpenId(box.id);
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.header}>
          <Text style={s.title}>냉장곰</Text>
          <Text style={s.sub}>오늘도 남김없이</Text>
        </View>

        <View style={s.bearRow}>
          <Character face="🐻" size={86} apron pose="wave" mood={bear.mood} />
          <View style={s.bubble}>
            <Text style={s.bubbleText}>{bear.text}</Text>
          </View>
        </View>

        <View style={s.tabs}>
          {PLACES.map((p) => (
            <Pressable key={p} onPress={() => setPlace(p)} style={[s.tab, place === p && s.tabOn]}>
              <Text style={[s.tabText, place === p && s.tabTextOn]}>
                {p} {items.filter((i) => i.place === p).length}
              </Text>
            </Pressable>
          ))}
        </View>

        <FridgeBody place={place} onSpeak={() => setAdding({ place })} onPick={() => setAdding({ place, mode: 'pick' })} empty={ready ? `${ROOM[place]}이 비어 있어요` : undefined}>
          {shown.map((it) => (
            <Pressable key={it.id} style={s.cell} onPress={() => setOpenId(it.id)}>
              <View style={[s.icon, it.photo && s.iconPhoto]}>
                <Thumb item={it} size={it.photo ? 72 : 56} />
              </View>
              <Text style={s.name} numberOfLines={1}>
                {it.name}
              </Text>
              <LevelBadge item={it} />
            </Pressable>
          ))}
        </FridgeBody>

        <View style={s.legend}>
          <Legend color={C.week} text="먹을 수 있는 기한 3~5일 남음" />
          <Legend color={C.soon} text="2일 이내" />
          <Legend color={C.over} text="기한 지남, 먹지 마세요" />
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={[s.dock, { bottom: 20 + insets.bottom }]}>
        <Pressable style={[s.dockBtn, s.dockSmall]} onPress={addBox}>
          <Text style={s.dockSmallText}>📷 통</Text>
        </Pressable>
        <Pressable style={[s.dockBtn, s.dockSmall]} onPress={() => setAdding({ mode: 'pick' })}>
          <Text style={s.dockSmallText}>✋ 골라 넣기</Text>
        </Pressable>
        <Pressable style={[s.dockBtn, s.mic]} onPress={() => setAdding({})}>
          <Text style={s.micText}>🎙 말로 넣기</Text>
        </Pressable>
      </View>

      <AddSheet visible={!!adding} place={adding?.place} mode={adding?.mode} onClose={() => setAdding(null)} />
      <ItemSheet item={open} onClose={() => setOpenId(null)} />
    </View>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={s.legendRow}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{text}</Text>
    </View>
  );
}

// Web previews only: ?demo=1 fills an empty fridge with sample items so the screens can be looked at.
function useDemo(ready: boolean, items: Item[]) {
  useEffect(() => {
    if (!ready || items.length || param('demo') !== '1') return;
    const on = today();
    const mk = (name: string, foodId: string | undefined, category: Category, place: Place, extra: Partial<Item> = {}): Item => ({
      id: newId(), name, foodId, category, place, placeSince: on, addedAt: on, ...extra,
    });
    addItems([
      mk('두부', 'tofu', 'other', '냉장', { dateKind: '소비기한', date: addDays(on, 1) }),
      mk('우유', 'milk', 'dairy', '냉장', { dateKind: '유통기한', date: addDays(on, 4) }),
      mk('버섯', 'mushroom', 'veg', '냉장', { addedAt: addDays(on, -6) }),
      mk('대파', 'greenOnion', 'veg', '냉장', { addedAt: addDays(on, -2) }),
      mk('계란', 'egg', 'other', '냉장', { dateKind: '소비기한', date: addDays(on, 12) }),
      mk('김치', 'kimchi', 'other', '냉장'),
      mk('1번 통', undefined, 'other', '냉동', { box: 1, note: '다짐육 200g', openedAt: on }),
      mk('밥', 'rice', 'other', '냉동'),
      mk('감자', 'potato', 'veg', '실온', { addedAt: addDays(on, -5) }),
      mk('양파', 'onion', 'veg', '실온'),
    ]);
  }, [ready]);
}

const ART_LIST: { id?: string; category?: Category; name: string; box?: boolean }[] = [
  { id: 'egg', name: '계란' }, { id: 'tofu', name: '두부' }, { id: 'greenOnion', name: '대파' },
  { id: 'onion', name: '양파' }, { id: 'milk', name: '우유' }, { id: 'kimchi', name: '김치' },
  { id: 'pork', name: '돼지고기' }, { id: 'carrot', name: '당근' }, { id: 'potato', name: '감자' },
  { id: 'mushroom', name: '버섯' }, { id: 'rice', name: '밥' }, { box: true, name: '소분 통' },
  { category: 'veg', name: '채소 (기본)' }, { category: 'fish', name: '생선 (기본)' }, { category: 'sauce', name: '소스 (기본)' },
];

function ArtScreen() {
  return (
    <ScrollView contentContainerStyle={[s.page, { paddingTop: 48 }]}>
      <Text style={s.title}>재료 그림 시안</Text>
      <Text style={[s.sub, { marginBottom: 14 }]}>그림이 없는 재료는 종류별 기본 그림으로 나와요</Text>
      <View style={s.fridge}>
        {ART_LIST.map((a) => (
          <View key={a.name} style={s.cell}>
            <View style={s.icon}>{a.box ? <BoxIcon n={3} size={64} /> : <Ingredient id={a.id} category={a.category} size={64} />}</View>
            <Text style={s.name}>{a.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  page: { padding: 18, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  title: { fontSize: 28, fontWeight: '800', color: C.ink },
  sub: { fontSize: 14, color: C.soft },
  bearRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bubble: {
    flex: 1, marginLeft: 6, backgroundColor: C.card, borderRadius: 18, padding: 12,
    shadowColor: '#C9A98A', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  bubbleText: { fontSize: 15, lineHeight: 21, color: C.ink, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.chip },
  tabOn: { backgroundColor: C.mint },
  tabText: { fontSize: 15, color: C.soft, fontWeight: '700' },
  tabTextOn: { color: '#FFFFFF' },
  fridge: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.fridge, borderRadius: 24, padding: 8, borderWidth: 3, borderColor: C.fridgeLine, minHeight: 160 },
  cell: { width: '33.33%', alignItems: 'center', paddingVertical: 8 },
  icon: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  iconPhoto: { backgroundColor: 'transparent' },
  name: { marginTop: 6, fontSize: 15, fontWeight: '700', color: C.ink, maxWidth: '90%' },
  legend: { marginTop: 10, gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: C.soft },
  dock: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 10 },
  dockBtn: { borderRadius: 26, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  dockSmall: { paddingHorizontal: 14, backgroundColor: C.card, borderWidth: 2, borderColor: C.fridgeLine },
  dockSmallText: { fontSize: 15, fontWeight: '700', color: C.ink },
  mic: { flex: 1, backgroundColor: C.mint },
  micText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
});
