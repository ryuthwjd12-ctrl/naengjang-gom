// Adding things, two ways: say it (or type it the way you'd say it), or pick drawings by hand. Then check the confirm cards.
// Nothing is saved until "냉장고에 넣기", and each card can be fixed with a tap.

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Character } from './Character';
import type { Category } from './Ingredients';
import { FOODS, QUICK, findFood, foodById, type Food, type Place } from './foods';
import { eatBy, newId, today, type DateKind, type Item } from './item';
import { parseSpeech } from './parse';
import { takePhoto } from './photo';
import { DrawingPicker } from './DrawingPicker';
import { pickDrawing, useDrawingFor } from './drawings';
import { useSpeech } from './speech';
import { addItems } from './store';
import { Button, C, Chip, DateStepper, Input, QtyStepper, PLACES, ROOM, Thumb, dateLabel } from './ui';

type Draft = Item & { heard?: string };

function fromFood(food: Food, place: Place | undefined, on: string): Draft {
  const p = place ?? food.place;
  return { id: newId(), name: food.name, foodId: food.id, category: food.category, place: p, placeSince: on, addedAt: on };
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'veg', label: '채소·과일' }, { id: 'meat', label: '고기' }, { id: 'fish', label: '생선·해물' },
  { id: 'dairy', label: '유제품' }, { id: 'sauce', label: '소스' }, { id: 'other', label: '기타' },
];

export type AddMode = 'voice' | 'pick';

export function AddSheet({ visible, place, mode: startMode = 'voice', onClose }: { visible: boolean; place?: Place; mode?: AddMode; onClose: () => void }) {
  const [mode, setMode] = useState<AddMode>(startMode);
  // Picking by hand is two steps: choose drawings, then check the cards.
  const [checking, setChecking] = useState(false);
  const [shownFor, setShownFor] = useState(visible);
  if (visible !== shownFor) {
    setShownFor(visible);
    if (visible) {
      setMode(startMode);
      setChecking(false);
    }
  }
  const [kind, setKind] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [other, setOther] = useState('');
  // What the last analysis heard, so the user can spot a word it skipped; `missed` when it found nothing at all.
  const [said, setSaid] = useState<{ text: string; missed: boolean } | null>(null);
  const on = today();

  const speech = useSpeech((t, final) => {
    setText(t);
    if (final) analyse(t);
  });

  function analyse(t = text) {
    const parsed = parseSpeech(t, { on, place });
    const add = parsed.map<Draft>((p) => ({
      ...fromFood(p.food, p.place, on),
      name: p.name,
      addedAt: p.addedAt,
      placeSince: p.addedAt,
      qty: p.qty,
      dateKind: p.dateKind,
      date: p.date,
      openedAt: p.opened ? p.addedAt : undefined,
      heard: p.heard,
    }));
    if (!t.trim()) return;
    setSaid({ text: t.trim(), missed: add.length === 0 });
    if (add.length === 0) return; // keep the words so the user can fix them
    setDrafts((d) => [...d, ...add]);
    setText('');
  }
  // A photo of something: it goes in with the photo instead of a drawing, and the user names it on its card.
  async function addPhoto() {
    const photo = await takePhoto();
    if (!photo) return;
    setDrafts((d) => [...d, { id: newId(), name: '', photo, category: 'other', place: place ?? '냉장', placeSince: on, addedAt: on }]);
    if (mode === 'pick') setChecking(true);
  }
  function addOther() {
    const name = other.trim();
    if (!name) return;
    const food = findFood(name);
    setDrafts((d) => [...d, food ? fromFood(food, place, on) : { id: newId(), name, category: 'other', place: place ?? '냉장', placeSince: on, addedAt: on }]);
    setOther('');
  }
  function save() {
    addItems(drafts.map(({ heard: _heard, ...item }) => ({ ...item, name: item.name.trim() || '이름 없는 재료', placeSince: item.place === '냉동' ? item.addedAt : item.placeSince })));
    close();
  }
  function close() {
    if (speech.listening) speech.stop();
    setDrafts([]);
    setText('');
    setSaid(null);
    setSearch('');
    setKind('all');
    setChecking(false);
    onClose();
  }
  // Tapping a drawing picks it; tapping it again takes it back out. How many goes on its card.
  const toggle = (food: Food) =>
    setDrafts((d) => (d.some((x) => x.foodId === food.id) ? d.filter((x) => x.foodId !== food.id) : [...d, fromFood(food, place, on)]));
  const showCards = mode === 'voice' || checking;
  const update = (id: string, patch: Partial<Draft>) => setDrafts((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={st.sheet}>
        <View style={st.top}>
          <Text style={st.title}>{place ? `${ROOM[place]}에 넣기` : '냉장고에 넣기'}</Text>
          <Pressable hitSlop={10} onPress={close}>
            <Text style={st.close}>닫기</Text>
          </Pressable>
        </View>
        <View style={st.modes}>
          <Chip label="🎙 말로" on={mode === 'voice'} onPress={() => setMode('voice')} style={st.mode} />
          <Chip
            label="✋ 골라서"
            on={mode === 'pick'}
            onPress={() => {
              setMode('pick');
              setChecking(false);
            }}
            style={st.mode}
          />
          <Chip label="📷 사진" onPress={addPhoto} style={st.mode} />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          {mode === 'voice' ? (
            <>
              <View style={st.bearRow}>
                <Character face="🐻" size={56} apron pose={speech.listening ? 'cheer' : 'stand'} mood={speech.listening ? 'happy' : 'normal'} />
                <View style={st.bubble}>
                  <Text style={st.bubbleText}>
                    {speech.listening ? '듣고 있어요!' : '산 날과 기한까지 말해 주면 알아서 적을게요.'}
                  </Text>
                  <Text style={st.example}>예: 두부 오늘 샀고 소비기한 11월 5일, 대파 3일 전에 샀어</Text>
                </View>
              </View>

              {speech.available && (
                <Pressable onPress={speech.listening ? speech.stop : speech.start} style={[st.mic, speech.listening && st.micOn]}>
                  <Text style={st.micText}>{speech.listening ? '■ 다 말했어요' : '🎙 눌러서 말하기'}</Text>
                </Pressable>
              )}
              {speech.error && <Text style={st.error}>{speech.error}</Text>}

              <View style={st.typeRow}>
                <Input
                  value={text}
                  onChangeText={setText}
                  placeholder={speech.available ? '말 대신 적어도 돼요' : '말하듯 적어 주세요'}
                  placeholderTextColor={C.soft}
                  style={st.input}
                  multiline
                  onSubmitEditing={() => analyse()}
                />
                <Button label="적기" onPress={() => analyse()} style={{ paddingVertical: 10 }} />
              </View>
              {said && (
                <Text style={said.missed ? st.error : st.saidText}>
                  {said.missed
                    ? '아는 재료를 못 찾았어요. 모르는 재료면 아래 "다른 재료"에 이름을 적어 주세요.'
                    : `들은 말: “${said.text}” 빠진 재료가 있으면 아래에서 더해 주세요.`}
                </Text>
              )}

              <Text style={st.label}>자주 사는 것</Text>
              <View style={st.quick}>
                {QUICK.map((id) => {
                  const food = foodById(id)!;
                  return (
                    <Pressable key={id} onPress={() => toggle(food)} style={st.quickItem}>
                      <View style={[st.quickIcon, drafts.some((d) => d.foodId === id) && st.pickOn]}>
                        <Thumb item={{ foodId: id, category: food.category }} size={40} />
                      </View>
                      <Text style={st.quickName}>{food.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : checking ? (
            <Pressable onPress={() => setChecking(false)} hitSlop={8}>
              <Text style={st.back}>‹ 더 고르기</Text>
            </Pressable>
          ) : (
            <>
              <Input value={search} onChangeText={setSearch} placeholder="🔍 재료 찾기" placeholderTextColor={C.soft} style={[st.input, { flex: 0 }]} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.kinds}>
                <Chip small label="전체" on={kind === 'all'} onPress={() => setKind('all')} />
                {CATEGORIES.map((c) => (
                  <Chip key={c.id} small label={c.label} on={kind === c.id} onPress={() => setKind(c.id)} />
                ))}
              </ScrollView>
              <View style={[st.quick, { marginTop: 8 }]}>
                {FOODS.filter((f) => (kind === 'all' || f.category === kind) && (!search.trim() || [f.name, ...(f.aliases ?? [])].some((n) => n.includes(search.trim())))).map((food) => {
                  const picked = drafts.some((d) => d.foodId === food.id);
                  return (
                    <Pressable key={food.id} onPress={() => toggle(food)} style={st.quickItem}>
                      <View style={[st.pickIcon, picked && st.pickOn]}>
                        <Thumb item={{ foodId: food.id, category: food.category }} size={44} />
                        {picked && <Text style={st.pickCount}>✓</Text>}
                      </View>
                      <Text style={st.quickName}>{food.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={st.saidText}>목록에 없으면 이름을 적거나 📷 사진으로 넣어 주세요.</Text>
            </>
          )}
          {!checking && (
            <View style={st.typeRow}>
              <Input value={other} onChangeText={setOther} placeholder="다른 재료 이름" style={st.input} onSubmitEditing={addOther} />
              <Button label="추가" kind="plain" onPress={addOther} style={{ paddingVertical: 10 }} />
            </View>
          )}

          {showCards && drafts.length > 0 && <Text style={st.label}>이렇게 넣을게요. 틀린 곳만 고쳐 주세요</Text>}
          {showCards && drafts.map((d) => (
            <DraftCard key={d.id} d={d} update={(p) => update(d.id, p)} remove={() => setDrafts((x) => x.filter((y) => y.id !== d.id))} />
          ))}
        </ScrollView>
        {drafts.length > 0 && (
          <View style={st.footer}>
            {showCards ? (
              <Button label={`${saveTo(drafts)}에 넣기 (${drafts.length})`} onPress={save} style={{ flex: 1 }} />
            ) : (
              <Button label={`${drafts.length}개 골랐어요 · 다음`} onPress={() => setChecking(true)} style={{ flex: 1 }} />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

// Where the save button says things go: one compartment if they all go there, else the fridge.
function saveTo(drafts: Draft[]) {
  const places = new Set(drafts.map((d) => d.place));
  return places.size === 1 ? ROOM[[...places][0]] : '냉장고';
}

function DraftCard({ d, update, remove }: { d: Draft; update: (p: Partial<Draft>) => void; remove: () => void }) {
  const known = !!d.foodId;
  const by = eatBy(d);
  const canDraw = !known && !d.photo && d.box == null;
  const [drawing, setDrawing] = useState(false);
  const picked = useDrawingFor(canDraw ? d.name : undefined);
  return (
    <View style={st.card}>
      <View style={st.cardTop}>
        <Pressable disabled={!canDraw || !d.name.trim()} onPress={() => setDrawing(true)}>
          <Thumb item={d} size={48} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          {d.photo || !known ? (
            <Input
              value={d.name}
              onChangeText={(name) => {
                const food = findFood(name);
                update(food ? { name, foodId: food.id, category: food.category } : { name, foodId: undefined });
              }}
              placeholder="이름 (예: 카레, 2번 반찬)"
              style={st.nameInput}
            />
          ) : (
            <Text style={st.name}>{d.name}</Text>
          )}
          {d.heard && <Text style={st.heard}>“{d.heard}”</Text>}
        </View>
        <Pressable hitSlop={10} onPress={remove}>
          <Text style={st.remove}>✕</Text>
        </Pressable>
      </View>
      {canDraw && (
        <View style={st.chips}>
          {d.name.trim() ? (
            <Chip small label={picked ? '🎨 그림 바꾸기' : '🎨 닮은 그림 고르기'} onPress={() => setDrawing(true)} />
          ) : (
            <Text style={st.why}>이름을 적으면 닮은 그림을 고를 수 있어요.</Text>
          )}
        </View>
      )}
      {drawing && <DrawingPicker name={d.name.trim()} category={d.category} current={picked} onPick={(id) => pickDrawing(d.name, id)} onClose={() => setDrawing(false)} />}
      <View style={st.chips}>
        {PLACES.map((p) => (
          <Chip key={p} small label={p} on={d.place === p} onPress={() => update({ place: p })} />
        ))}
      </View>
      {!known && (
        <View style={st.chips}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} small label={c.label} on={d.category === c.id} onPress={() => update({ category: c.id })} />
          ))}
        </View>
      )}
      <Text style={st.field}>개수</Text>
      <QtyStepper qty={d.qty} onChange={(qty) => update({ qty })} />
      <Text style={st.field}>산 날 / 넣은 날</Text>
      <DateStepper value={d.addedAt} max={today()} onChange={(v) => update({ addedAt: v, placeSince: v })} />
      <Text style={st.field}>포장에 적힌 날짜</Text>
      <View style={st.chips}>
        {(['소비기한', '유통기한'] as DateKind[]).map((k) => (
          <Chip key={k} small label={k} on={d.dateKind === k} onPress={() => update({ dateKind: k, date: d.date ?? today() })} />
        ))}
        <Chip small label="없음" on={!d.dateKind} onPress={() => update({ dateKind: undefined, date: undefined })} />
      </View>
      {d.date && <DateStepper value={d.date} onChange={(v) => update({ date: v })} />}
      <View style={[st.chips, { marginTop: 8 }]}>
        <Chip small label={d.openedAt ? '개봉함 ✓' : '개봉 안 함'} on={!!d.openedAt} onPress={() => update({ openedAt: d.openedAt ? undefined : d.addedAt })} />
      </View>
      <Text style={st.eat}>
        먹을 수 있는 기한 <Text style={{ color: C.ink, fontWeight: '800' }}>{dateLabel(by.date)}</Text>
      </Text>
      <Text style={st.why}>{by.why}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 18 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', color: C.ink },
  close: { fontSize: 16, fontWeight: '700', color: C.soft },
  bearRow: { flexDirection: 'row', alignItems: 'center' },
  bubble: { flex: 1, marginLeft: 6, backgroundColor: C.card, borderRadius: 16, padding: 12 },
  bubbleText: { fontSize: 15, fontWeight: '700', color: C.ink },
  example: { marginTop: 4, fontSize: 12, color: C.soft },
  mic: { marginTop: 12, backgroundColor: C.mint, borderRadius: 26, paddingVertical: 16, alignItems: 'center' },
  micOn: { backgroundColor: '#F59A7E' },
  micText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  error: { marginTop: 8, color: '#D06A5A', fontWeight: '700' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  input: { flex: 1, minHeight: 44, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.ink, borderWidth: 1, borderColor: C.line },
  label: { marginTop: 18, marginBottom: 6, fontSize: 15, fontWeight: '800', color: C.ink },
  quick: { flexDirection: 'row', flexWrap: 'wrap' },
  quickItem: { width: '25%', alignItems: 'center', paddingVertical: 6 },
  modes: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  mode: { flex: 1, paddingHorizontal: 6 },
  pickIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 2, borderColor: 'transparent' },
  pickOn: { borderColor: C.mint },
  back: { fontSize: 15, fontWeight: '800', color: C.mintInk, paddingVertical: 4 },
  kinds: { gap: 6, paddingVertical: 8 },
  nameInput: { fontSize: 17, fontWeight: '800', color: C.ink, backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: C.line },
  quickIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  pickCount: { position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.mint, color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 20, overflow: 'hidden' },
  quickName: { fontSize: 12, fontWeight: '700', color: C.ink, marginTop: 2 },
  card: { backgroundColor: C.card, borderRadius: 18, padding: 12, marginTop: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '800', color: C.ink },
  qty: { fontSize: 13, fontWeight: '700', color: C.soft },
  saidText: { fontSize: 12, color: C.soft, marginTop: 6 },
  heard: { fontSize: 12, color: C.soft, marginTop: 2 },
  remove: { fontSize: 18, color: C.soft, paddingHorizontal: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  field: { marginTop: 10, marginBottom: 4, fontSize: 12, fontWeight: '700', color: C.soft },
  eat: { marginTop: 10, fontSize: 14, color: C.soft },
  why: { fontSize: 12, color: C.mintInk, fontWeight: '600', marginTop: 2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 28, backgroundColor: C.bg },
});

