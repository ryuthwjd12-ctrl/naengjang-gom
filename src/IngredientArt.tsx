import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Face } from './Face';

// The rest of the ingredient drawings (2026-10-28), keyed by food id, in the same style as Ingredients.tsx: a 100-unit
// box, soft pastel fills with a slightly darker outline, and the shared little face. Packaged things (bottles, tubs,
// cans, bags, cartons) share a shape and differ by colour and a small mark, the way they look on a real shelf.

const LINE = 'rgba(90,74,72,0.18)';
const SHINE = '#FFFFFF';

// --- shared shapes ---------------------------------------------------------------------------------------------

function bottle(cap: string, body: string, edge: string, label: string, mark?: ReactElement) {
  return (
    <G>
      <Rect x={42} y={6} width={16} height={10} rx={3} fill={cap} />
      <Path d="M44 16 H56 V26 Q70 32 70 46 V82 Q70 90 62 90 H38 Q30 90 30 82 V46 Q30 32 44 26 Z" fill={body} stroke={edge} strokeWidth={2} />
      <Rect x={32} y={54} width={36} height={22} rx={3} fill={label} />
      <Path d="M36 38 v12" stroke={SHINE} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      {mark}
      <Face x={50} y={64} s={0.7} />
    </G>
  );
}

function tub(lid: string, body: string, edge: string, mark?: ReactElement) {
  return (
    <G>
      <Rect x={16} y={30} width={68} height={14} rx={6} fill={lid} stroke={edge} strokeWidth={2} />
      <Path d="M20 44 H80 L76 82 Q75 88 68 88 H32 Q25 88 24 82 Z" fill={body} stroke={edge} strokeWidth={2} />
      {mark}
      <Face x={50} y={64} s={0.85} />
    </G>
  );
}

function squeeze(body: string, edge: string, cap: string, mark?: ReactElement) {
  return (
    <G>
      <Path d="M44 8 H56 L58 20 H42 Z" fill={cap} />
      <Path d="M40 20 H60 Q74 26 74 44 V80 Q74 90 64 90 H36 Q26 90 26 80 V44 Q26 26 40 20 Z" fill={body} stroke={edge} strokeWidth={2} />
      {mark}
      <Path d="M33 36 v14" stroke={SHINE} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <Face x={50} y={52} s={0.8} />
    </G>
  );
}

function can(body: string, edge: string, band: string, mark?: ReactElement) {
  return (
    <G>
      <Ellipse cx={50} cy={34} rx={30} ry={9} fill="#E6E9EE" stroke="#C8CDD6" strokeWidth={2} />
      <Path d="M20 34 V74 Q20 84 50 84 Q80 84 80 74 V34 Q80 43 50 43 Q20 43 20 34 Z" fill={body} stroke={edge} strokeWidth={2} />
      <Path d="M20 50 Q50 58 80 50 V64 Q50 72 20 64 Z" fill={band} />
      {mark}
      <Face x={50} y={68} s={0.8} />
    </G>
  );
}

function carton(top: string, body: string, edge: string, band: string, mark?: ReactElement) {
  return (
    <G>
      <Path d="M30 28 L38 12 H62 L70 28 Z" fill={top} stroke={edge} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={30} y={28} width={40} height={62} rx={5} fill={body} stroke={edge} strokeWidth={2} />
      <Rect x={30} y={68} width={40} height={14} fill={band} />
      {mark}
      <Face x={50} y={48} s={0.8} />
    </G>
  );
}

function bag(body: string, edge: string, top: string, mark?: ReactElement) {
  return (
    <G>
      <Path d="M22 16 H78 L76 24 H24 Z" fill={top} />
      <Path d="M24 24 H76 Q82 56 76 84 Q74 90 68 90 H32 Q26 90 24 84 Q18 56 24 24 Z" fill={body} stroke={edge} strokeWidth={2} />
      <Path d="M24 16 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4" stroke={top} strokeWidth={2} fill="none" />
      {mark}
      <Face x={50} y={46} s={0.8} />
    </G>
  );
}

function tray(meat: string, edge: string, mark?: ReactElement) {
  return (
    <G>
      <Path d="M12 52 H88 L82 82 Q80 86 74 86 H26 Q20 86 18 82 Z" fill="#F2F4F7" stroke="#D6DBE3" strokeWidth={2} />
      <Path d="M22 56 C20 38 40 28 56 30 C74 32 82 42 78 56 Z" fill={meat} stroke={edge} strokeWidth={2} />
      {mark}
      <Path d="M14 50 Q50 40 86 50" stroke="#E8F2FA" strokeWidth={3} fill="none" opacity={0.9} />
      <Face x={50} y={70} s={0.8} />
    </G>
  );
}

function roundFruit(fill: string, edge: string, top?: ReactElement, extra?: ReactElement, faceY = 58) {
  return (
    <G>
      <Path d="M50 24 C26 20 14 40 18 60 C22 80 40 88 50 86 C60 88 78 80 82 60 C86 40 74 20 50 24 Z" fill={fill} stroke={edge} strokeWidth={2} />
      {extra}
      <Ellipse cx={34} cy={40} rx={5} ry={7} fill={SHINE} opacity={0.5} />
      {top}
      <Face x={50} y={faceY} />
    </G>
  );
}

function leafyBunch(fill: string, edge: string, stem: string) {
  return (
    <G>
      <Path d="M44 60 C24 54 18 30 30 16 C42 22 48 36 46 56 Z" fill={fill} stroke={edge} strokeWidth={2} />
      <Path d="M56 60 C76 54 82 30 70 16 C58 22 52 36 54 56 Z" fill={fill} stroke={edge} strokeWidth={2} />
      <Path d="M50 58 C36 44 38 18 50 8 C62 18 64 44 50 58 Z" fill={fill} stroke={edge} strokeWidth={2} />
      <Rect x={40} y={56} width={20} height={34} rx={9} fill={stem} stroke={edge} strokeWidth={2} />
      <Face x={50} y={72} s={0.6} />
    </G>
  );
}

function longVeg(fill: string, edge: string, cap: string, bumps?: boolean) {
  return (
    <G>
      <Path d="M30 22 Q50 14 70 22 Q74 56 62 86 Q50 94 38 86 Q26 56 30 22 Z" fill={fill} stroke={edge} strokeWidth={2} transform="rotate(-25 50 54)" />
      <Path d="M36 16 Q44 8 52 14 Q60 10 66 18" stroke={cap} strokeWidth={6} fill="none" strokeLinecap="round" transform="rotate(-25 50 54)" />
      {bumps && <Path d="M40 40 h3 M58 52 h3 M44 66 h3 M56 34 h3" stroke={LINE} strokeWidth={2.4} strokeLinecap="round" transform="rotate(-25 50 54)" />}
      <Face x={50} y={56} s={0.8} />
    </G>
  );
}

// --- vegetables and fruit --------------------------------------------------------------------------------------

const scallion = (
  <G>
    <Path d="M34 50 Q30 26 36 8 M44 50 Q42 24 46 6 M54 50 Q56 24 54 6 M64 50 Q70 28 66 10" stroke="#8FD18B" strokeWidth={5} fill="none" strokeLinecap="round" />
    <Rect x={30} y={46} width={40} height={14} rx={4} fill="#F7B6BE" />
    <Path d="M34 60 V84 M44 60 V88 M54 60 V88 M64 60 V84" stroke="#FFFDF4" strokeWidth={7} strokeLinecap="round" />
    <Face x={50} y={53} s={0.6} />
  </G>
);

const garlic = (
  <G>
    <Path d="M50 14 Q48 6 52 4" stroke="#C9B48E" strokeWidth={3} fill="none" strokeLinecap="round" />
    <Path d="M50 16 C30 22 16 44 22 66 C28 86 72 86 78 66 C84 44 70 22 50 16 Z" fill="#FFFAF0" stroke="#E6D6BC" strokeWidth={2} />
    <Path d="M50 18 Q38 46 42 82 M50 18 Q62 46 58 82" stroke="#EDE0CA" strokeWidth={2} fill="none" />
    <Path d="M30 82 l-2 5 M50 86 v5 M70 82 l2 5" stroke="#D9C7A8" strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={60} />
  </G>
);

const sweetPotato = (
  <G>
    <Path d="M12 56 C16 36 40 28 60 32 C80 36 92 50 86 62 C80 76 52 80 34 74 C20 70 10 66 12 56 Z" fill="#C98BB0" stroke="#A86F93" strokeWidth={2} />
    <Path d="M88 60 l6 2 M10 58 l-6 1" stroke="#A86F93" strokeWidth={2} strokeLinecap="round" />
    <Path d="M30 46 h5 M66 66 h5 M58 40 h4" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={56} />
  </G>
);

const zucchini = longVeg('#A9D98C', '#86BF6B', '#7FB563');
const cucumber = longVeg('#8CCB7A', '#6FAF5E', '#F9E27D', true);
const eggplant = longVeg('#A98BD0', '#8A6CB4', '#7FB563');

const cabbage = (
  <G>
    <Circle cx={50} cy={54} r={34} fill="#CDEBB0" stroke="#A9D18A" strokeWidth={2} />
    <Path d="M22 44 Q36 30 50 44 Q64 30 78 44" stroke="#A9D18A" strokeWidth={2} fill="none" />
    <Path d="M50 44 V86" stroke="#E6F5D6" strokeWidth={3} />
    <Path d="M28 68 Q40 60 50 70 Q60 60 72 68" stroke="#A9D18A" strokeWidth={2} fill="none" />
    <Face x={50} y={58} />
  </G>
);

const napa = (
  <G>
    <Path d="M30 30 C26 12 46 6 50 8 C54 6 74 12 70 30 C76 50 72 76 62 88 H38 C28 76 24 50 30 30 Z" fill="#FFFBEA" stroke="#E2DAB8" strokeWidth={2} />
    <Path d="M30 30 C26 12 46 6 50 8 C54 6 74 12 70 30 Q60 40 50 34 Q40 40 30 30 Z" fill="#A6DD9C" stroke="#86C47C" strokeWidth={2} />
    <Path d="M50 36 V86" stroke="#EFE7C8" strokeWidth={3} />
    <Face x={50} y={60} s={0.85} />
  </G>
);

const lettuce = (
  <G>
    <Path d="M50 88 C20 86 10 62 16 44 C10 36 18 24 28 28 C30 16 44 14 50 22 C56 14 70 16 72 28 C82 24 90 36 84 44 C90 62 80 86 50 88 Z" fill="#B7E39A" stroke="#93C978" strokeWidth={2} />
    <Path d="M50 30 V84 M50 50 L36 40 M50 62 L66 50" stroke="#DDF2C9" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <Face x={50} y={64} s={0.85} />
  </G>
);

const perilla = (
  <G>
    <Path d="M50 90 V78" stroke="#6FA85E" strokeWidth={3} strokeLinecap="round" />
    <Path d="M50 80 C28 76 14 56 20 34 l4 2 l2 -5 l4 2 l3 -5 l4 2 l4 -5 l3 3 l6 -6 l6 6 l3 -3 l4 5 l4 -2 l3 5 l4 -2 l2 5 l4 -2 C86 56 72 76 50 80 Z" fill="#7FC273" stroke="#5FA555" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M50 78 V30 M50 50 L34 40 M50 62 L66 50 M50 62 L34 56 M50 50 L66 38" stroke="#A8DB9C" strokeWidth={2} fill="none" />
    <Face x={50} y={56} s={0.8} />
  </G>
);

const spinach = leafyBunch('#6FBF6A', '#55A653', '#F7B6BE');
const bokChoy = leafyBunch('#8FD18B', '#6FBA6B', '#F4FBEF');

const sprouts = (head: string) => (
  <G>
    <Path d="M30 30 Q34 60 28 88 M42 26 Q44 58 40 90 M54 28 Q52 60 56 90 M66 32 Q62 60 70 88" stroke="#D9CDA8" strokeWidth={7} fill="none" strokeLinecap="round" />
    <Path d="M30 30 Q34 60 28 88 M42 26 Q44 58 40 90 M54 28 Q52 60 56 90 M66 32 Q62 60 70 88" stroke="#FFFDF4" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <Ellipse cx={30} cy={28} rx={6} ry={5} fill={head} />
    <Ellipse cx={42} cy={24} rx={6} ry={5} fill={head} />
    <Ellipse cx={54} cy={26} rx={6} ry={5} fill={head} />
    <Ellipse cx={66} cy={30} rx={6} ry={5} fill={head} />
    <Rect x={26} y={50} width={48} height={18} rx={9} fill="#9ED8C8" />
    <Face x={50} y={58} s={0.7} />
  </G>
);
const beanSprout = sprouts('#FFE58A');
const mungSprout = sprouts('#C9E7A6');

const tomato = roundFruit('#FF8F80', '#EE7465', <Path d="M40 22 L50 28 L60 22 L56 30 L50 26 L44 30 Z" fill="#7FC273" stroke="#5FA555" strokeWidth={1.5} strokeLinejoin="round" />);
const apple = roundFruit('#F98B8B', '#E06F72', <G><Path d="M50 26 Q50 16 54 12" stroke="#9C7652" strokeWidth={3} fill="none" strokeLinecap="round" /><Path d="M54 18 Q64 10 70 18 Q62 24 54 18 Z" fill="#8FD18B" /></G>);
const tangerine = roundFruit('#FFB45C', '#F09A3C', <G><Circle cx={50} cy={25} r={3} fill="#7FC273" /><Path d="M52 24 Q60 16 66 22 Q58 28 52 24 Z" fill="#8FD18B" /></G>, <G><Circle cx={30} cy={62} r={1.4} fill="#F09A3C" /><Circle cx={70} cy={52} r={1.4} fill="#F09A3C" /><Circle cx={64} cy={74} r={1.4} fill="#F09A3C" /></G>);
const lemon = (
  <G>
    <Path d="M10 54 Q14 50 18 50 C24 30 76 30 82 50 Q86 50 90 54 Q86 58 82 58 C76 78 24 78 18 58 Q14 58 10 54 Z" fill="#FFE77A" stroke="#F0CC45" strokeWidth={2} />
    <Ellipse cx={34} cy={44} rx={6} ry={3} fill={SHINE} opacity={0.6} />
    <Face x={50} y={56} />
  </G>
);
const kiwi = (
  <G>
    <Ellipse cx={50} cy={54} rx={34} ry={30} fill="#B98E5E" stroke="#9A7347" strokeWidth={2} />
    <Ellipse cx={50} cy={54} rx={27} ry={23} fill="#A8D86E" />
    <Ellipse cx={50} cy={54} rx={9} ry={7} fill="#FFFBE6" />
    <Path d="M38 44 l1 1 M62 44 l-1 1 M36 62 l1 -1 M64 62 l-1 -1 M50 38 v1.5 M50 70 v1.5" stroke={'#4A3B33'} strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={56} s={0.55} />
  </G>
);
const avocado = (
  <G>
    <Path d="M50 10 C38 10 32 30 26 46 C16 72 30 90 50 90 C70 90 84 72 74 46 C68 30 62 10 50 10 Z" fill="#6E9B4A" stroke="#557E36" strokeWidth={2} />
    <Path d="M50 18 C42 18 38 34 33 48 C26 70 36 84 50 84 C64 84 74 70 67 48 C62 34 58 18 50 18 Z" fill="#DDF0A8" />
    <Circle cx={50} cy={64} r={13} fill="#B47A4E" />
    <Face x={50} y={40} s={0.7} />
  </G>
);
const strawberry = (
  <G>
    <Path d="M20 34 C20 28 34 26 50 28 C66 26 80 28 80 34 C82 58 64 86 50 90 C36 86 18 58 20 34 Z" fill="#FF8A95" stroke="#EE6E7C" strokeWidth={2} />
    <Path d="M30 30 L40 18 L46 28 L50 14 L54 28 L60 18 L70 30 Z" fill="#7FC273" stroke="#5FA555" strokeWidth={1.5} strokeLinejoin="round" />
    <Path d="M32 46 l1 2 M68 46 l-1 2 M40 72 l1 2 M60 72 l-1 2 M50 80 v2 M28 58 l1 2 M72 58 l-1 2" stroke="#FFE58A" strokeWidth={2.4} strokeLinecap="round" />
    <Face x={50} y={52} />
  </G>
);
const grape = (
  <G>
    <Path d="M50 16 Q50 8 56 6" stroke="#9C7652" strokeWidth={3} fill="none" strokeLinecap="round" />
    <Path d="M52 12 Q64 4 70 12 Q60 18 52 12 Z" fill="#8FD18B" />
    {[[38, 26], [50, 24], [62, 26], [32, 40], [44, 38], [56, 38], [68, 40], [38, 52], [50, 52], [62, 52], [44, 66], [56, 66], [50, 80]].map(([x, y]) => (
      <Circle key={`${x}-${y}`} cx={x} cy={y} r={8.5} fill="#B38BD9" stroke="#946CBE" strokeWidth={1.5} />
    ))}
    <Face x={50} y={46} s={0.7} />
  </G>
);
const blueberry = (
  <G>
    <Path d="M24 50 H76 L72 84 Q71 88 66 88 H34 Q29 88 28 84 Z" fill="#EAF6FA" stroke="#C9E2EA" strokeWidth={2} />
    {[[34, 46], [46, 42], [58, 44], [68, 48], [40, 34], [54, 32]].map(([x, y]) => (
      <G key={`${x}-${y}`}>
        <Circle cx={x} cy={y} r={8} fill="#7D93D6" stroke="#6077BD" strokeWidth={1.5} />
        <Path d={`M${x - 2} ${y - 5} l2 2 l2 -2`} stroke="#4E62A6" strokeWidth={1.4} fill="none" />
      </G>
    ))}
    <Face x={50} y={70} s={0.8} />
  </G>
);
const ginger = (
  <G>
    <Path d="M18 60 C16 46 28 40 36 44 C38 30 52 26 58 36 C66 28 80 32 80 44 C88 48 88 64 76 68 C70 80 50 80 40 72 C28 76 18 70 18 60 Z" fill="#EBC88C" stroke="#CFA766" strokeWidth={2} />
    <Path d="M36 50 h4 M62 44 h4 M56 66 h4" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
    <Face x={52} y={56} />
  </G>
);
const kabocha = (
  <G>
    <Path d="M50 22 Q48 14 54 10" stroke="#7B6A3A" strokeWidth={4} fill="none" strokeLinecap="round" />
    <Path d="M50 24 C20 18 8 44 16 64 C24 84 44 86 50 82 C56 86 76 84 84 64 C92 44 80 18 50 24 Z" fill="#5E9E5A" stroke="#4A844A" strokeWidth={2} />
    <Path d="M36 26 Q28 54 38 82 M64 26 Q72 54 62 82" stroke="#4A844A" strokeWidth={2} fill="none" />
    <Circle cx={30} cy={48} r={1.6} fill="#BFE0A2" /><Circle cx={70} cy={60} r={1.6} fill="#BFE0A2" />
    <Face x={50} y={58} />
  </G>
);
const corn = (
  <G>
    <Path d="M50 90 C34 80 24 50 34 22 Q42 34 46 60 Z" fill="#A6DD9C" stroke="#86C47C" strokeWidth={2} />
    <Path d="M50 90 C66 80 76 50 66 22 Q58 34 54 60 Z" fill="#A6DD9C" stroke="#86C47C" strokeWidth={2} />
    <Rect x={36} y={10} width={28} height={66} rx={14} fill="#FFE07A" stroke="#F0C64A" strokeWidth={2} />
    <Path d="M40 24 H60 M38 36 H62 M38 48 H62 M38 60 H62 M44 14 V72 M56 14 V72" stroke="#F0C64A" strokeWidth={1.4} />
    <Face x={50} y={42} s={0.7} />
  </G>
);
const paprika = (
  <G>
    <Path d="M50 22 Q50 12 56 8" stroke="#6FA85E" strokeWidth={5} fill="none" strokeLinecap="round" />
    <Path d="M50 24 C40 18 18 22 18 48 C18 70 30 88 42 86 Q50 84 50 80 Q50 84 58 86 C70 88 82 70 82 48 C82 22 60 18 50 24 Z" fill="#FF8C6E" stroke="#E87053" strokeWidth={2} />
    <Path d="M50 28 V78" stroke="#E87053" strokeWidth={2} />
    <Face x={50} y={54} />
  </G>
);
const pepper = (
  <G>
    <Path d="M70 18 Q76 10 82 12" stroke="#6FA85E" strokeWidth={4} fill="none" strokeLinecap="round" />
    <Path d="M62 20 Q78 22 74 34 C66 60 44 82 18 88 Q14 86 18 82 C40 70 54 46 62 20 Z" fill="#6FBF6A" stroke="#55A653" strokeWidth={2} />
    <Path d="M60 24 Q72 22 72 30" fill="none" stroke="#55A653" strokeWidth={2} />
    <Face x={54} y={50} s={0.7} />
  </G>
);
const banana = (
  <G>
    <Path d="M16 40 C22 72 60 86 86 60 Q88 56 84 54 C64 68 36 62 28 36 Q24 30 16 40 Z" fill="#FFE07A" stroke="#F0C64A" strokeWidth={2} />
    <Path d="M14 36 l6 -4 l4 6" fill="#9C7652" stroke="#9C7652" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M30 48 C40 64 62 68 80 58" stroke="#F0C64A" strokeWidth={1.6} fill="none" />
    <Face x={46} y={60} s={0.8} />
  </G>
);
const radish = (
  <G>
    <Path d="M42 22 Q32 6 26 12 M50 20 Q50 4 56 6 M56 22 Q66 8 72 14" stroke="#8FD18B" strokeWidth={6} fill="none" strokeLinecap="round" />
    <Path d="M32 22 Q50 16 68 22 Q74 60 56 88 Q50 94 44 88 Q26 60 32 22 Z" fill="#FFFDF6" stroke="#E6E1CF" strokeWidth={2} />
    <Path d="M32 22 Q50 16 68 22 Q70 32 68 38 Q50 32 32 38 Q30 32 32 22 Z" fill="#D7F0BE" />
    <Path d="M40 60 h4 M56 70 h4" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={52} s={0.85} />
  </G>
);
const broccoli = (
  <G>
    <Path d="M42 56 L38 88 H62 L58 56 Z" fill="#B5DE97" stroke="#93C978" strokeWidth={2} strokeLinejoin="round" />
    <Circle cx={30} cy={44} r={14} fill="#6FBF6A" stroke="#55A653" strokeWidth={2} />
    <Circle cx={70} cy={44} r={14} fill="#6FBF6A" stroke="#55A653" strokeWidth={2} />
    <Circle cx={50} cy={34} r={18} fill="#6FBF6A" stroke="#55A653" strokeWidth={2} />
    <Circle cx={42} cy={50} r={12} fill="#6FBF6A" /><Circle cx={58} cy={50} r={12} fill="#6FBF6A" />
    <Face x={50} y={44} s={0.85} />
  </G>
);
const chives = (
  <G>
    <Path d="M30 86 Q26 50 20 14 M38 86 Q36 50 34 10 M46 86 Q46 50 46 8 M54 86 Q54 50 56 8 M62 86 Q64 50 68 10 M70 86 Q74 50 82 16" stroke="#6FBF6A" strokeWidth={5} fill="none" strokeLinecap="round" />
    <Rect x={26} y={56} width={48} height={14} rx={7} fill="#F7B6BE" />
    <Face x={50} y={63} s={0.6} />
  </G>
);
const iceberg = (
  <G>
    <Circle cx={50} cy={54} r={34} fill="#DDF3C4" stroke="#B5DE97" strokeWidth={2} />
    <Path d="M20 50 Q30 34 50 40 Q70 34 80 50 M26 70 Q40 58 50 66 Q60 58 74 70" stroke="#B5DE97" strokeWidth={2} fill="none" />
    <Face x={50} y={56} />
  </G>
);

// --- meat and fish ---------------------------------------------------------------------------------------------

const beef = tray('#E57373', '#CC5A5A', <Path d="M30 44 Q44 36 56 42 M48 48 Q60 40 72 46" stroke="#FFF1EC" strokeWidth={2.6} fill="none" strokeLinecap="round" />);
const minced = tray('#F29A94', '#DC7E78', <G>{[[34, 44], [44, 38], [56, 40], [66, 46], [48, 48], [38, 50], [60, 50]].map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill="#FFD9D3" />)}</G>);
const duck = tray('#E9A27E', '#CF8661', <Path d="M30 46 h40 M34 40 h32" stroke="#FFF1E2" strokeWidth={3} strokeLinecap="round" />);

const chicken = (
  <G>
    <Path d="M28 40 C28 22 50 14 66 22 C80 30 82 50 70 62 L56 70 C44 72 28 60 28 40 Z" fill="#F7CFA4" stroke="#E2B07E" strokeWidth={2} />
    <Path d="M58 66 L74 82" stroke="#FFFDF6" strokeWidth={8} strokeLinecap="round" />
    <Circle cx={76} cy={80} r={5} fill="#FFFDF6" stroke="#E6DCC8" strokeWidth={1.5} /><Circle cx={80} cy={86} r={5} fill="#FFFDF6" stroke="#E6DCC8" strokeWidth={1.5} />
    <Face x={50} y={42} />
  </G>
);
const friedChicken = (
  <G>
    <Path d="M14 56 H86 L80 84 Q78 88 72 88 H28 Q22 88 20 84 Z" fill="#FFFFFF" stroke="#E2E6EE" strokeWidth={2} />
    <Path d="M14 56 H86 V64 H14 Z" fill="#F59A7E" />
    <Path d="M22 56 C18 40 30 30 40 34 C44 24 58 24 62 32 C72 26 84 36 78 56 Z" fill="#E8A75C" stroke="#CB8A40" strokeWidth={2} />
    <Path d="M30 44 l2 2 M46 36 l2 1 M64 40 l2 2 M54 48 l1 2" stroke="#CB8A40" strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={74} s={0.8} />
  </G>
);
const ham = can('#7CA5DA', '#5E88C2', '#FFE58A', <Rect x={36} y={52} width={28} height={8} rx={3} fill="#F59A9A" />);
const sausage = (
  <G>
    <Path d="M14 64 C14 40 40 34 60 40 C78 44 88 56 84 66 C80 76 62 74 50 68 C36 62 22 80 14 64 Z" fill="#E98E7A" stroke="#D0705C" strokeWidth={2} />
    <Path d="M12 64 l-4 2 M86 64 l4 1" stroke="#D0705C" strokeWidth={3} strokeLinecap="round" />
    <Path d="M30 48 q8 -4 16 0" stroke="#FFD6CB" strokeWidth={3} fill="none" strokeLinecap="round" />
    <Face x={52} y={56} s={0.85} />
  </G>
);
const bacon = (
  <G>
    <Path d="M14 30 Q30 22 44 30 T74 30 T88 28 V44 Q74 52 60 44 T30 44 T14 46 Z" fill="#F4A6A0" stroke="#DE8A84" strokeWidth={2} />
    <Path d="M14 38 Q30 30 44 38 T74 38 T88 36" stroke="#FFF1EA" strokeWidth={3} fill="none" />
    <Path d="M14 56 Q30 48 44 56 T74 56 T88 54 V70 Q74 78 60 70 T30 70 T14 72 Z" fill="#F4A6A0" stroke="#DE8A84" strokeWidth={2} />
    <Path d="M14 64 Q30 56 44 64 T74 64 T88 62" stroke="#FFF1EA" strokeWidth={3} fill="none" />
    <Face x={50} y={52} s={0.8} />
  </G>
);
const tteokgalbi = (
  <G>
    <Ellipse cx={50} cy={58} rx={36} ry={26} fill="#A9744F" stroke="#8C5A38" strokeWidth={2} />
    <Path d="M26 50 l48 0 M24 60 l52 0 M28 70 l44 0" stroke="#C9926A" strokeWidth={3} strokeLinecap="round" />
    <Circle cx={36} cy={44} r={1.6} fill="#F2E2B8" /><Circle cx={62} cy={46} r={1.6} fill="#F2E2B8" /><Circle cx={70} cy={64} r={1.6} fill="#8FD18B" />
    <Face x={50} y={60} />
  </G>
);
const porkCutlet = (
  <G>
    <Path d="M16 56 C14 36 38 26 56 28 C76 30 90 44 84 62 C78 80 50 84 32 78 C22 74 16 66 16 56 Z" fill="#E7B062" stroke="#C99240" strokeWidth={2} />
    {[[30, 46], [44, 38], [60, 38], [72, 50], [36, 66], [54, 70], [70, 66]].map(([x, y]) => <Path key={`${x}-${y}`} d={`M${x} ${y} l2 2 l2 -2`} stroke="#C99240" strokeWidth={1.6} fill="none" />)}
    <Face x={50} y={56} />
  </G>
);
const nugget = (
  <G>
    <Path d="M18 40 C14 26 32 20 40 28 C46 22 58 26 56 38 C60 50 44 56 34 52 C22 56 14 50 18 40 Z" fill="#EDBE6E" stroke="#D2A24F" strokeWidth={2} />
    <Path d="M46 62 C42 50 60 44 68 50 C78 44 90 54 84 64 C90 76 74 84 64 78 C52 84 40 74 46 62 Z" fill="#EDBE6E" stroke="#D2A24F" strokeWidth={2} />
    <Face x={64} y={64} s={0.75} />
    <Face x={36} y={40} s={0.6} />
  </G>
);
const fishFood = (
  <G>
    <Path d="M12 52 C24 30 56 28 72 46 L88 34 L84 52 L88 70 L72 58 C56 76 24 74 12 52 Z" fill="#8FB4DA" stroke="#6E95C0" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M30 40 Q44 46 60 40 M30 50 Q44 56 60 50" stroke="#5D7FA8" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <Path d="M18 58 Q40 70 66 60" stroke="#E8F0FA" strokeWidth={4} fill="none" strokeLinecap="round" />
    <Face x={44} y={52} s={0.75} />
  </G>
);
const shrimp = (
  <G>
    <Path d="M70 24 C44 14 18 34 24 60 C28 76 46 84 58 76 L52 66 C42 70 34 62 36 52 C38 38 56 32 68 38 Z" fill="#FFA889" stroke="#EE8B6A" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M58 76 L66 88 L50 84 Z" fill="#FF8F70" stroke="#EE8B6A" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M36 30 l4 8 M28 42 l8 4 M26 56 l8 0" stroke="#FFE1D4" strokeWidth={3} strokeLinecap="round" />
    <Path d="M70 24 Q86 14 90 20 M70 30 Q88 28 92 34" stroke="#EE8B6A" strokeWidth={2} fill="none" strokeLinecap="round" />
    <Face x={46} y={54} s={0.7} />
  </G>
);
const squid = (
  <G>
    <Path d="M50 8 L72 34 Q74 56 66 64 H34 Q26 56 28 34 Z" fill="#FFF0E6" stroke="#EFCDB8" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M36 64 Q32 80 26 88 M44 64 Q42 82 40 92 M50 64 V92 M56 64 Q58 82 60 92 M64 64 Q68 80 74 88" stroke="#FFE2D3" strokeWidth={5} fill="none" strokeLinecap="round" />
    <Face x={50} y={48} s={0.8} />
  </G>
);
const fishcake = (
  <G>
    <Path d="M30 90 L66 14" stroke="#D9B98C" strokeWidth={4} strokeLinecap="round" />
    <Path d="M30 28 Q46 20 58 30 Q70 40 56 50 Q40 58 54 68 Q66 78 50 84 Q34 88 30 78 Q40 70 32 62 Q20 52 34 44 Q44 38 30 28 Z" fill="#F2D49B" stroke="#D9B472" strokeWidth={2} strokeLinejoin="round" />
    <Face x={46} y={54} s={0.65} />
  </G>
);
const crab = (
  <G>
    <Rect x={18} y={30} width={64} height={18} rx={9} fill="#FF8F80" stroke="#E87063" strokeWidth={2} />
    <Rect x={18} y={40} width={64} height={8} fill="#FFFFFF" />
    <Rect x={18} y={56} width={64} height={18} rx={9} fill="#FF8F80" stroke="#E87063" strokeWidth={2} />
    <Rect x={18} y={66} width={64} height={8} fill="#FFFFFF" />
    <Face x={50} y={38} s={0.6} />
  </G>
);
const clam = (
  <G>
    <Path d="M14 64 C14 38 30 22 50 22 C70 22 86 38 86 64 Q86 72 78 72 H22 Q14 72 14 64 Z" fill="#E8D7C2" stroke="#C9B193" strokeWidth={2} />
    <Path d="M50 24 V70 M34 28 L40 70 M66 28 L60 70 M22 42 L30 70 M78 42 L70 70" stroke="#C9B193" strokeWidth={1.6} />
    <Path d="M26 72 H74 Q70 82 50 82 Q30 82 26 72 Z" fill="#D9C4A8" stroke="#C9B193" strokeWidth={2} />
    <Face x={50} y={52} s={0.8} />
  </G>
);
const anchovy = (
  <G>
    {[30, 50, 70].map((y) => (
      <G key={y}>
        <Path d={`M16 ${y} Q40 ${y - 10} 70 ${y} L84 ${y - 6} L82 ${y} L84 ${y + 6} L70 ${y} Q40 ${y + 10} 16 ${y} Z`} fill="#C9D6E2" stroke="#9FB2C4" strokeWidth={1.6} strokeLinejoin="round" />
        <Circle cx={24} cy={y - 1} r={1.5} fill="#5A4A48" />
      </G>
    ))}
    <Face x={46} y={52} s={0.6} />
  </G>
);
const tuna = can('#FFFFFF', '#D6DBE3', '#7CA5DA', <Path d="M36 56 Q50 50 64 56 Q50 62 36 56 Z" fill="#FFFFFF" />);

// --- dairy -----------------------------------------------------------------------------------------------------

const yogurt = (
  <G>
    <Rect x={22} y={26} width={56} height={10} rx={4} fill="#F7B6BE" />
    <Path d="M24 36 H76 L72 82 Q71 88 64 88 H36 Q29 88 28 82 Z" fill="#FFFFFF" stroke="#E2E6EE" strokeWidth={2} />
    <Path d="M28 52 H72" stroke="#F7B6BE" strokeWidth={4} />
    <Circle cx={60} cy={70} r={6} fill="#FF8A95" /><Path d="M60 64 l2 -4" stroke="#7FC273" strokeWidth={2} strokeLinecap="round" />
    <Face x={46} y={68} s={0.75} />
  </G>
);
const cheese = (
  <G>
    <Path d="M12 70 L86 44 V74 L12 82 Z" fill="#FFD85E" stroke="#F0BE34" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M12 70 L60 30 L86 44 Z" fill="#FFE68A" stroke="#F0BE34" strokeWidth={2} strokeLinejoin="round" />
    <Circle cx={30} cy={74} r={3} fill="#F0BE34" /><Circle cx={70} cy={66} r={4} fill="#F0BE34" /><Circle cx={60} cy={40} r={2.5} fill="#F0BE34" />
    <Face x={50} y={68} s={0.75} />
  </G>
);
const butter = (
  <G>
    <Rect x={14} y={40} width={72} height={40} rx={8} fill="#FFFFFF" stroke="#E2E6EE" strokeWidth={2} />
    <Rect x={20} y={30} width={60} height={28} rx={6} fill="#FFE68A" stroke="#F0CC5B" strokeWidth={2} />
    <Path d="M28 38 h20" stroke="#FFF6CF" strokeWidth={3} strokeLinecap="round" />
    <Face x={50} y={66} s={0.85} />
  </G>
);
const cream = carton('#FFFFFF', '#FFFFFF', '#E2E6EE', '#BFD8F3', <Path d="M42 74 Q50 68 58 74 Q50 80 42 74 Z" fill="#FFFFFF" />);
const creamCheese = tub('#D9E4F2', '#FFFFFF', '#C9D4E3', <Rect x={30} y={56} width={40} height={8} rx={3} fill="#BFD8F3" />);
const soyMilk = carton('#F3E2B8', '#FFFBEF', '#E3D2A6', '#C9E7A6', <Circle cx={50} cy={75} r={4} fill="#F3E2B8" />);

// --- sauces ----------------------------------------------------------------------------------------------------

const soySauce = bottle('#E56B5A', '#5A3B2E', '#3E271D', '#FFF3E6');
const sesameOil = bottle('#E9C46A', '#E9B65C', '#C99A3E', '#FFF6DC', <Circle cx={50} cy={42} r={4} fill="#FFF6DC" />);
const oil = bottle('#8FD18B', '#FFE89A', '#E8C960', '#FFFFFF', <Path d="M46 42 q4 -6 8 0 q-4 6 -8 0" fill="#A6DD9C" />);
const vinegar = bottle('#9ED8C8', '#F4FBF6', '#CFE6DB', '#9ED8C8');
const mirin = bottle('#B38BD9', '#FFF4E6', '#E8D2B8', '#D9C4EE');
const oysterSauce = bottle('#E56B5A', '#6B4A3A', '#4E3326', '#FFE58A');
const syrup = squeeze('#FFE7A0', '#F0CC5B', '#F7B6BE', <Rect x={32} y={64} width={36} height={14} fill="#FFFFFF" opacity={0.7} />);
const mayo = squeeze('#FFF8E6', '#EADBB8', '#F59A9A', <Path d="M30 66 h40" stroke="#F59A9A" strokeWidth={4} />);
const ketchup = squeeze('#F06B5E', '#D4544A', '#FFFFFF', <Path d="M30 66 h40" stroke="#FFFFFF" strokeWidth={4} />);
const mustard = squeeze('#FFD54F', '#E8B830', '#7FC273');
const gochujang = tub('#E8533F', '#F27A63', '#D54A38', <Rect x={32} y={70} width={36} height={8} rx={3} fill="#FFE58A" />);
const doenjang = tub('#A87A4E', '#C9965F', '#94683E', <Rect x={32} y={70} width={36} height={8} rx={3} fill="#FFF3E0" />);
const ssamjang = tub('#2F8A5A', '#D98A5B', '#B86E44', <Rect x={32} y={70} width={36} height={8} rx={3} fill="#A6DD9C" />);
const jam = (
  <G>
    <Rect x={26} y={20} width={48} height={14} rx={4} fill="#FFFFFF" stroke="#F59A9A" strokeWidth={2} />
    <Path d="M26 27 h48" stroke="#F59A9A" strokeWidth={3} strokeDasharray="6 6" />
    <Path d="M28 34 H72 V80 Q72 88 64 88 H36 Q28 88 28 80 Z" fill="#FF8A95" stroke="#E86C79" strokeWidth={2} />
    <Rect x={34} y={58} width={32} height={16} rx={4} fill="#FFF6E6" />
    <Face x={50} y={46} s={0.75} />
  </G>
);
const chiliPowder = bag('#F25E4C', '#D84636', '#FFE58A', <Path d="M40 70 Q50 60 60 70 Q56 84 50 84 Q44 84 40 70 Z" fill="#FFE58A" />);
const sugar = bag('#FFFFFF', '#E2E6EE', '#BFD8F3', <G><Rect x={40} y={64} width={8} height={8} fill="#E6EEF8" stroke="#C9D4E3" /><Rect x={52} y={64} width={8} height={8} fill="#E6EEF8" stroke="#C9D4E3" /></G>);
const salt = (
  <G>
    <Rect x={30} y={14} width={40} height={14} rx={6} fill="#7CA5DA" />
    <Rect x={28} y={26} width={44} height={62} rx={10} fill="#FFFFFF" stroke="#D6DBE3" strokeWidth={2} />
    <Rect x={28} y={64} width={44} height={14} fill="#7CA5DA" />
    <Circle cx={42} cy={20} r={1.5} fill="#FFFFFF" /><Circle cx={50} cy={20} r={1.5} fill="#FFFFFF" /><Circle cx={58} cy={20} r={1.5} fill="#FFFFFF" />
    <Face x={50} y={46} s={0.8} />
  </G>
);

// --- everything else -------------------------------------------------------------------------------------------

const bread = (
  <G>
    <Path d="M16 50 C10 30 30 18 50 22 C70 18 90 30 84 50 V80 Q84 88 76 88 H24 Q16 88 16 80 Z" fill="#F2C27E" stroke="#D9A45C" strokeWidth={2} />
    <Path d="M24 50 C20 36 34 30 50 32 C66 30 80 36 76 50 V80 H24 Z" fill="#FFF3DC" />
    <Face x={50} y={62} />
  </G>
);
const riceCake = (
  <G>
    {[24, 44, 64].map((y, i) => (
      <Rect key={y} x={10 + i * 4} y={y} width={74} height={18} rx={9} fill="#FFFDF6" stroke="#D9C9A8" strokeWidth={2} />
    ))}
    <Face x={52} y={53} s={0.7} />
  </G>
);
const ramen = bag('#F25E4C', '#D84636', '#FFE58A', <G><Path d="M34 66 q4 -6 8 0 t8 0 t8 0 t8 0" stroke="#FFE58A" strokeWidth={3} fill="none" strokeLinecap="round" /><Path d="M34 74 q4 -6 8 0 t8 0 t8 0 t8 0" stroke="#FFE58A" strokeWidth={3} fill="none" strokeLinecap="round" /></G>);
const udon = bag('#F4FBFF', '#C9DCEA', '#7CA5DA', <Path d="M34 66 Q50 58 66 66 M34 74 Q50 66 66 74" stroke="#FFF6E0" strokeWidth={5} fill="none" strokeLinecap="round" />);
const pasta = (
  <G>
    <Rect x={30} y={20} width={40} height={68} rx={6} fill="#4F7BC0" stroke="#3E66A6" strokeWidth={2} />
    <Rect x={36} y={30} width={28} height={40} rx={4} fill="#FFFFFF" opacity={0.85} />
    <Path d="M40 12 V30 M45 10 V30 M50 12 V30 M55 10 V30 M60 12 V30" stroke="#F2D08A" strokeWidth={3} strokeLinecap="round" />
    <Face x={50} y={52} s={0.75} />
  </G>
);
const dumpling = (
  <G>
    <Path d="M14 64 C14 40 34 30 50 30 C66 30 86 40 86 64 Q86 70 80 70 H20 Q14 70 14 64 Z" fill="#FFFAF0" stroke="#E6DCC8" strokeWidth={2} />
    <Path d="M24 40 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0" stroke="#E6DCC8" strokeWidth={2} fill="none" />
    <Path d="M18 70 Q50 82 82 70" stroke="#E6DCC8" strokeWidth={2} fill="none" />
    <Path d="M74 22 l4 -4 M80 26 l5 -2 M70 18 l1 -6" stroke="#A9CBE6" strokeWidth={2} strokeLinecap="round" />
    <Face x={50} y={56} />
  </G>
);
const softTofu = (
  <G>
    <Path d="M38 10 H62 L60 20 H40 Z" fill="#E2E6EE" />
    <Path d="M30 20 H70 Q76 50 70 86 Q68 90 64 90 H36 Q32 90 30 86 Q24 50 30 20 Z" fill="#FFFDF6" stroke="#E6E1CF" strokeWidth={2} />
    <Rect x={30} y={56} width={40} height={10} fill="#9ED8C8" />
    <Face x={50} y={40} s={0.75} />
  </G>
);
const quailEgg = (
  <G>
    {[[32, 58], [52, 50], [70, 62], [44, 72], [62, 78]].map(([x, y]) => (
      <G key={`${x}-${y}`}>
        <Ellipse cx={x} cy={y} rx={11} ry={13} fill="#FFF3E2" stroke="#E6D3B8" strokeWidth={1.6} />
        <Circle cx={x - 3} cy={y - 4} r={2} fill="#B99A78" /><Circle cx={x + 4} cy={y + 2} r={1.6} fill="#B99A78" />
      </G>
    ))}
    <Face x={52} y={50} s={0.55} />
  </G>
);
const friedTofu = (
  <G>
    <Path d="M14 74 L50 26 L86 74 Z" fill="#E9B65C" stroke="#CC9840" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M26 70 L50 38 L74 70" stroke="#F5D08E" strokeWidth={3} fill="none" />
    <Circle cx={36} cy={62} r={1.6} fill="#CC9840" /><Circle cx={62} cy={58} r={1.6} fill="#CC9840" />
    <Face x={50} y={60} s={0.8} />
  </G>
);
const laver = (
  <G>
    <Rect x={14} y={30} width={72} height={52} rx={6} fill="#3E6B4E" stroke="#2E5039" strokeWidth={2} />
    <Path d="M14 40 H86 M14 52 H86 M14 64 H86" stroke="#5A8A6A" strokeWidth={1.4} />
    <Rect x={26} y={22} width={48} height={10} rx={3} fill="#F59A7E" />
    <Rect x={30} y={46} width={40} height={24} rx={8} fill="#FFF6E6" />
    <Face x={50} y={57} s={0.85} />
  </G>
);
const cereal = (
  <G>
    <Rect x={24} y={12} width={52} height={78} rx={4} fill="#FFC85C" stroke="#E8AE3A" strokeWidth={2} />
    <Rect x={30} y={60} width={40} height={22} rx={10} fill="#FFFFFF" />
    <Circle cx={40} cy={64} r={4} fill="#E8AE3A" /><Circle cx={52} cy={62} r={4} fill="#F59A7E" /><Circle cx={62} cy={66} r={4} fill="#E8AE3A" />
    <Face x={50} y={38} s={0.8} />
  </G>
);
const juice = carton('#FFB45C', '#FFF4E2', '#F0C890', '#FFB45C', <Circle cx={50} cy={75} r={5} fill="#FFE58A" />);
const beer = (
  <G>
    <Ellipse cx={50} cy={18} rx={18} ry={5} fill="#E6E9EE" stroke="#C8CDD6" strokeWidth={2} />
    <Path d="M32 18 V82 Q32 90 50 90 Q68 90 68 82 V18 Q68 23 50 23 Q32 23 32 18 Z" fill="#FFD24F" stroke="#E8B830" strokeWidth={2} />
    <Rect x={32} y={58} width={36} height={14} fill="#7CA5DA" />
    <Path d="M38 30 v18" stroke="#FFF2B8" strokeWidth={3} strokeLinecap="round" />
    <Face x={50} y={44} s={0.75} />
  </G>
);
const pizza = (
  <G>
    <Path d="M50 88 L16 26 Q50 10 84 26 Z" fill="#FFD27A" stroke="#E8B04A" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M16 26 Q50 10 84 26 L80 34 Q50 20 20 34 Z" fill="#E8A75C" />
    <Circle cx={40} cy={42} r={6} fill="#F06B5E" /><Circle cx={60} cy={44} r={6} fill="#F06B5E" /><Circle cx={50} cy={66} r={5} fill="#F06B5E" />
    <Face x={50} y={52} s={0.7} />
  </G>
);
const banchan = (
  <G>
    <Rect x={10} y={42} width={38} height={10} rx={4} fill="#9ED8C8" />
    <Rect x={12} y={50} width={34} height={30} rx={6} fill="#EAF6FA" stroke="#C9E2EA" strokeWidth={2} />
    <Path d="M16 58 q6 -6 12 0 q6 -6 12 0" stroke="#8FD18B" strokeWidth={4} fill="none" strokeLinecap="round" />
    <Rect x={52} y={36} width={38} height={10} rx={4} fill="#F7B6BE" />
    <Rect x={54} y={44} width={34} height={36} rx={6} fill="#EAF6FA" stroke="#C9E2EA" strokeWidth={2} />
    <Circle cx={64} cy={54} r={3} fill="#C99A5E" /><Circle cx={72} cy={52} r={3} fill="#C99A5E" /><Circle cx={78} cy={56} r={3} fill="#C99A5E" />
    <Face x={50} y={72} s={0.75} />
  </G>
);

export const MORE_ART: Record<string, ReactElement> = {
  yogurt, cheese, butter, scallion, garlic, sweetPotato, zucchini, cabbage, napa, lettuce, perilla, spinach,
  beanSprout, mungSprout, cucumber, tomato, paprika, pepper, apple, banana, beef, chicken, minced, fish: fishFood,
  shrimp, squid, ham, sausage, bacon, fishcake, bread, riceCake, gochujang, doenjang, mayo, ketchup,
  radish, broccoli, eggplant, bokChoy, chives, iceberg, avocado, lemon, tangerine, strawberry, grape, kiwi, blueberry,
  ginger, kabocha, corn, duck, tteokgalbi, porkCutlet, nugget, crab, clam, anchovy, cream, creamCheese, soyMilk,
  soySauce, sesameOil, oil, vinegar, oysterSauce, ssamjang, chiliPowder, sugar, salt, mirin, syrup, jam, mustard,
  ramen, udon, pasta, dumpling, softTofu, quailEgg, friedTofu, laver, tuna, cereal, juice, beer, friedChicken, pizza,
  banchan,
};
