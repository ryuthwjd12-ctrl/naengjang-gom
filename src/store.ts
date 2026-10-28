// Everything lives on the phone (no login): the fridge items in AsyncStorage, photos as files in the app's documents.

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Item } from './item';

const KEY = 'naengjanggom.items.v1';

let items: Item[] = [];
let loaded = false;
const listeners = new Set<(items: Item[]) => void>();

function emit() {
  for (const l of listeners) l(items);
  AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
}

export async function load() {
  if (loaded) return items;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {}
  loaded = true;
  for (const l of listeners) l(items);
  return items;
}

export function useItems(): [Item[], boolean] {
  const [state, setState] = useState(items);
  const [ready, setReady] = useState(loaded);
  useEffect(() => {
    const l = (next: Item[]) => {
      setState(next);
      setReady(true);
    };
    listeners.add(l);
    load();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [state, ready];
}

export function addItems(add: Item[]) {
  items = [...items, ...add];
  emit();
}
export function updateItem(next: Item) {
  const prev = items.find((i) => i.id === next.id);
  if (prev?.photo && prev.photo !== next.photo) removePhoto(prev.photo);
  items = items.map((i) => (i.id === next.id ? next : i));
  emit();
}
export function removeItem(id: string) {
  const prev = items.find((i) => i.id === id);
  if (prev?.photo) removePhoto(prev.photo);
  items = items.filter((i) => i.id !== id);
  emit();
}

// The next free number for a portioned box's sticker.
export function nextBoxNumber() {
  const used = new Set(items.map((i) => i.box).filter((n): n is number => n != null));
  let n = 1;
  while (used.has(n)) n++;
  return n;
}

// Photos: copied out of the picker's temporary file into the app's own documents so they survive.
// On the web (design previews only) the picker's URI is kept as is.
export function keepPhoto(uri: string): string {
  if (Platform.OS === 'web') return uri;
  const { File, Paths } = require('expo-file-system');
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = new File(Paths.document, `photo-${Date.now()}.${ext}`);
  new File(uri).copySync(dest);
  return dest.uri;
}
function removePhoto(uri: string) {
  if (Platform.OS === 'web') return;
  try {
    const { File } = require('expo-file-system');
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {}
}
