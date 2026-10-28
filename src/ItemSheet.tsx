// One item up close: its photo (tap to take one; it replaces the drawing everywhere), where it is, its dates,
// and why its safe-to-eat date is what it is. Every change saves right away.

import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORIES } from './AddSheet';
import { findFood } from './foods';
import { eatBy, josa, level, moveTo, today, type DateKind, type Item } from './item';
import { keepPhoto, removeItem, updateItem } from './store';
import { Button, C, Chip, DateStepper, LevelBadge, PLACES, Thumb, dateLabel } from './ui';

export async function takePhoto(): Promise<string | null> {
  const camera = Platform.OS !== 'web' && (await ImagePicker.requestCameraPermissionsAsync()).granted;
  const res = camera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
  if (res.canceled || !res.assets[0]) return null;
  return keepPhoto(res.assets[0].uri);
}

function confirm(title: string, message: string, ok: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) ok();
    return;
  }
  Alert.alert(title, message, [{ text: '아니요', style: 'cancel' }, { text: '네', onPress: ok }]);
}

export function ItemSheet({ item, onClose }: { item: Item | null; onClose: () => void }) {
  if (!item) return null;
  const set = (patch: Partial<Item>) => updateItem({ ...item, ...patch });
  const by = eatBy(item);
  const { level: lv } = level(item);

  async function photo() {
    const uri = await takePhoto();
    if (uri) set({ photo: uri });
  }
  function rename(name: string) {
    const food = findFood(name);
    set(food ? { name, foodId: food.id, category: food.category } : { name, foodId: undefined });
  }
  function done(how: '다 먹었어요' | '버렸어요') {
    confirm(how, `${josa(item!.name, '을', '를')} 냉장고에서 뺄까요?`, () => {
      removeItem(item!.id);
      onClose();
    });
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={st.sheet}>
        <View style={st.top}>
          <View />
          <Pressable hitSlop={10} onPress={onClose}>
            <Text style={st.close}>닫기</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={photo} style={st.photo}>
              <Thumb item={item} size={item.photo ? 140 : 110} />
            </Pressable>
            <View style={st.photoBtns}>
              <Chip small label={item.photo ? '📷 다시 찍기' : '📷 사진 찍기'} onPress={photo} />
              {item.photo && <Chip small label="그림으로 돌아가기" onPress={() => set({ photo: undefined })} />}
            </View>
            <TextInput value={item.name} onChangeText={rename} style={st.name} />
            <LevelBadge item={item} />
          </View>

          <View style={[st.eatBox, lv === 'over' && { backgroundColor: '#FFE9E9' }]}>
            <Text style={st.eatLabel}>먹을 수 있는 기한</Text>
            <Text style={st.eatDate}>{dateLabel(by.date)}</Text>
            <Text style={st.why}>{by.why}</Text>
            <Text style={st.note}>냄새나 모양이 이상하면 날짜와 상관없이 버려 주세요.</Text>
          </View>

          <Text style={st.field}>있는 곳</Text>
          <View style={st.chips}>
            {PLACES.map((p) => (
              <Chip key={p} label={p} on={item.place === p} onPress={() => updateItem(moveTo(item, p))} />
            ))}
          </View>
          {item.place === '냉동' && <Text style={st.hint}>얼린 날: {dateLabel(item.placeSince)}</Text>}
          {item.thawedAt && <Text style={st.hint}>해동한 날: {dateLabel(item.thawedAt)}</Text>}

          {!item.foodId && (
            <>
              <Text style={st.field}>종류</Text>
              <View style={st.chips}>
                {CATEGORIES.map((c) => (
                  <Chip key={c.id} small label={c.label} on={item.category === c.id} onPress={() => set({ category: c.id })} />
                ))}
              </View>
            </>
          )}

          <Text style={st.field}>산 날 / 넣은 날</Text>
          <DateStepper value={item.addedAt} max={today()} onChange={(v) => set({ addedAt: v, placeSince: item.place === '냉동' ? item.placeSince : v })} />

          <Text style={st.field}>포장에 적힌 날짜</Text>
          <View style={st.chips}>
            {(['소비기한', '유통기한'] as DateKind[]).map((k) => (
              <Chip key={k} small label={k} on={item.dateKind === k} onPress={() => set({ dateKind: k, date: item.date ?? today() })} />
            ))}
            <Chip small label="없음" on={!item.dateKind} onPress={() => set({ dateKind: undefined, date: undefined })} />
          </View>
          {item.date && (
            <View style={{ marginTop: 8 }}>
              <DateStepper value={item.date} onChange={(v) => set({ date: v })} />
            </View>
          )}

          <Text style={st.field}>개봉·소분</Text>
          {item.openedAt ? (
            <>
              <DateStepper value={item.openedAt} max={today()} onChange={(v) => set({ openedAt: v })} />
              <View style={st.chips}>
                <Chip small label="개봉 안 했어요" onPress={() => set({ openedAt: undefined })} />
              </View>
            </>
          ) : (
            <View style={st.chips}>
              <Chip small label="오늘 개봉했어요" onPress={() => set({ openedAt: today() })} />
            </View>
          )}

          <Text style={st.field}>메모</Text>
          <TextInput
            value={item.note ?? ''}
            onChangeText={(note) => set({ note: note || undefined })}
            placeholder={item.box != null ? `${item.box}번 통에 든 것 (예: 다짐육 200g)` : '양, 들어간 것 등'}
            placeholderTextColor={C.soft}
            style={st.input}
            multiline
          />

          <View style={st.endRow}>
            <Button label="다 먹었어요" onPress={() => done('다 먹었어요')} style={{ flex: 1 }} />
            <Button label="버렸어요" kind="danger" onPress={() => done('버렸어요')} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  close: { fontSize: 16, fontWeight: '700', color: C.soft },
  photo: { width: 150, height: 150, borderRadius: 40, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  photoBtns: { flexDirection: 'row', gap: 6, marginTop: 8 },
  name: { marginTop: 8, fontSize: 24, fontWeight: '800', color: C.ink, textAlign: 'center', minWidth: 120 },
  eatBox: { marginTop: 16, backgroundColor: C.card, borderRadius: 18, padding: 14, alignItems: 'center' },
  eatLabel: { fontSize: 13, color: C.soft, fontWeight: '700' },
  eatDate: { fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 2 },
  why: { fontSize: 13, color: C.mintInk, fontWeight: '700', marginTop: 2 },
  note: { fontSize: 11, color: C.soft, marginTop: 6 },
  field: { marginTop: 16, marginBottom: 6, fontSize: 13, fontWeight: '800', color: C.soft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  hint: { marginTop: 6, fontSize: 12, color: C.soft },
  input: { minHeight: 44, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.ink, borderWidth: 1, borderColor: C.line },
  endRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
});

