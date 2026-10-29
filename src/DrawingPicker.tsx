// Choosing a look-alike drawing for something the dictionary doesn't know. The choice is remembered by name.

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FOODS } from './foods';
import { Ingredient, type Category } from './Ingredients';
import { josa } from './item';
import { C, Input } from './ui';

export function DrawingPicker({ name, category, current, onPick, onClose }: { name: string; category: Category; current?: string; onPick: (foodId: string | undefined) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const q = search.trim();
  // The same kind first, so a sauce finds the bottles quickly.
  const foods = [...FOODS.filter((f) => f.category === category), ...FOODS.filter((f) => f.category !== category)].filter(
    (f) => !q || [f.name, ...(f.aliases ?? [])].some((n) => n.includes(q)),
  );
  const pick = (id: string | undefined) => {
    onPick(id);
    onClose();
  };
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={st.sheet}>
        <View style={st.top}>
          <Text style={st.title} numberOfLines={1}>
            {josa(name, '과', '와')} 닮은 그림
          </Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Text style={st.close}>닫기</Text>
          </Pressable>
        </View>
        <Text style={st.hint}>다음에 같은 이름을 넣어도 고른 그림이 나와요.</Text>
        <Input value={search} onChangeText={setSearch} placeholder="🔍 그림 찾기 (예: 소스, 통)" style={st.input} />
        <ScrollView contentContainerStyle={st.grid} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => pick(undefined)} style={st.cell}>
            <View style={[st.icon, !current && st.on]}>
              <Ingredient category={category} size={44} />
            </View>
            <Text style={st.name}>기본 그림</Text>
          </Pressable>
          {foods.map((f) => (
            <Pressable key={f.id} onPress={() => pick(f.id)} style={st.cell}>
              <View style={[st.icon, current === f.id && st.on]}>
                <Ingredient id={f.art ?? f.id} category={f.category} size={44} />
              </View>
              <Text style={st.name} numberOfLines={1}>
                {f.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: C.ink },
  close: { fontSize: 16, fontWeight: '700', color: C.soft },
  hint: { marginTop: 4, fontSize: 13, color: C.soft },
  input: { marginTop: 10, minHeight: 44, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 12, fontSize: 15, color: C.ink, borderWidth: 1, borderColor: C.line },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 8, paddingBottom: 60 },
  cell: { width: '25%', alignItems: 'center', paddingVertical: 6 },
  icon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 2, borderColor: 'transparent' },
  on: { borderColor: C.mint },
  name: { marginTop: 3, fontSize: 12, fontWeight: '700', color: C.ink, maxWidth: 70 },
});
