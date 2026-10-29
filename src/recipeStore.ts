// The user's own recipes and which recipes they saved (♥), on the phone like the fridge (see store.ts).

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RECIPES, type FullRecipe } from './recipes';

const KEY = 'naengjanggom.recipes.v1';

type State = { mine: FullRecipe[]; saved: string[] };
let state: State = { mine: [], saved: [] };
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<(s: State) => void>();

function emit() {
  for (const l of listeners) l(state);
  if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}
function load() {
  loading ??= (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const saved: State = JSON.parse(raw);
        state = { mine: [...saved.mine, ...state.mine.filter((r) => !saved.mine.some((m) => m.id === r.id))], saved: [...new Set([...saved.saved, ...state.saved])] };
      }
    } catch {}
    loaded = true;
    emit();
  })();
  return loading;
}

// Every recipe the app knows, with `saved` filled in: the user's own first, then the built-in ones.
export function useRecipes(): FullRecipe[] {
  const [s, set] = useState(state);
  useEffect(() => {
    listeners.add(set);
    load();
    return () => {
      listeners.delete(set);
    };
  }, []);
  return [...s.mine.map((r) => ({ ...r, mine: true })), ...RECIPES].map((r) => ({ ...r, saved: s.saved.includes(r.id) }));
}

export function toggleSaved(id: string) {
  state = { ...state, saved: state.saved.includes(id) ? state.saved.filter((x) => x !== id) : [...state.saved, id] };
  emit();
}
export function saveMine(recipe: FullRecipe) {
  const { saved: _saved, mine: _mine, ...r } = recipe;
  state = { ...state, mine: state.mine.some((m) => m.id === r.id) ? state.mine.map((m) => (m.id === r.id ? r : m)) : [r, ...state.mine] };
  emit();
}
export function removeMine(id: string) {
  state = { mine: state.mine.filter((m) => m.id !== id), saved: state.saved.filter((x) => x !== id) };
  emit();
}
