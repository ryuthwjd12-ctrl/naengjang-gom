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
  // Never write before the saved fridge is read, or a quick first tap would wipe it.
  if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
}

let loading: Promise<Item[]> | null = null;
export function load() {
  loading ??= (async () => {
    let saved: Item[] = [];
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    // Anything added while reading goes on top of what was saved.
    const added = items.filter((i) => !saved.some((s) => s.id === i.id));
    items = [...saved, ...added];
    loaded = true;
    emit();
    return items;
  })();
  return loading;
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
// Only the file name is saved: on iPhone the documents folder's full path changes with each app update.
// On the web (design previews only) the picker's URI is kept as is.
export function keepPhoto(uri: string): string {
  if (Platform.OS === 'web') return uri;
  const { File, Paths } = require('expo-file-system');
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const name = `photo-${Date.now()}.${ext}`;
  new File(uri).copySync(new File(Paths.document, name));
  return name;
}
// Where a saved photo is now; full URIs (web, or anything older) are used as they are.
export function photoUri(photo: string): string {
  if (Platform.OS === 'web' || photo.includes(':')) return photo;
  const { File, Paths } = require('expo-file-system');
  return new File(Paths.document, photo).uri;
}
function removePhoto(photo: string) {
  if (Platform.OS === 'web') return;
  try {
    const { File } = require('expo-file-system');
    const f = new File(photoUri(photo));
    if (f.exists) f.delete();
  } catch {}
}
