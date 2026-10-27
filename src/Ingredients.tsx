import type { ReactElement } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect, Text } from 'react-native-svg';

// Ingredient drawings, all on a 100-unit square, in the same pastel chibi style as the bear (from 쿠키 타이머).
// Each one gets the same tiny face (Face) so the fridge reads as a shelf of little friends.
// Adding an ingredient: draw it in a 100x100 box, put its face where its "body" is widest, and add it to ART.
// Anything without its own drawing falls back to its category drawing (CATEGORY_ART).

const INK = '#5A4A48';
const BLUSH = '#F7B6BE';
const LINE = 'rgba(90,74,72,0.18)';

function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s * 1.25})`}>
      <Circle cx={-7} cy={0} r={2.6} fill={INK} />
      <Circle cx={7} cy={0} r={2.6} fill={INK} />
      <Circle cx={-6.2} cy={-0.9} r={0.9} fill="#FFFFFF" />
      <Circle cx={7.8} cy={-0.9} r={0.9} fill="#FFFFFF" />
      <Ellipse cx={-11.5} cy={4.5} rx={3.6} ry={2.2} fill={BLUSH} opacity={0.8} />
      <Ellipse cx={11.5} cy={4.5} rx={3.6} ry={2.2} fill={BLUSH} opacity={0.8} />
      <Path d="M-2.6 3.2 Q0 5.6 2.6 3.2" stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </G>
  );
}

const egg = (
  <G>
    <Ellipse cx={50} cy={56} rx={27} ry={33} fill="#FFF8EC" stroke="#EAD8C0" strokeWidth={2} />
    <Ellipse cx={40} cy={40} rx={6} ry={9} fill="#FFFFFF" opacity={0.9} />
    <Face x={50} y={62} />
  </G>
);

const tofu = (
  <G>
    <Rect x={18} y={30} width={64} height={52} rx={12} fill="#FFFDF6" stroke="#EADFCB" strokeWidth={2} />
    <Path d="M24 36 H76" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
    <Rect x={18} y={70} width={64} height={12} rx={6} fill="#F4EBDA" />
    <Face x={50} y={54} />
  </G>
);

const greenOnion = (
  <G>
    <Path d="M44 16 Q36 30 40 50" stroke="#8FD18B" strokeWidth={9} fill="none" strokeLinecap="round" />
    <Path d="M56 12 Q64 28 60 50" stroke="#A6DD9C" strokeWidth={9} fill="none" strokeLinecap="round" />
    <Rect x={36} y={44} width={28} height={44} rx={14} fill="#FFFDF4" stroke="#E6EBD6" strokeWidth={2} />
    <Path d="M42 86 l-3 6 M50 88 v6 M58 86 l3 6" stroke="#E9DCC2" strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={64} s={0.8} />
  </G>
);

const onion = (
  <G>
    <Path d="M50 20 Q47 10 52 6" stroke="#B5D68F" strokeWidth={4} fill="none" strokeLinecap="round" />
    <Path d="M50 22 C22 30 16 58 26 72 C34 86 66 86 74 72 C84 58 78 30 50 22 Z" fill="#F5CB93" stroke="#E5B377" strokeWidth={2} />
    <Path d="M40 30 Q30 52 40 80 M60 30 Q70 52 60 80" stroke={LINE} strokeWidth={2} fill="none" />
    <Face x={50} y={60} />
  </G>
);

const milk = (
  <G>
    <Path d="M28 30 L50 14 L72 30 Z" fill="#E7F0FB" stroke="#C9D9EE" strokeWidth={2} strokeLinejoin="round" />
    <Rect x={44} y={10} width={12} height={6} rx={2} fill="#A9C8EE" />
    <Rect x={28} y={30} width={44} height={58} rx={6} fill="#FFFFFF" stroke="#C9D9EE" strokeWidth={2} />
    <Rect x={28} y={66} width={44} height={14} fill="#A9C8EE" />
    <Path d="M38 74 h24" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
    <Face x={50} y={50} s={0.85} />
  </G>
);

const kimchi = (
  <G>
    <Rect x={26} y={18} width={48} height={12} rx={5} fill="#9ED8C8" />
    <Path d="M24 30 H76 V78 Q76 88 66 88 H34 Q24 88 24 78 Z" fill="#EAF6F8" stroke="#CDE4E8" strokeWidth={2} />
    <Path d="M28 46 Q40 38 50 46 Q62 54 72 44 V78 Q72 84 66 84 H34 Q28 84 28 78 Z" fill="#F59A7E" />
    <Path d="M32 52 q4 -4 8 0 M60 50 q4 -4 8 0" stroke="#FFE3A3" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <Face x={50} y={70} s={0.8} />
  </G>
);

const pork = (
  <G>
    <Path d="M18 50 C18 30 44 22 64 26 C84 30 88 52 80 66 C72 82 40 84 26 74 C20 70 18 60 18 50 Z" fill="#F8B2B0" stroke="#EE9C9C" strokeWidth={2} />
    <Path d="M26 42 C40 34 62 32 76 40" stroke="#FFF5F0" strokeWidth={6} fill="none" strokeLinecap="round" />
    <Face x={50} y={60} />
  </G>
);

const carrot = (
  <G>
    <Path d="M46 22 Q40 8 34 12 M50 20 Q50 6 56 8 M54 22 Q62 12 66 18" stroke="#8FD18B" strokeWidth={5} fill="none" strokeLinecap="round" />
    <Path d="M30 24 Q50 18 70 24 Q66 60 52 90 Q50 94 48 90 Q34 60 30 24 Z" fill="#FFB27A" stroke="#F39C61" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M38 56 h6 M56 66 h6 M44 76 h5" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={40} s={0.85} />
  </G>
);

const potato = (
  <G>
    <Path d="M20 54 C16 34 36 22 54 24 C76 26 86 42 82 60 C78 78 58 86 40 82 C26 78 22 68 20 54 Z" fill="#EDC48F" stroke="#D9A96D" strokeWidth={2} />
    <Circle cx={30} cy={44} r={2} fill="#D9A96D" />
    <Circle cx={70} cy={68} r={2} fill="#D9A96D" />
    <Circle cx={68} cy={38} r={1.6} fill="#D9A96D" />
    <Face x={52} y={56} />
  </G>
);

const mushroom = (
  <G>
    <Path d="M14 50 C14 26 34 16 50 16 C66 16 86 26 86 50 Q86 54 80 54 H20 Q14 54 14 50 Z" fill="#D9A47C" stroke="#C58C63" strokeWidth={2} />
    <Circle cx={36} cy={32} r={4} fill="#F3D3B8" />
    <Circle cx={60} cy={28} r={3} fill="#F3D3B8" />
    <Rect x={34} y={52} width={32} height={36} rx={14} fill="#FFF6EA" stroke="#EADBC5" strokeWidth={2} />
    <Face x={50} y={68} s={0.75} />
  </G>
);

const rice = (
  <G>
    <Path d="M16 44 H84 L78 80 Q76 88 68 88 H32 Q24 88 22 80 Z" fill="#FFFFFF" stroke="#E2E6EE" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M18 46 C24 26 40 22 50 26 C60 22 76 26 82 46 Z" fill="#FFFDF8" stroke="#ECE6DA" strokeWidth={2} />
    <Ellipse cx={36} cy={36} rx={3} ry={1.6} fill="#EFE8DA" />
    <Ellipse cx={56} cy={32} rx={3} ry={1.6} fill="#EFE8DA" />
    <Ellipse cx={66} cy={40} rx={3} ry={1.6} fill="#EFE8DA" />
    <Rect x={22} y={56} width={56} height={10} fill="#F7B6BE" opacity={0.7} />
    <Face x={50} y={76} s={0.8} />
  </G>
);

// A portioned box (소분 통): see-through with a mint lid and a number sticker, the way people label them at home.
export function Box({ n }: { n?: number }) {
  return (
    <G>
      <Rect x={14} y={26} width={72} height={14} rx={6} fill="#9ED8C8" stroke="#83C6B4" strokeWidth={2} />
      <Rect x={18} y={38} width={64} height={46} rx={10} fill="#EAF6FA" stroke="#C9E2EA" strokeWidth={2} />
      <Path d="M24 46 v28" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
      {n != null && (
        <G>
          <Circle cx={68} cy={52} r={11} fill="#FFE58A" stroke="#F2CC5B" strokeWidth={1.5} />
          <Text x={68} y={57} fontSize={14} fontWeight="bold" fill={INK} textAnchor="middle">{n}</Text>
        </G>
      )}
      <Face x={44} y={64} s={0.85} />
    </G>
  );
}

const leaf = (
  <G>
    <Path d="M50 88 C24 78 16 50 26 26 C40 30 52 20 58 12 C80 30 86 62 50 88 Z" fill="#A6DD9C" stroke="#86C47C" strokeWidth={2} />
    <Path d="M50 86 Q46 54 52 22" stroke="#86C47C" strokeWidth={2} fill="none" />
    <Face x={44} y={58} s={0.85} />
  </G>
);

const sauce = (
  <G>
    <Rect x={40} y={10} width={20} height={12} rx={4} fill="#F59A7E" />
    <Path d="M42 22 H58 V32 Q72 38 72 52 V80 Q72 88 64 88 H36 Q28 88 28 80 V52 Q28 38 42 32 Z" fill="#FFF3E6" stroke="#EBCFB4" strokeWidth={2} />
    <Rect x={30} y={56} width={40} height={18} fill="#FFE58A" />
    <Face x={50} y={46} s={0.8} />
  </G>
);

const fish = (
  <G>
    <Path d="M14 52 C26 30 56 28 72 46 L88 34 L84 52 L88 70 L72 58 C56 76 26 74 14 52 Z" fill="#B9D3F0" stroke="#97B9E0" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M34 44 Q40 52 34 60" stroke="#97B9E0" strokeWidth={2} fill="none" />
    <Face x={50} y={52} s={0.8} />
  </G>
);

export type IngredientId =
  | 'egg' | 'tofu' | 'greenOnion' | 'onion' | 'milk' | 'kimchi' | 'pork' | 'carrot' | 'potato' | 'mushroom' | 'rice';
export type Category = 'veg' | 'meat' | 'fish' | 'dairy' | 'sauce' | 'other';

const ART: Record<IngredientId, ReactElement> = {
  egg, tofu, greenOnion, onion, milk, kimchi, pork, carrot, potato, mushroom, rice,
};
const CATEGORY_ART: Record<Category, ReactElement> = {
  veg: leaf, meat: pork, fish, dairy: milk, sauce, other: <Box />,
};

export function Ingredient({ id, category = 'other', size = 48 }: { id?: string; category?: Category; size?: number }) {
  const art = (id && ART[id as IngredientId]) || CATEGORY_ART[category];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {art}
    </Svg>
  );
}

export function BoxIcon({ n, size = 48 }: { n?: number; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Box n={n} />
    </Svg>
  );
}
