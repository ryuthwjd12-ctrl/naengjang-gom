import { Circle, Ellipse, G, Path } from 'react-native-svg';

// Guest-only animals: they only ever come into the shop as guests (never bakers), so they're drawn here, apart from
// the bakers in Character.tsx, which hooks each part in (Back, Ears, Markings, Front, the nose and mouth in Face).
// Same 100-unit head (HEAD: x 14-86, y 16-74, eyes near y 50 at x 37/63, nose near 50,56), same sticker outline.
// Also here: GuestTrim, the small random extras (a bow, glasses, a flower) that make guests of one kind differ.
export type GuestKind = 'hedgehog' | 'raccoon' | 'owl' | 'frog' | 'redpanda' | 'alpaca';

// Emoji (or plain id key, for the red panda, which has no emoji) to drawing.
export const GUEST_SPECIES: Record<string, GuestKind> = {
  '🦔': 'hedgehog',
  '🦝': 'raccoon',
  '🦉': 'owl',
  '🐸': 'frog',
  redpanda: 'redpanda',
  '🦙': 'alpaca',
};

// The same shape as Character.tsx's Look.
type Look = { fur: string; light: string; ear: string; limb?: string; body?: string };
export const GUEST_LOOK: Record<GuestKind, Look> = {
  // hedgehog: a cream face under a hood of soft brown spines.
  hedgehog: { fur: '#FCE7CE', light: '#FFF7EC', ear: '#F7B6BE', body: '#EFD0AE', limb: '#EFD0AE' },
  // raccoon: soft grey with a darker bandit mask and a white muzzle and brows.
  raccoon: { fur: '#BDB7C2', light: '#FFFBF7', ear: '#F7C4CF' },
  // owl: a lilac owlet with a cream heart-shaped face, ear tufts and a little gold beak.
  owl: { fur: '#C3B1E0', light: '#FFF6EA', ear: '#A792CF' },
  // frog: a mint frog with bulging eye bumps and a pale chin and tummy.
  frog: { fur: '#B4E0A0', light: '#F3FADF', ear: '#FFFFFF' },
  // redpanda: rusty orange with a white mask, white-rimmed ears and dark brown paws.
  redpanda: { fur: '#EC9C6C', light: '#FFF9F1', ear: '#FFF9F1', limb: '#93604F', body: '#C97E5E' },
  // alpaca: a beige alpaca with a fluffy white topknot and neck ruff.
  alpaca: { fur: '#F3DDC1', light: '#FFFBF4', ear: '#F6C4C2' },
};

// Own head silhouettes (Character.tsx's HEAD_SHAPES format: the top centre, then the right half as cubics down to
// the chin). The frog's head is wide and flat.
type Pt = [number, number];
export const GUEST_HEADS: Partial<Record<GuestKind, { top: number; right: [Pt, Pt, Pt][] }>> = {
  frog: {
    top: 19,
    right: [
      [[73, 19], [89, 29], [90.5, 45]],
      [[92, 63], [74, 74.5], [50, 74.5]],
    ],
  },
};

export function isGuestKind(kind: string): kind is GuestKind {
  return kind in GUEST_LOOK;
}

const LINE = '#C9A27E'; // the shared sticker outline (Character.tsx)
const SW = 2.2;
const rot = (a: number, x: number, y: number) => `rotate(${a.toFixed(2)} ${x} ${y})`;
const s = { stroke: LINE, strokeWidth: SW, strokeLinejoin: 'round' as const };

const SPINE = '#B98F70';
const SPINE_LIGHT = '#D7B596';
const MASK = '#77707C';
const BEAK = '#F7B958';
const RP_DARK = '#93604F';
const RP_TEAR = '#C9704A';
const WOOL = '#FFFCF6';

// Outlined circles, then their fills, so they merge into one fluffy cloud.
function Puffs({ pts, r, fill }: { pts: [number, number][]; r: number; fill: string }) {
  return (
    <G>
      {pts.map(([x, y], i) => (
        <Circle key={'o' + i} cx={x} cy={y} r={r} fill={fill} stroke={LINE} strokeWidth={SW} />
      ))}
      {pts.map(([x, y], i) => (
        <Circle key={'f' + i} cx={x} cy={y} r={r - SW / 2} fill={fill} />
      ))}
    </G>
  );
}

// The hedgehog's spines: a zigzag crown round the top and sides of the head. They bristle out while straining.
function spines(t: number) {
  const n = 15;
  let d = '';
  for (let i = 0; i <= n * 2; i++) {
    const a = ((150 + (240 * i) / (n * 2)) * Math.PI) / 180;
    const out = i % 2 === 1;
    const rx = out ? 46 + 2 * t : 35;
    const ry = out ? 40 + 2 * t : 29;
    d += `${i ? 'L' : 'M'}${(50 + Math.cos(a) * rx).toFixed(2)} ${(47 + Math.sin(a) * ry).toFixed(2)} `;
  }
  return d + 'L50 47 Z';
}

export function GuestBack({ kind, t }: { kind: GuestKind; t: number }) {
  switch (kind) {
    case 'hedgehog':
      return (
        <G>
          <Path d={spines(t)} fill={SPINE} {...s} />
          <G stroke={SPINE_LIGHT} strokeWidth={1.3} strokeLinecap="round">
            <Path d="M21 27 L16.5 23.5 M28 19 L25 15 M79 27 L83.5 23.5 M72 19 L75 15 M15.5 40 L10 38.5 M84.5 40 L90 38.5" />
          </G>
        </G>
      );
    case 'alpaca':
      // A fluffy white ruff round the neck, under the head.
      return <Puffs pts={[[33, 70], [40, 74.5], [50, 76], [60, 74.5], [67, 70]]} r={6.5} fill={WOOL} />;
    default:
      return null;
  }
}

export function GuestEars({ kind, look, t }: { kind: GuestKind; look: Look; t: number }) {
  switch (kind) {
    case 'hedgehog':
      // Small round ears peeking out of the spines; they wiggle while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={rot(-side * 12 * t, x(24), 34)}>
                <Circle cx={x(19.5)} cy={31} r={6.4} fill={look.fur} {...s} />
                <Circle cx={x(20)} cy={31.6} r={3.2} fill={look.ear} />
              </G>
            );
          })}
        </G>
      );
    case 'raccoon':
      // Rounded triangle ears with dark backs and a white rim, pink inside; they flatten while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={rot(-side * 14 * t, x(30), 30)}>
                <Path d={`M${x(18)} 34 Q${x(14)} 12 ${x(22)} 9.5 Q${x(30)} 9 ${x(40)} 20 Z`} fill={MASK} {...s} />
                <Path d={`M${x(21.5)} 29 Q${x(19.5)} 15.5 ${x(23.5)} 14 Q${x(28.5)} 14 ${x(35)} 21 Z`} fill={look.light} />
                <Path d={`M${x(24)} 26 Q${x(23)} 18 ${x(25)} 17.5 Q${x(28)} 17.5 ${x(32)} 22 Z`} fill={look.ear} />
              </G>
            );
          })}
        </G>
      );
    case 'owl':
      // Feathery ear tufts at the top corners; they perk up while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={rot(-side * 10 * t, x(30), 26)}>
                <Path d={`M${x(19)} 31 Q${x(16)} 19 ${x(13.5)} 10 Q${x(20)} 12 ${x(23.5)} 15.5 Q${x(25)} 12.5 ${x(27.5)} 12 Q${x(29)} 17 ${x(37)} 21 Z`} fill={look.fur} {...s} />
                <Path d={`M${x(20)} 26 Q${x(18.5)} 19.5 ${x(17.5)} 15 Q${x(22)} 18 ${x(28)} 20.5 Z`} fill={look.ear} />
              </G>
            );
          })}
        </G>
      );
    case 'frog':
      // Two round eye bumps on top of the head, each with a little shine; they bob while straining.
      return (
        <G transform={`translate(0 ${(-2 * t).toFixed(2)})`}>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side}>
                <Circle cx={x(30)} cy={23} r={13} fill={look.fur} {...s} />
                <Ellipse cx={x(30)} cy={20.5} rx={7.5} ry={6.2} fill="#D5F0C6" />
                <Circle cx={x(27.2)} cy={18.4} r={2.1} fill="#FFFFFF" />
              </G>
            );
          })}
        </G>
      );
    case 'redpanda':
      // Big rounded triangle ears: white fluffy rims round a dark inside. They twitch while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={rot(-side * 12 * t, x(30), 30)}>
                <Path d={`M${x(16)} 36 Q${x(10)} 12 ${x(21)} 8 Q${x(31)} 7 ${x(42)} 21 Z`} fill={look.light} {...s} />
                <Path d={`M${x(20)} 30 Q${x(17)} 16 ${x(23)} 13.5 Q${x(29)} 13.5 ${x(36)} 22 Z`} fill={RP_DARK} />
              </G>
            );
          })}
        </G>
      );
    case 'alpaca':
      // Long leaf ears standing up and out, pink inside; they swivel while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={rot(-side * (48 + 12 * t), x(26), 28)}>
                <Ellipse cx={x(26)} cy={17} rx={5.6} ry={11} fill={look.fur} {...s} />
                <Ellipse cx={x(26)} cy={18} rx={2.6} ry={7} fill={look.ear} />
              </G>
            );
          })}
        </G>
      );
    default:
      return null;
  }
}

// Clipped to the head, so these can be drawn loosely.
export function GuestMarkings({ kind, look }: { kind: GuestKind; look: Look }) {
  switch (kind) {
    case 'hedgehog':
      // The spines come down over the crown as a hood with a soft wavy edge.
      return (
        <G>
          <Path d="M0 0 H100 V42 Q90 31 79 33.5 Q71 25 61 30 Q55 22.5 50 28 Q45 22.5 39 30 Q29 25 21 33.5 Q10 31 0 42 Z" fill={SPINE} />
          <G stroke={SPINE_LIGHT} strokeWidth={1.2} strokeLinecap="round">
            <Path d="M35 20 L38 25 M44 17 L46 22 M56 17 L54 22 M65 20 L62 25 M26 26 L30 29 M74 26 L70 29" />
          </G>
          <Ellipse cx={50} cy={60} rx={9} ry={6.5} fill={look.light} />
        </G>
      );
    case 'raccoon':
      return (
        <G>
          {/* white brows, the dark bandit mask over the eyes, and a white muzzle */}
          <Ellipse cx={34} cy={38} rx={9} ry={5} fill={look.light} />
          <Ellipse cx={66} cy={38} rx={9} ry={5} fill={look.light} />
          <Path d="M6 49 Q16 41 30 42.5 Q42 43 47 49 Q50 51 53 49 Q58 43 70 42.5 Q84 41 94 49 Q88 60 72 60 Q56 61 50 56 Q44 61 28 60 Q12 60 6 49 Z" fill={MASK} />
          <Path d="M50 44 L47.6 33 Q50 30.5 52.4 33 Z" fill={MASK} />
          <Ellipse cx={50} cy={62} rx={11} ry={8} fill={look.light} />
        </G>
      );
    case 'owl':
      // A heart-shaped cream face disc, and a few feather marks on the crown.
      return (
        <G>
          <Path d="M50 37 C44 31 23 31 22 48 C21 63 37 70 50 66 C63 70 79 63 78 48 C77 31 56 31 50 37 Z" fill={look.light} />
          <Path d="M43 24 Q46 26.5 49 24 M51 24 Q54 26.5 57 24 M38 30 Q41 32.5 44 30 M56 30 Q59 32.5 62 30" stroke={look.ear} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'frog':
      // A pale wide chin.
      return <Path d="M8 60 Q30 66.5 50 66.5 Q70 66.5 92 60 L92 80 L8 80 Z" fill={look.light} />;
    case 'redpanda':
      return (
        <G>
          {/* white brow spots, a white mask round the muzzle and cheeks, and the rusty tear marks */}
          <Ellipse cx={35} cy={38.5} rx={5.5} ry={3.8} fill={look.light} />
          <Ellipse cx={65} cy={38.5} rx={5.5} ry={3.8} fill={look.light} />
          <Path d="M8 55 Q16 49 26 53 Q36 57 42 55 Q46 52 50 53 Q54 52 58 55 Q64 57 74 53 Q84 49 92 55 L92 80 L8 80 Z" fill={look.light} />
          <Path d="M32.5 57.5 Q33 61.5 35 64.5 M67.5 57.5 Q67 61.5 65 64.5" stroke={RP_TEAR} strokeWidth={3.4} strokeLinecap="round" fill="none" opacity={0.6} />
        </G>
      );
    case 'alpaca':
      return <Ellipse cx={50} cy={61.5} rx={12} ry={9} fill={look.light} />;
    default:
      return null;
  }
}

// In front of the face (after the eyes and nose).
export function GuestFront({ kind, look, t }: { kind: GuestKind; look: Look; t: number }) {
  switch (kind) {
    case 'owl':
      // A little gold beak; it opens a touch while straining. Feather chevrons on the tummy.
      return (
        <G>
          <Path d={`M45.6 53.5 Q50 51.4 54.4 53.5 L50 ${(61 + 1.5 * t).toFixed(2)} Z`} fill={BEAK} stroke="#D9963E" strokeWidth={1.3} strokeLinejoin="round" />
          <Path d="M45 88 L47.5 90.5 L50 88 L52.5 90.5 L55 88 M46.5 94 L48.5 96 L50.5 94 L52.5 96 L54.5 94" stroke={look.ear} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>
      );
    case 'frog':
      // A wide frog smile (Face skips its own mouth).
      return <Path d="M39 60.5 Q50 68.5 61 60.5" stroke={LINE} strokeWidth={1.9} strokeLinecap="round" fill="none" />;
    case 'alpaca':
      // The fluffy white topknot over the forehead; it bounces while straining.
      return (
        <G transform={`translate(0 ${(-1.5 * t).toFixed(2)})`}>
          <Puffs pts={[[39, 23], [45, 17.5], [52, 15.5], [58.5, 19], [62, 25], [50, 25.5], [43.5, 27], [56, 27.5]]} r={6.5} fill={WOOL} />
        </G>
      );
    default:
      return null;
  }
}

// The nose (Face draws it after the eyes); null for the owl, whose beak is in GuestFront.
export function GuestNose({ kind }: { kind: GuestKind }) {
  switch (kind) {
    case 'owl':
      return null;
    case 'frog':
      return (
        <G fill="#6F9E62">
          <Ellipse cx={47} cy={56} rx={1.1} ry={0.8} />
          <Ellipse cx={53} cy={56} rx={1.1} ry={0.8} />
        </G>
      );
    case 'alpaca':
      return (
        <G>
          <Ellipse cx={50} cy={56} rx={3.6} ry={2.6} fill="#8A5A4C" />
          <Ellipse cx={49} cy={55.2} rx={1.1} ry={0.6} fill="#FFFFFF" opacity={0.8} />
        </G>
      );
    default:
      // A small dark button nose with a shine.
      return (
        <G>
          <Ellipse cx={50} cy={56.2} rx={4} ry={2.9} fill="#4A3A3E" />
          <Ellipse cx={48.8} cy={55.2} rx={1.2} ry={0.7} fill="#FFFFFF" opacity={0.8} />
        </G>
      );
  }
}

// Kinds that draw their own mouth (the owl's beak), and whose eyes sit on a dark mask (drawn white when shut).
export const guestNoMouth = (kind: string) => kind === 'owl' || kind === 'frog';
export const guestOnDark = (kind: string) => kind === 'raccoon';
// Kinds with their own crown (spines, tufts, topknot, eye bumps), so they skip the guest's little hair tuft.
export const guestNoTuft = (kind: string) => kind === 'hedgehog' || kind === 'owl' || kind === 'frog' || kind === 'alpaca';

// ---- Guest trims: a small extra a guest may wear, picked per guest (see guestTrim in game.ts) ----

const heart = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy + r * 0.95} C${cx - r * 1.35} ${cy + r * 0.05} ${cx - r * 1.05} ${cy - r * 1.15} ${cx} ${cy - r * 0.45} C${cx + r * 1.05} ${cy - r * 1.15} ${cx + r * 1.35} ${cy + r * 0.05} ${cx} ${cy + r * 0.95} Z`;

// Where a pin sits on the right of the bare head: by the ear, a little lower on the animals with tall ears or crowns.
const PIN: Record<string, [number, number]> = {
  rabbit: [66, 22],
  duck: [66, 18],
  hedgehog: [70, 30],
  frog: [74, 33],
  alpaca: [66, 30],
  seaotter: [70, 24],
  chick: [67, 21],
  owl: [70, 30],
};

function Bow({ x, y, color, knot }: { x: number; y: number; color: string; knot: string }) {
  return (
    <G transform={rot(-18, x, y)} stroke={LINE} strokeWidth={1.4} strokeLinejoin="round">
      <Path d={`M${x} ${y} L${x - 9.5} ${y - 6} Q${x - 11.5} ${y} ${x - 9.5} ${y + 6} Z M${x} ${y} L${x + 9.5} ${y - 6} Q${x + 11.5} ${y} ${x + 9.5} ${y + 6} Z`} fill={color} />
      <Circle cx={x} cy={y} r={3} fill={knot} strokeWidth={1.2} />
    </G>
  );
}

export function GuestTrim({ trim, kind }: { trim: string; kind: string }) {
  const [x, y] = PIN[kind] ?? [69, 24];
  // The puppy guest already wears its own pink bow, so it only ever puts on glasses.
  if (kind === 'dog' && trim !== 'glasses') return null;
  switch (trim) {
    case 'bow':
      return <Bow x={x} y={y} color="#F7A3B6" knot="#F28CA3" />;
    case 'mintbow':
      return <Bow x={x} y={y} color="#A6DCCB" knot="#7FC7B1" />;
    case 'flower': {
      const petals = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return [x + Math.cos(a) * 4.7, y + Math.sin(a) * 4.7];
      });
      return (
        <G stroke={LINE} strokeWidth={1.2}>
          {petals.map(([px, py], i) => (
            <Circle key={i} cx={px} cy={py} r={3.8} fill="#FFFFFF" />
          ))}
          <Circle cx={x} cy={y} r={3} fill="#FFD25C" />
        </G>
      );
    }
    case 'heart':
      return (
        <G>
          <Path d={heart(x, y, 6)} fill="#FF8FA8" stroke={LINE} strokeWidth={1.4} strokeLinejoin="round" />
          <Ellipse cx={x - 2.4} cy={y - 2.1} rx={1.3} ry={0.8} fill="#FFFFFF" opacity={0.85} />
        </G>
      );
    case 'glasses':
      // Round reading glasses, thin and light so the eyes still show.
      return (
        <G stroke="#9A6A4C" strokeWidth={1.8} fill="rgba(255,255,255,0.18)">
          <Circle cx={37} cy={50} r={9} />
          <Circle cx={63} cy={50} r={9} />
          <Path d="M46 49 Q50 46.5 54 49" fill="none" />
        </G>
      );
    default:
      return null;
  }
}
