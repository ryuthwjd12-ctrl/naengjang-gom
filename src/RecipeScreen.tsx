// The recipe tab: what to cook from the fridge (추천), every recipe (전체), and the user's own and saved ones
// (내 레시피). Recommendation order is in recommend.ts; this screen only shows it.

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Character } from './Character';
import { foodById, findFood } from './foods';
import { josa, level, type Item } from './item';
import { recommend, type Match, type Stock } from './recommend';
import { RecipeForm } from './RecipeForm';
import { RecipeSheet } from './RecipeSheet';
import { toggleSaved, useRecipes } from './recipeStore';
import { SUBSTITUTES, type FullRecipe } from './recipes';
import { C, Chip, Input } from './ui';
import { Ingredient } from './Ingredients';

type Tab = '추천' | '전체' | '내 레시피';
type MineFilter = '전체' | '직접 만든' | '저장한';

// The fridge as the recommender sees it: dictionary names, and days left until the safe-to-eat date.
export function stockOf(items: Item[]): Stock[] {
  return items.map((i) => ({ name: foodById(i.foodId)?.name ?? i.name, daysLeft: level(i).daysLeft }));
}

// Every recipe matched against the fridge, without the "at most one missing" cut, for the 전체 and 내 레시피 lists.
export function matchAll(recipes: FullRecipe[], stock: Stock[]): Match[] {
  return recipes.map((r) => recommend([r], stock, SUBSTITUTES)[0] ?? { recipe: r, missing: r.ingredients.filter((n) => !stock.some((s) => s.name === n && s.daysLeft >= 0)), swaps: [], used: 0, urgentIn: null });
}

export function RecipeScreen({ items }: { items: Item[] }) {
  const recipes = useRecipes();
  const [tab, setTab] = useState<Tab>('추천');
  const [mineFilter, setMineFilter] = useState<MineFilter>('전체');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FullRecipe | 'new' | null>(null);

  const stock = useMemo(() => stockOf(items), [items]);
  const recommended = useMemo(() => recommend(recipes, stock, SUBSTITUTES) as Match[], [recipes, stock]);
  const all = useMemo(() => matchAll(recipes, stock), [recipes, stock]);

  const q = search.trim();
  const list: Match[] =
    tab === '추천'
      ? recommended
      : all
          .filter((m) => tab === '전체' || (mineFilter === '전체' ? m.recipe.mine || m.recipe.saved : mineFilter === '직접 만든' ? m.recipe.mine : m.recipe.saved))
          .filter((m) => !q || m.recipe.name.includes(q) || m.recipe.ingredients.some((n) => n.includes(q)))
          .sort((a, b) => a.missing.length - b.missing.length);

  const top = recommended[0];
  const urgentName = top?.urgentIn != null ? urgentIngredient(top, stock) : null;
  const say = !items.length
    ? '냉장고에 재료를 넣으면\n만들 수 있는 요리를 찾아 줄게요!'
    : urgentName
      ? `${josa(urgentName, '이', '가')} ${top.urgentIn === 0 ? '오늘까지' : `${top.urgentIn}일 남았어요`}!\n${top.recipe.name} 어때요?`
      : recommended.length
        ? `지금 재료로 ${recommended.length}가지\n만들 수 있어요!`
        : '딱 맞는 요리가 아직 없어요.\n전체에서 골라 볼까요?';

  const open = all.find((m) => m.recipe.id === openId) ?? null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.page} keyboardShouldPersistTaps="handled">
        <View style={st.bearRow}>
          <Character face="🐻" size={72} apron pose="hold" mood={urgentName ? 'normal' : 'happy'} />
          <View style={st.bubble}>
            <Text style={st.bubbleText}>{say}</Text>
          </View>
        </View>

        <View style={st.tabs}>
          {(['추천', '전체', '내 레시피'] as Tab[]).map((t) => (
            <Chip key={t} label={t} on={tab === t} onPress={() => setTab(t)} style={{ flex: 1, paddingHorizontal: 4 }} />
          ))}
        </View>

        {tab !== '추천' && <Input value={search} onChangeText={setSearch} placeholder="🔍 요리나 재료 이름" style={st.search} />}
        {tab === '내 레시피' && (
          <View style={st.filters}>
            {(['전체', '직접 만든', '저장한'] as MineFilter[]).map((f) => (
              <Chip key={f} small label={f} on={mineFilter === f} onPress={() => setMineFilter(f)} />
            ))}
            <View style={{ flex: 1 }} />
            <Chip small label="＋ 만들기" onPress={() => setEditing('new')} />
          </View>
        )}
        {tab === '추천' && items.length > 0 && <Text style={st.hint}>기한이 급한 재료를 쓰는 요리부터, 같으면 내 레시피부터 보여 줘요.</Text>}

        {list.map((m) => (
          <RecipeCard key={m.recipe.id} m={m} stock={stock} onPress={() => setOpenId(m.recipe.id)} />
        ))}
        {list.length === 0 && (
          <Text style={st.empty}>
            {tab === '내 레시피'
              ? mineFilter === '저장한'
                ? '♡를 눌러 저장한 레시피가 여기 모여요.'
                : '나만의 레시피를 만들어 보세요. 추천에도 먼저 나와요.'
              : tab === '추천' && items.length
                ? '재료가 하나만 모자란 요리까지 보여 주는데, 아직 없어요.'
                : tab === '추천'
                  ? '냉장고가 비어 있어요.'
                  : '찾는 요리가 없어요.'}
          </Text>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <RecipeSheet match={open} stock={stock} onClose={() => setOpenId(null)} onEdit={(r) => { setOpenId(null); setEditing(r); }} />
      <RecipeForm recipe={editing} onClose={() => setEditing(null)} />
    </View>
  );
}

// The most urgent fridge ingredient a recipe uses (to say "두부가 1일 남았어요").
function urgentIngredient(m: Match, stock: Stock[]) {
  const names = [...m.recipe.ingredients.filter((n) => !m.missing.includes(n)), ...m.swaps.map((s) => s.use)];
  const hits = stock.filter((s) => names.includes(s.name) && s.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);
  return hits[0]?.name ?? null;
}

function RecipeCard({ m, stock, onPress }: { m: Match; stock: Stock[]; onPress: () => void }) {
  const r = m.recipe as FullRecipe;
  const urgent = m.urgentIn != null ? urgentIngredient(m, stock) : null;
  const swapped = new Map(m.swaps.map((s) => [s.need, s.use]));
  return (
    <Pressable onPress={onPress} style={st.card}>
      <View style={st.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={st.name} numberOfLines={1}>
            {r.name}
          </Text>
          <Text style={st.meta}>
            ⏱ {r.minutes}분{r.mine ? ' · 내 레시피' : ''}
          </Text>
        </View>
        <Pressable hitSlop={10} onPress={() => toggleSaved(r.id)}>
          <Text style={[st.heart, r.saved && { color: '#F08CA0' }]}>{r.saved ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      <View style={st.ings}>
        {r.ingredients.map((n) => {
          const food = findFood(n);
          const miss = m.missing.includes(n);
          const use = swapped.get(n);
          const shown = use ? findFood(use) : food;
          return (
            <View key={n} style={[st.ing, miss && { opacity: 0.35 }]}>
              <Ingredient id={shown?.art ?? shown?.id} category={shown?.category} size={34} />
              <Text style={st.ingName} numberOfLines={1}>
                {use ?? n}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={st.tags}>
        {urgent && (
          <Text style={[st.tag, { backgroundColor: m.urgentIn! <= 2 ? C.soon : C.week }]}>
            {m.urgentIn === 0 ? `${urgent} 오늘까지` : `${urgent} D-${m.urgentIn}`}
          </Text>
        )}
        {m.missing.length === 0 ? <Text style={[st.tag, st.tagOk]}>재료 다 있어요</Text> : <Text style={st.tag}>없는 것: {m.missing.join(', ')}</Text>}
        {m.swaps.map((s) => (
          <Text key={s.need} style={st.tag}>
            {s.need} 대신 {s.use}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  page: { padding: 18, paddingTop: 12 },
  bearRow: { flexDirection: 'row', alignItems: 'center' },
  bubble: { flex: 1, marginLeft: 6, backgroundColor: C.card, borderRadius: 18, padding: 12 },
  bubbleText: { fontSize: 15, lineHeight: 21, color: C.ink, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 6, marginTop: 14 },
  search: { marginTop: 10, minHeight: 44, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 12, fontSize: 15, color: C.ink, borderWidth: 1, borderColor: C.line },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  hint: { marginTop: 10, fontSize: 12, color: C.soft },
  empty: { marginTop: 30, textAlign: 'center', color: C.soft, fontSize: 14, lineHeight: 20 },
  card: { marginTop: 12, backgroundColor: C.card, borderRadius: 20, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: '800', color: C.ink },
  meta: { marginTop: 2, fontSize: 12, color: C.soft },
  heart: { fontSize: 24, color: C.soft },
  ings: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 4 },
  ing: { width: 52, alignItems: 'center' },
  ingName: { fontSize: 11, color: C.ink, fontWeight: '700', marginTop: 2, maxWidth: 52 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { fontSize: 12, fontWeight: '700', color: C.ink, backgroundColor: C.chip, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  tagOk: { backgroundColor: '#DDF2EC', color: C.mintInk },
});
