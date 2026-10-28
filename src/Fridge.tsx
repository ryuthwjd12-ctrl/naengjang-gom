// The fridge on the home screen, drawn as a fridge: a body with a door handle, a magnet and little feet, and shelves
// inside holding three things each. The freezer is frosty blue and the room-temperature shelf a wooden cupboard.
// The buttons on top add things to that compartment, by voice or by picking drawings.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Place } from './foods';
import { C, ROOM } from './ui';

const LOOK: Record<Place, { body: string; line: string; inside: string; shelf: string; shelfEdge: string; handle: string }> = {
  냉장: { body: '#FFFFFF', line: C.fridgeLine, inside: C.fridge, shelf: '#F4FBF9', shelfEdge: '#BFE3D8', handle: '#B8E0D4' },
  냉동: { body: '#FFFFFF', line: '#BCD9EE', inside: '#E2F1FB', shelf: '#F7FBFF', shelfEdge: '#C4DDF0', handle: '#BCD9EE' },
  실온: { body: '#F6E3C6', line: '#E0C49C', inside: '#FFF4E2', shelf: '#E9CFA6', shelfEdge: '#D2B184', handle: '#D9B98C' },
};
const PER_SHELF = 3;
const MIN_SHELVES = 2;

export function Fridge({ place, onSpeak, onPick, empty, children }: { place: Place; onSpeak: () => void; onPick: () => void; empty?: string; children: ReactNode[] }) {
  const look = LOOK[place];
  const shelves: ReactNode[][] = [];
  for (let i = 0; i < children.length; i += PER_SHELF) shelves.push(children.slice(i, i + PER_SHELF));
  while (shelves.length < MIN_SHELVES) shelves.push([]);

  return (
    <View>
      <View style={[st.body, { backgroundColor: look.body, borderColor: look.line }]}>
        <View style={st.top}>
          <View style={[st.handle, { backgroundColor: look.handle }]} />
          <View style={[st.magnet, { borderColor: look.line }]}>
            <Text style={st.magnetText}>{place === '냉동' ? '❄' : place === '실온' ? '🧺' : '♥'}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onPick} style={[st.mic, { borderColor: look.line }]}>
            <Text style={st.micText}>✋ 골라서</Text>
          </Pressable>
          <Pressable onPress={onSpeak} style={[st.mic, { borderColor: look.line }]}>
            <Text style={st.micText}>🎙 {ROOM[place]}에 말로</Text>
          </Pressable>
        </View>
        <View style={[st.inside, { backgroundColor: look.inside, borderColor: look.line }]}>
          {place === '냉장' && <View style={st.light} />}
          {place === '냉동' && <Text style={st.frost}>❄ ❅ ❄</Text>}
          {shelves.map((row, n) => (
            <View key={n}>
              <View style={st.row}>
                {row}
                {n === 0 && row.length === 0 && empty ? <Text style={st.empty}>{empty}</Text> : null}
              </View>
              <View style={[st.shelf, { backgroundColor: look.shelf, borderBottomColor: look.shelfEdge }]} />
            </View>
          ))}
        </View>
      </View>
      <View style={st.feet}>
        <View style={[st.foot, { backgroundColor: look.line }]} />
        <View style={[st.foot, { backgroundColor: look.line }]} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  body: { borderRadius: 28, borderWidth: 3, padding: 10, paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, minHeight: 32 },
  handle: { width: 46, height: 8, borderRadius: 4 },
  magnet: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, backgroundColor: '#FFE3E8', alignItems: 'center', justifyContent: 'center' },
  magnetText: { fontSize: 12, color: '#F08CA0', lineHeight: 16 },
  mic: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 2, paddingHorizontal: 10, paddingVertical: 5 },
  micText: { fontSize: 13, fontWeight: '700', color: C.mintInk },
  inside: { borderRadius: 20, borderWidth: 2, paddingHorizontal: 4, paddingTop: 8, paddingBottom: 10, overflow: 'hidden' },
  light: { position: 'absolute', top: 0, left: '30%', right: '30%', height: 6, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: '#FFF6C8' },
  frost: { position: 'absolute', top: 4, right: 10, fontSize: 12, color: '#A9CBE6', letterSpacing: 2 },
  row: { flexDirection: 'row', minHeight: 116, alignItems: 'flex-end' },
  shelf: { height: 9, marginHorizontal: 2, borderRadius: 4, borderBottomWidth: 3 },
  empty: { flex: 1, textAlign: 'center', alignSelf: 'center', color: C.soft, fontSize: 15 },
  feet: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 34 },
  foot: { width: 26, height: 9, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
});
