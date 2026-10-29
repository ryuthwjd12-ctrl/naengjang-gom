// Drawings the user picked for things the dictionary doesn't know (e.g. "카레" → the stew pot), remembered by name
// so the next 카레 gets the same drawing. Kept on the phone like the fridge (see store.ts).

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'naengjanggom.drawings.v1';

type Picks = Record<string, string>; // name → dictionary food id whose drawing it uses
let picks: Picks = {};
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<(p: Picks) => void>();

function emit() {
  for (const l of listeners) l(picks);
  if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(picks)).catch(() => {});
}
function load() {
  loading ??= (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) picks = { ...JSON.parse(raw), ...picks };
    } catch {}
    loaded = true;
    emit();
  })();
  return loading;
}

const key = (name: string) => name.trim().replace(/\s+/g, ' ');

// The drawing picked for this name, if any.
export function useDrawingFor(name?: string): string | undefined {
  const [p, set] = useState(picks);
  useEffect(() => {
    listeners.add(set);
    load();
    return () => {
      listeners.delete(set);
    };
  }, []);
  return name ? p[key(name)] : undefined;
}

// Pick a drawing for a name, or take the pick back (undefined) to show the kind's default drawing again.
export function pickDrawing(name: string, foodId: string | undefined) {
  const k = key(name);
  if (!k) return;
  const { [k]: _old, ...rest } = picks;
  picks = foodId ? { ...rest, [k]: foodId } : rest;
  emit();
}
