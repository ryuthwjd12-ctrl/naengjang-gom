// Making or fixing one of the user's own recipes: a name, ingredients picked from the dictionary (so they match the
// fridge), optional seasoning, and steps one per line.

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FOODS, findFood } from './foods';
import { Ingredient } from './Ingredients';
import { newId } from './item';
import { saveMine } from './recipeStore';
import type { FullRecipe } from './recipes';
import { Button, C, Chip, Input } from './ui';

const MINUTES = [5, 10, 15, 20, 30, 45];

export function RecipeForm({ recipe, onClose }: { recipe: FullRecipe | 'new' | null; onClose: () => void }) {
  if (!recipe) return null;
  return <Form key={recipe === 'new' ? 'new' : recipe.id} start={recipe === 'new' ? null : recipe} onClose={onClose} />;
}

function Form({ start, onClose }: { start: FullRecipe | null; onClose: () => void }) {
  const [name, setName] = useState(start?.name ?? '');
  const [minutes, setMinutes] = useState(start?.minutes ?? 15);
  const [ings, setIngs] = useState<string[]>(start?.ingredients ?? []);
  const [pantry, setPantry] = useState((start?.pantry ?? []).join(', '));
  const [steps, setSteps] = useState((start?.steps ?? []).join('\n'));
  const [find, setFind] = useState('');

  const q = find.trim();
  const hits = q ? FOODS.filter((f) => !ings.includes(f.name) && [f.name, ...(f.aliases ?? [])].some((n) => n.includes(q))).slice(0, 12) : [];
  const ok = name.trim() && ings.length > 0;

  function add(n: string) {
    setIngs((x) => (x.includes(n) ? x : [...x, n]));
    setFind('');
  }
  function save() {
    if (!ok) return;
    saveMine({
      id: start?.id ?? `mine-${newId()}`,
      name: name.trim(),
      minutes,
      ingredients: ings,
      pantry: pantry.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean),
      steps: steps.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={st.sheet}>
        <View style={st.top}>
          <Text style={st.title}>{start ? '내 레시피 고치기' : '내 레시피 만들기'}</Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Text style={st.close}>닫기</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <Text style={st.field}>요리 이름</Text>
          <Input value={name} onChangeText={setName} placeholder="예: 엄마표 감자조림" style={st.input} />

          <Text style={st.field}>걸리는 시간</Text>
          <View style={st.chips}>
            {MINUTES.map((m) => (
              <Chip key={m} small label={`${m}분`} on={minutes === m} onPress={() => setMinutes(m)} />
            ))}
          </View>

          <Text style={st.field}>재료 (냉장고와 맞춰 봐요)</Text>
          <View style={st.ings}>
            {ings.map((n) => {
              const f = findFood(n);
              return (
                <Pressable key={n} onPress={() => setIngs((x) => x.filter((y) => y !== n))} style={st.ing}>
                  <Ingredient id={f?.art ?? f?.id} category={f?.category} size={34} />
                  <Text style={st.ingName}>{n} ✕</Text>
                </Pressable>
              );
            })}
          </View>
          <Input value={find} onChangeText={setFind} placeholder="🔍 재료 찾기 (예: 감자)" style={st.input} />
          {hits.length > 0 && (
            <View style={st.chips}>
              {hits.map((f) => (
                <Chip key={f.id} small label={`＋ ${f.name}`} onPress={() => add(f.name)} />
              ))}
            </View>
          )}

          <Text style={st.field}>양념 (선택, 쉼표로 구분)</Text>
          <Input value={pantry} onChangeText={setPantry} placeholder="간장, 설탕, 참기름" style={st.input} />

          <Text style={st.field}>만드는 법 (한 줄에 하나씩)</Text>
          <Input value={steps} onChangeText={setSteps} placeholder={'감자를 깍둑썰어요.\n간장 2, 설탕 1에 졸여요.'} style={[st.input, { minHeight: 120, textAlignVertical: 'top' }]} multiline />
        </ScrollView>
        <View style={st.footer}>
          <Button label={ok ? '저장하기' : '이름과 재료를 넣어 주세요'} onPress={save} style={{ flex: 1, opacity: ok ? 1 : 0.5 }} />
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: C.ink },
  close: { fontSize: 16, fontWeight: '700', color: C.soft },
  field: { marginTop: 18, marginBottom: 6, fontSize: 13, fontWeight: '800', color: C.soft },
  input: { minHeight: 44, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.ink, borderWidth: 1, borderColor: C.line },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  ings: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  ing: { alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 6, minWidth: 60 },
  ingName: { fontSize: 11, fontWeight: '700', color: C.ink, marginTop: 2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 28, backgroundColor: C.bg, flexDirection: 'row' },
});
