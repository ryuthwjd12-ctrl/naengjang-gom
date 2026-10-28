// One recipe: what it needs against what is in the fridge (있어요 / 대신 / 없어요), the seasoning, and the steps.

import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { findFood } from './foods';
import { Ingredient } from './Ingredients';
import type { Match, Stock } from './recommend';
import { removeMine, toggleSaved } from './recipeStore';
import type { FullRecipe } from './recipes';
import { Button, C } from './ui';

export function RecipeSheet({ match, stock, onClose, onEdit }: { match: Match | null; stock: Stock[]; onClose: () => void; onEdit: (r: FullRecipe) => void }) {
  if (!match) return null;
  const r = match.recipe as FullRecipe;
  const swapped = new Map(match.swaps.map((s) => [s.need, s.use]));
  const daysOf = (name: string) => stock.filter((s) => s.name === name && s.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft)[0]?.daysLeft;

  function remove() {
    const go = () => {
      removeMine(r.id);
      onClose();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`${r.name} 레시피를 지울까요?`)) go();
    } else Alert.alert('레시피 지우기', `${r.name} 레시피를 지울까요?`, [{ text: '아니요', style: 'cancel' }, { text: '지우기', style: 'destructive', onPress: go }]);
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={st.sheet}>
        <View style={st.top}>
          <Pressable hitSlop={10} onPress={() => toggleSaved(r.id)}>
            <Text style={[st.heart, r.saved && { color: '#F08CA0' }]}>{r.saved ? '♥ 저장함' : '♡ 저장'}</Text>
          </Pressable>
          <Pressable hitSlop={10} onPress={onClose}>
            <Text style={st.close}>닫기</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={st.title}>{r.name}</Text>
          <Text style={st.meta}>
            ⏱ {r.minutes}분 · 1인분{r.mine ? ' · 내 레시피' : ''}
          </Text>

          <Text style={st.field}>재료</Text>
          {r.ingredients.map((n) => {
            const use = swapped.get(n);
            const miss = match.missing.includes(n);
            const food = findFood(use ?? n);
            const days = daysOf(use ?? n);
            return (
              <View key={n} style={st.row}>
                <Ingredient id={food?.art ?? food?.id} category={food?.category} size={36} />
                <Text style={[st.rowName, miss && { color: C.soft }]}>{n}</Text>
                <Text style={[st.state, miss ? st.stateMiss : use ? st.stateSwap : st.stateHave]}>
                  {miss ? '없어요' : use ? `${use}로 대신` : days != null && days <= 5 ? (days === 0 ? '오늘까지' : `D-${days}`) : '있어요'}
                </Text>
              </View>
            );
          })}
          {r.pantry.length > 0 && <Text style={st.pantry}>양념: {r.pantry.join(', ')}</Text>}

          <Text style={st.field}>만드는 법</Text>
          {r.steps.map((s, i) => (
            <View key={i} style={st.step}>
              <Text style={st.stepN}>{i + 1}</Text>
              <Text style={st.stepText}>{s}</Text>
            </View>
          ))}

          {r.mine && (
            <View style={st.endRow}>
              <Button label="고치기" kind="plain" onPress={() => onEdit(r)} style={{ flex: 1 }} />
              <Button label="지우기" kind="danger" onPress={remove} style={{ flex: 1 }} />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heart: { fontSize: 16, fontWeight: '800', color: C.soft },
  close: { fontSize: 16, fontWeight: '700', color: C.soft },
  title: { marginTop: 12, fontSize: 26, fontWeight: '800', color: C.ink },
  meta: { marginTop: 4, fontSize: 13, color: C.soft },
  field: { marginTop: 20, marginBottom: 6, fontSize: 14, fontWeight: '800', color: C.soft },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 8, marginBottom: 6, gap: 10 },
  rowName: { flex: 1, fontSize: 16, fontWeight: '700', color: C.ink },
  state: { fontSize: 12, fontWeight: '800', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  stateHave: { backgroundColor: '#DDF2EC', color: C.mintInk },
  stateSwap: { backgroundColor: C.week, color: C.ink },
  stateMiss: { backgroundColor: C.chip, color: C.soft },
  pantry: { marginTop: 4, fontSize: 13, color: C.soft },
  step: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stepN: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.mint, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, fontWeight: '800', overflow: 'hidden' },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22, color: C.ink },
  endRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
