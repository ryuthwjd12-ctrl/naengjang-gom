import { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Character } from './src/Character';
import { BoxIcon, Category, Ingredient } from './src/Ingredients';

// Design draft (시안): three static screens with sample data, no storage or voice yet.
// On the web, ?screen=voice and ?screen=art open the other two screens.

const C = {
  bg: '#FFF8EE',
  card: '#FFFFFF',
  ink: '#5A4A48',
  soft: '#9A8A86',
  fridge: '#DDF2EC',
  fridgeLine: '#B8E0D4',
  mint: '#7CC8B4',
  caution: '#FFE58A', // 유통기한은 지났지만 먹을 수 있는 기한 전
  soon: '#FFC48A', // 먹을 수 있는 기한 2일 전부터
  over: '#F59A9A', // 먹을 수 있는 기한이 지남
};

type Place = '냉장' | '냉동' | '실온';
type Item = {
  name: string;
  id?: string;
  category?: Category;
  box?: number;
  photo?: string; // a photo the user took; it replaces the drawing everywhere
  place: Place;
  daysLeft: number; // until the date it is safe to eat (먹을 수 있는 기한)
  pastSellBy?: boolean; // 유통기한이 지남
};

const ITEMS: Item[] = [
  { name: '두부', id: 'tofu', place: '냉장', daysLeft: 1 },
  { name: '우유', id: 'milk', place: '냉장', daysLeft: 3, pastSellBy: true },
  { name: '버섯', id: 'mushroom', place: '냉장', daysLeft: -1 },
  { name: '대파', id: 'greenOnion', place: '냉장', daysLeft: 5 },
  { name: '계란', id: 'egg', place: '냉장', daysLeft: 12 },
  { name: '김치', id: 'kimchi', place: '냉장', daysLeft: 20 },
  { name: '다짐육', box: 1, place: '냉동', daysLeft: 25 },
  { name: '밥', id: 'rice', place: '냉동', daysLeft: 28 },
  { name: '감자', id: 'potato', place: '실온', daysLeft: 9 },
  { name: '양파', id: 'onion', place: '실온', daysLeft: 14 },
];

// Tapping a compartment and speaking puts everything said into that compartment, so the place need not be said.
const ROOM: Record<Place, string> = { 냉장: '냉장실', 냉동: '냉동실', 실온: '실온 칸' };

function badge(it: Item): { label: string; color: string } | null {
  if (it.daysLeft < 0) return { label: '먹지 마세요', color: C.over };
  if (it.daysLeft <= 2) return { label: it.daysLeft === 0 ? '오늘까지' : `D-${it.daysLeft}`, color: C.soon };
  if (it.pastSellBy) return { label: '주의', color: C.caution };
  return null;
}

function param(key: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(key);
}
function screenFromUrl() {
  return param('screen') ?? 'home';
}

export default function App() {
  const screen = screenFromUrl();
  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      {screen === 'voice' ? <VoiceScreen /> : screen === 'art' ? <ArtScreen /> : <HomeScreen />}
    </View>
  );
}

function HomeScreen() {
  const [place, setPlace] = useState<Place>('냉장');
  const shown = ITEMS.filter((i) => i.place === place).sort((a, b) => a.daysLeft - b.daysLeft);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.header}>
          <Text style={s.title}>냉장곰</Text>
          <Text style={s.sub}>오늘도 남김없이</Text>
        </View>

        <View style={s.bearRow}>
          <Character face="🐻" size={86} apron pose="wave" mood="happy" />
          <View style={s.bubble}>
            <Text style={s.bubbleText}>두부가 내일까지예요!{'\n'}오늘은 두부조림 어때요?</Text>
          </View>
        </View>

        <View style={s.tabs}>
          {(['냉장', '냉동', '실온'] as Place[]).map((p) => (
            <Pressable key={p} onPress={() => setPlace(p)} style={[s.tab, place === p && s.tabOn]}>
              <Text style={[s.tabText, place === p && s.tabTextOn]}>
                {p} {ITEMS.filter((i) => i.place === p).length}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={s.fridge}>
          <View style={s.fridgeTop}>
            <Pressable style={s.fridgeMic}>
              <Text style={s.fridgeMicText}>🎙 {ROOM[place]}에 말로 넣기</Text>
            </Pressable>
          </View>
          {shown.map((it) => {
            const b = badge(it);
            return (
              <View key={it.name} style={s.cell}>
                <View style={s.icon}>
                  <Thumb item={it} size={56} />
                </View>
                <Text style={s.name}>{it.name}</Text>
                {b ? (
                  <View style={[s.badge, { backgroundColor: b.color }]}>
                    <Text style={s.badgeText}>{b.label}</Text>
                  </View>
                ) : (
                  <Text style={s.days}>{it.daysLeft}일 남음</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={s.legend}>
          <Legend color={C.caution} text="유통기한 지남, 먹을 수 있는 기한 전" />
          <Legend color={C.soon} text="먹을 수 있는 기한 2일 전부터" />
          <Legend color={C.over} text="먹을 수 있는 기한 지남" />
        </View>

        <Text style={s.section}>오늘의 냉털</Text>
        <View style={s.recipe}>
          <View style={s.recipeIcons}>
            <Ingredient id="tofu" size={34} />
            <Ingredient id="greenOnion" size={34} />
            <Ingredient id="onion" size={34} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.recipeName}>두부조림</Text>
            <Text style={s.recipeMeta}>재료 다 있어요 · 20분</Text>
            <Text style={s.recipeSub}>고춧가루가 없으면 고추장 반 숟갈로 바꿔도 돼요</Text>
          </View>
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={s.dock}>
        <Pressable style={[s.dockBtn, s.dockSmall]}>
          <Text style={s.dockSmallText}>📷 통 추가</Text>
        </Pressable>
        <Pressable style={[s.dockBtn, s.mic]}>
          <Text style={s.micText}>🎙 말로 넣기</Text>
        </Pressable>
      </View>
    </View>
  );
}

// The user's own photo wins over any drawing; then a numbered box, then the ingredient drawing.
function Thumb({ item, size }: { item: Item; size: number }) {
  if (item.photo) return <Image source={{ uri: item.photo }} style={{ width: size + 12, height: size + 12, borderRadius: 18 }} />;
  if (item.box != null) return <BoxIcon n={item.box} size={size} />;
  return <Ingredient id={item.id} category={item.category} size={size} />;
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={s.legendRow}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{text}</Text>
    </View>
  );
}

const HEARD = '두부 오늘 넣었고 소비기한 11월 5일, 대파 3일 전에 샀어, 우유 유통기한 10월 30일';
const PARSED = [
  { id: 'tofu', name: '두부', place: '냉장', put: '10월 27일 (오늘)', until: '11월 5일', note: '말한 소비기한' },
  { id: 'greenOnion', name: '대파', place: '냉장', put: '10월 24일 (3일 전)', until: '10월 31일', note: '대파 기본값 7일' },
  { id: 'milk', name: '우유', place: '냉장', put: '10월 27일 (오늘)', until: '10월 30일', note: '우유는 유통기한 그대로 (늘리지 않음)' },
];

function VoiceScreen() {
  const room = param('place') as Place | null;
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.bearRow}>
        <Character face="🐻" size={70} apron pose="hold" />
        <View style={s.bubble}>
          <Text style={s.bubbleText}>
            {room ? `${ROOM[room]}에 넣을게요.` : '이렇게 들었어요.'}{'\n'}틀린 곳만 눌러서 고쳐 주세요!
          </Text>
        </View>
      </View>
      <View style={s.heard}>
        <Text style={s.heardText}>“{HEARD}”</Text>
      </View>
      {PARSED.map((p) => (
        <View key={p.name} style={s.row}>
          <Ingredient id={p.id} size={48} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={s.rowName}>{p.name}</Text>
              <View style={s.placeChip}>
                <Text style={s.placeText}>{room ?? p.place}</Text>
              </View>
            </View>
            <Text style={s.rowLine}>넣은 날 {p.put}</Text>
            <Text style={s.rowLine}>
              먹을 수 있는 기한 <Text style={{ fontWeight: '700', color: C.ink }}>{p.until}</Text>
            </Text>
            <Text style={s.rowNote}>{p.note}</Text>
          </View>
        </View>
      ))}
      <View style={s.voiceBtns}>
        <Pressable style={[s.dockBtn, s.dockSmall, { flex: 1 }]}>
          <Text style={s.dockSmallText}>다시 말하기</Text>
        </Pressable>
        <Pressable style={[s.dockBtn, s.mic, { flex: 1 }]}>
          <Text style={s.micText}>냉장고에 넣기</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
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
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>재료 그림 시안</Text>
      <Text style={[s.sub, { marginBottom: 14 }]}>그림이 없는 재료는 종류별 기본 그림으로 나와요</Text>
      <View style={s.fridge}>
        {ART_LIST.map((a) => (
          <View key={a.name} style={s.cell}>
            <View style={s.icon}>
              {a.box ? <BoxIcon n={3} size={64} /> : <Ingredient id={a.id} category={a.category} size={64} />}
            </View>
            <Text style={s.name}>{a.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  page: { padding: 18, paddingTop: 48 },
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
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3E9DC' },
  tabOn: { backgroundColor: C.mint },
  tabText: { fontSize: 15, color: C.soft, fontWeight: '700' },
  tabTextOn: { color: '#FFFFFF' },
  fridge: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.fridge, borderRadius: 24, padding: 8,
    borderWidth: 3, borderColor: C.fridgeLine,
  },
  fridgeTop: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 6, paddingTop: 2 },
  fridgeMic: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
  },
  fridgeMicText: { fontSize: 13, fontWeight: '700', color: '#4E9C88' },
  cell: { width: '33.33%', alignItems: 'center', paddingVertical: 10 },
  icon: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  name: { marginTop: 6, fontSize: 15, fontWeight: '700', color: C.ink },
  days: { marginTop: 3, fontSize: 12, color: C.soft },
  badge: { marginTop: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '800', color: C.ink },
  legend: { marginTop: 10, gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: C.soft },
  section: { marginTop: 20, marginBottom: 8, fontSize: 18, fontWeight: '800', color: C.ink },
  recipe: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 20, padding: 12, gap: 10 },
  recipeIcons: { flexDirection: 'row', width: 102 },
  recipeName: { fontSize: 17, fontWeight: '800', color: C.ink },
  recipeMeta: { fontSize: 13, color: C.mint, fontWeight: '700', marginTop: 2 },
  recipeSub: { fontSize: 12, color: C.soft, marginTop: 4 },
  dock: { position: 'absolute', left: 16, right: 16, bottom: 24, flexDirection: 'row', gap: 10 },
  dockBtn: { borderRadius: 26, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  dockSmall: { paddingHorizontal: 18, backgroundColor: C.card, borderWidth: 2, borderColor: C.fridgeLine },
  dockSmallText: { fontSize: 15, fontWeight: '700', color: C.ink },
  mic: { flex: 1, backgroundColor: C.mint },
  micText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  heard: { marginTop: 14, backgroundColor: '#F3E9DC', borderRadius: 16, padding: 14 },
  heardText: { fontSize: 15, lineHeight: 22, color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 18, padding: 12, marginTop: 10 },
  rowName: { fontSize: 17, fontWeight: '800', color: C.ink },
  placeChip: { backgroundColor: C.fridge, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  placeText: { fontSize: 12, fontWeight: '700', color: '#4E9C88' },
  rowLine: { fontSize: 14, color: C.soft, marginTop: 2 },
  rowNote: { fontSize: 12, color: C.mint, marginTop: 2, fontWeight: '600' },
  voiceBtns: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
