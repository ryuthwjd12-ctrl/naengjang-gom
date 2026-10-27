import { useEffect, useId, useRef, useState } from 'react';
import { Animated, Platform, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { GUEST_HEADS, GUEST_LOOK, GUEST_SPECIES, GuestBack, GuestEars, GuestFront, GuestKind, GuestMarkings, GuestNose, GuestTrim, guestNoMouth, guestNoTuft, guestOnDark, isGuestKind } from './GuestAnimals';

// JS-driven everywhere: these views mix JS-driven positions with transforms, and the two drivers can't share a view.
const native = false;

// Adding an animal: add it to Species, map its emoji in SPECIES, give it colours in LOOK, and (if it needs them) a case
// in Back, Ears, Markings, Front, Tail and Face. Animals share the 100-unit round head (HEAD: x 14-86, y 16-74) unless
// HEAD_SHAPES gives them their own silhouette (headFor), which keeps the same hat seat and face area; they share the
// chef hat and apron, and Accessory places outfits against that hat and face, so outfits work on a new animal without
// changes. Markings are clipped to the animal's head, so patches and stripes can be drawn loosely.
// Every part takes t (0-1), how far into its strain flourish the baker is: 0 when calm, so a still drawing is unchanged.
export type Species =
  | 'bear' | 'rabbit' | 'chick' | 'hamster' | 'cat' | 'fox' | 'panda' | 'koala' | 'dog' | 'lion' | 'tiger'
  | 'elephant' | 'wolf' | 'sheep' | 'deer' | 'pig' | 'squirrel'
  | 'otter'
  | 'seaotter'
  | 'duck'
  | 'penguin'
  | 'unicorn'
  // Premium (sold for won in the ✨ store): drawn like the rest, plus special motions (see Special.tsx).
  | 'dragon'
  // Guest-only animals, drawn in GuestAnimals.tsx.
  | GuestKind;

const SPECIES: Record<string, Species> = {
  '🐻': 'bear', '🐰': 'rabbit', '🐥': 'chick', '🐹': 'hamster', '🐱': 'cat', '🦊': 'fox',
  '🐼': 'panda', '🐨': 'koala', '🐶': 'dog', '🦁': 'lion', '🐯': 'tiger',
  '🐘': 'elephant', '🐺': 'wolf', '🐑': 'sheep', '🦌': 'deer', '🐷': 'pig',
  '🐿️': 'squirrel', '🐿': 'squirrel',
  '🦦': 'otter',
  // No emoji for the sea otter (🦦 is the river otter), so its buddy uses this plain id as its drawing key.
  seaotter: 'seaotter',
  '🦆': 'duck',
  '🐧': 'penguin',
  '🦄': 'unicorn',
  // The baby dragon is drawn by the plain id key 'dragon' (🐉 is a grown-up dragon), shown as 🐉 in text.
  dragon: 'dragon',
  ...GUEST_SPECIES,
};

// The species an emoji or id key draws as (premium special motions are picked per species).
export function speciesOf(face: string): Species {
  return SPECIES[face] ?? 'bear';
}

// fur: main colour, light: muzzle/belly, ear: inner ear, limb: arms and feet, body: the body when it differs from the head
type Look = { fur: string; light: string; ear: string; limb?: string; body?: string };
const LOOK: Record<Species, Look> = {
  bear: { fur: '#E9C69C', light: '#FFF1DE', ear: '#F7B6BE' },
  rabbit: { fur: '#FFF8EC', light: '#FFFFFF', ear: '#F7B6BE' },
  chick: { fur: '#FFE58A', light: '#FFF6D6', ear: '#FFE58A' },
  hamster: { fur: '#EDB57A', light: '#FFF4E4', ear: '#DDB0B3', limb: '#FFCFCB' },
  cat: { fur: '#99979F', light: '#FFF6E4', ear: '#F7B6BE', limb: '#FFF6E4' }, // grey-and-cream tuxedo, cream paws
  fox: { fur: '#F8BA86', light: '#FFF6EC', ear: '#FFF0E2' },
  panda: { fur: '#FFFDF8', light: '#FFFFFF', ear: '#6A5A5E', limb: '#6A5A5E' },
  koala: { fur: '#CDD3DE', light: '#F7F8FB', ear: '#FCFAFD' },
  // dog: a white terrier x maltese puppy (pointed westie ears, maltese fluff).
  dog: { fur: '#FFFCF6', light: '#FFF0E0', ear: '#F7B6BE' },
  // lion: a baby cub (no mane yet): soft pale golden fur, a scruffy tuft, cream muzzle, ears with dark backs.
  lion: { fur: '#FADA9F', light: '#FFF7E8', ear: '#FFF1DE' },
  tiger: { fur: '#FFCB8E', light: '#FFF8EE', ear: '#FFF8EE' },
  elephant: { fur: '#CCD5EA', light: '#E9EEF8', ear: '#F8C6D0' },
  wolf: { fur: '#BCC5D6', light: '#F7F8FC', ear: '#F7C4CF' },
  sheep: { fur: '#FCE4D2', light: '#FFF6EE', ear: '#F7B6BE', body: '#FFFFFF', limb: '#F0CDB5' },
  deer: { fur: '#E0A97C', light: '#FFF4E6', ear: '#F7B6BE' },
  pig: { fur: '#FFD6DC', light: '#FFEAEE', ear: '#F7A9B8' },
  squirrel: { fur: '#EDB383', light: '#FFF0DF', ear: '#FFE3CC' },
  // otter: a baby river otter, sleek warm cocoa with a cream chin, throat and whisker pads.
  otter: { fur: '#C99872', light: '#FFF3E2', ear: '#F0B4A6' },
  // seaotter: a baby sea otter, a round fuzzy pale cream head sitting on a soft taupe body.
  seaotter: { fur: '#FBE9D2', light: '#BDAA9C', ear: '#F4BFC0', body: '#A89485', limb: '#A89485' },
  // duck: a cream-white duckling with a wide orange bill and webbed feet (not the yellow chick).
  duck: { fur: '#FFF8EA', light: '#FFFFFF', ear: '#FFF8EA' },
  // penguin: a chubby baby penguin, soft blue-grey back and head, a white heart-shaped face and belly, orange beak and feet.
  penguin: { fur: '#8C9DC3', light: '#FFFFFF', ear: '#F7B6BE' },
  // unicorn: a chubby baby unicorn (premium), cream-white with a pastel rainbow mane and tail, a little gold horn and hooves.
  unicorn: { fur: '#FFFBF5', light: '#FFEFF3', ear: '#F9C3D2' },
  // dragon: a chubby baby dragon, soft mint with a cream belly and snout, lilac wings and fins.
  dragon: { fur: '#BDE8D2', light: '#FFF4DC', ear: '#DCCBF5' },
  ...GUEST_LOOK,
};

const LINE = '#C9A27E'; // soft warm outline, like a pastel sticker
const SW = 2.2;
const EYE = '#3B2418';
const PINK = '#F4A3AE';
const SHIRTS = ['#A9CDEB', '#F8BFCB', '#B9E2C5', '#F8DE96', '#D2C3F0', '#F7C2A2'];
const HEAD = 'M50 16 C74 16 86 31 86 48 C86 65 71 74 50 74 C29 74 14 65 14 48 C14 31 26 16 50 16 Z';

// Per-species head silhouettes, so the animals that aren't naturally round don't all share one ball. Each shape is its
// top centre and the right half as cubic segments [control 1, control 2, end] running clockwise down to the chin at
// x 50; the left half mirrors it. They all keep the hat seat (y 16-20 under the band, x 36-64) and the face area
// (eyes y 44-57 at x 31-69, chin near y 74) where HEAD has them, so the chef hat, apron and outfits still fit.
// Animals without an entry use HEAD.
type Pt = [number, number];
type HeadShape = { top: number; right: [Pt, Pt, Pt][] };
const HEAD_SHAPES: Partial<Record<Species, HeadShape>> = {
  // A puppy: a little wider than tall, gently pointed cheeks and a soft squarish chin (its edge is drawn fluffy).
  dog: {
    top: 16,
    right: [
      [[73, 16], [85, 27], [86.5, 41]],
      [[87.5, 50], [90, 57], [88, 63.5]],
      [[85, 71.5], [71, 75], [50, 75]],
    ],
  },
  // A classic cat head: a flatter top, wide, with soft points at the cheeks.
  cat: {
    top: 18,
    right: [
      [[71, 18], [84, 25], [86, 39]],
      [[87, 46], [88, 51], [91, 56]],
      [[88.5, 60.5], [86.5, 64.5], [82, 68]],
      [[74, 73.5], [63, 74.5], [50, 74.5]],
    ],
  },
  // A tiger cub: wide, with a two-point ruff of cheek fur.
  tiger: {
    top: 16,
    right: [
      [[73, 16], [84.5, 26], [85.5, 40]],
      [[86.5, 45], [88, 48], [90.5, 50]],
      [[88.5, 52], [87.5, 53], [86.8, 54]],
      [[88, 56], [88.8, 58], [89, 60]],
      [[86, 69], [71, 74.5], [50, 74.5]],
    ],
  },
  // A river otter: a broad, flat-topped head, widest low down at the cheeks.
  otter: {
    top: 19,
    right: [
      [[71, 19], [84, 24], [87.5, 37]],
      [[89.5, 45], [90.5, 54], [87.5, 62]],
      [[83, 71.5], [69, 74.5], [50, 74.5]],
    ],
  },
  // A duckling: a taller egg, a soft domed forehead rising above the hat seat, round full cheeks below.
  duck: {
    top: 11,
    right: [
      [[67, 11], [79.5, 24], [81.5, 39]],
      [[84, 57], [73, 74.5], [50, 74.5]],
    ],
  },
  // A squirrel: a pear, narrower at the crown and swelling into chubby low cheeks.
  squirrel: {
    top: 16,
    right: [
      [[66, 16], [77, 24], [79.5, 35]],
      [[81.5, 43], [87.5, 49], [87.5, 59]],
      [[87.5, 69.5], [72, 74.5], [50, 74.5]],
    ],
  },
  // A piglet: a wider oval.
  pig: {
    top: 17,
    right: [
      [[76, 17], [89, 30], [89, 47]],
      [[89, 65], [73, 74.5], [50, 74.5]],
    ],
  },
  ...GUEST_HEADS,
};
type Cubic = [Pt, Pt, Pt, Pt];
// The whole outline as cubics, clockwise from the top centre.
function headCubics(shape: HeadShape): Cubic[] {
  const right: Cubic[] = [];
  let p: Pt = [50, shape.top];
  for (const [c1, c2, end] of shape.right) {
    right.push([p, c1, c2, end]);
    p = end;
  }
  const m = ([x, y]: Pt): Pt => [100 - x, y];
  const left = right
    .slice()
    .reverse()
    .map(([a, b, c, d]): Cubic => [m(d), m(c), m(b), m(a)]);
  return [...right, ...left];
}
const fmt = (n: number) => +n.toFixed(2);
const HEAD_PATHS: Partial<Record<Species, string>> = {};
for (const k of Object.keys(HEAD_SHAPES) as Species[]) {
  const cubics = headCubics(HEAD_SHAPES[k]!);
  HEAD_PATHS[k] =
    `M50 ${HEAD_SHAPES[k]!.top} ` + cubics.map(([, b, c, d]) => `C${[b, c, d].map((q) => q.map(fmt).join(' ')).join(' ')}`).join(' ') + ' Z';
}
// The head outline for an animal: its own silhouette, or the shared round HEAD.
function headFor(kind: Species) {
  return HEAD_PATHS[kind] ?? HEAD;
}
// How far the top of an animal's head sits below HEAD's (things perched on the crown move with it).
function headDrop(kind: Species) {
  return (HEAD_SHAPES[kind]?.top ?? 16) - 16;
}
// s 0-1 round an animal's head outline, clockwise from the top, spaced evenly along its length (for fluffy edges).
function headEdgeAt(kind: Species): (s: number) => { x: number; y: number; nx: number; ny: number } {
  const shape = HEAD_SHAPES[kind];
  const cubics = shape
    ? headCubics(shape)
    : headCubics({ top: 16, right: [[[74, 16], [86, 31], [86, 48]], [[86, 65], [71, 74], [50, 74]]] });
  const N = 80;
  const samples: { x: number; y: number; tx: number; ty: number; len: number }[] = [];
  let len = 0;
  for (const [a, b, c, d] of cubics) {
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const v = 1 - u;
      const at = (k: 0 | 1) => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k];
      const tan = (k: 0 | 1) => 3 * v * v * (b[k] - a[k]) + 6 * v * u * (c[k] - b[k]) + 3 * u * u * (d[k] - c[k]);
      const x = at(0);
      const y = at(1);
      const prev = samples[samples.length - 1];
      if (prev) len += Math.hypot(x - prev.x, y - prev.y);
      samples.push({ x, y, tx: tan(0), ty: tan(1), len });
    }
  }
  len += Math.hypot(samples[0].x - samples[samples.length - 1].x, samples[0].y - samples[samples.length - 1].y);
  return (s: number) => {
    const target = (((s % 1) + 1) % 1) * len;
    let lo = 0;
    let hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (samples[mid].len <= target) lo = mid;
      else hi = mid - 1;
    }
    const q = samples[lo];
    const l = Math.hypot(q.tx, q.ty) || 1;
    return { x: q.x, y: q.y, nx: q.ty / l, ny: -q.tx / l };
  };
}
// Tiger stripes and wool.
const STRIPE = '#E39256';
// The lion cub's scruffy tuft and tail tip, the dark backs of its ears, and its faint baby spots and pink-brown nose.
const CUB_TUFT = '#F3BC78';
const CUB_EAR = '#E0A468';
const CUB_SPOT = '#EDB77D';
const CUB_NOSE = '#D98F86';
const WOOL = '#FFFFFF';
const ANTLER = '#F3DDB8';
const SPOT = '#FFFDF8'; // the fawn's white spots
const KOALA_NOSE = '#5E5562';
const EUCALYPTUS = '#A9D3BF';
// The squirrel's bushy tail, forehead stripes and acorn.
const SQ_TAIL = '#E2A06C';
const SQ_FLUFF = '#F4C9A0';
const SQ_STRIPE = '#B07246';
// The river otter's nose, whiskers and little fish.
const OTTER_NOSE = '#4A3430';
const OTTER_WHISKER = '#B08A6E';
const OTTER_FISH = '#A9D4EE';
// The sea otter's bead eyes and nose. SO_BEAD: small wide-set bead eyes instead of the shared big shiny ones.
const SO_BEAD = true;
const SO_EYE = '#33252A';
// The chick's beak, and CHICK_BEAD: small wide-set bead eyes instead of the shared big shiny ones.
const CHICK_BEAK = '#F9A65A';
const CHICK_BEAK_LINE = '#E0955A';
const CHICK_BEAD = true;
// The duck's bill and webbed feet, and the baker duck's little sailor scarf.
const DUCK_BILL = '#FFB55E';
const DUCK_BILL_DARK = '#F39A45';
const SAILOR = '#8EC3EA';
const DOG_CROWN = 'M28.3 21.5 C33.9 18.05 41.1 16 50 16 C58.9 16 66.1 18.05 71.7 21.5'; // the head's top edge between the ears

export function shirtFor(seed: number) {
  return SHIRTS[seed % SHIRTS.length];
}

export type Mood = 'normal' | 'happy' | 'shock' | 'sleepy' | 'effort';

// Premium characters' special motions in the Kitchen (Special.tsx draws the effects around the baker):
// oven: while something bakes; out: a short burst when an item comes out; cheer: the done celebration.
// u (0-1) is how far into one loop of the motion; specialPhase splits it into a breath in and a puff out,
// so the face (Character) and the effect (Special.tsx) stay in time.
export type SpecialMoment = 'oven' | 'out' | 'cheer';
export type Special = { moment: SpecialMoment; u: number };
export function specialPhase({ moment, u }: Special) {
  // oven: a long breath in, a long blow; out and cheer: a quick breath in and a short puff.
  const [inEnd, blowEnd] = moment === 'oven' ? [0.3, 0.85] : [0.3, 0.55];
  const cheek = u < inEnd ? Math.sin((u / inEnd) * Math.PI * 0.5) : u < inEnd + 0.08 ? 1 - (u - inEnd) / 0.08 : 0;
  const blowing = u >= inEnd && u < blowEnd;
  // 0 → 1 → 0 over the blow: quick to start, holds, then trails off.
  const b = (u - inEnd) / (blowEnd - inEnd);
  const strength = !blowing ? 0 : Math.min(1, b / 0.18, (1 - b) / 0.25);
  return { cheek, blowing, strength, b: Math.min(1, Math.max(0, b)) };
}
// grip: no paws drawn; Hands draws them on top, wrapped around a tool.
export type Pose = 'stand' | 'wave' | 'cheer' | 'hold' | 'grip';

// While straining (the Kitchen's hard prep steps) each animal adds its own little flourish on top of the shared shake
// and sweat: ears flop, the trunk curls, the mane puffs, the pig snorts. true runs it; a number freezes it at that point.
function useStrain(strain: boolean | number | undefined) {
  const [t, setT] = useState(0);
  const live = strain === true;
  useEffect(() => {
    if (!live) {
      setT(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => setT(0.5 - 0.5 * Math.cos(((Date.now() - start) / 700) * Math.PI * 2)), 60);
    return () => clearInterval(id);
  }, [live]);
  return typeof strain === 'number' ? strain : live ? t : 0;
}

// Pastel chibi: big round head on a small chubby body, big glossy eyes, blush and pink paw pads.
// The bakers bought with gold get their signature extras (a tail, the cat's bell) only in the baking look (apron),
// so the guest of the same animal stays plainer.
export function Character({
  face,
  size = 30,
  apron,
  shirt,
  walking,
  sitting,
  mood = 'normal',
  wear = '',
  pose = 'stand',
  strain,
  special,
  trim = '',
}: {
  face: string;
  size?: number;
  apron?: boolean;
  shirt?: string;
  walking?: boolean;
  sitting?: boolean;
  mood?: Mood;
  wear?: string;
  pose?: Pose;
  strain?: boolean | number;
  // A premium character's special motion (see SpecialMoment); other animals ignore it.
  special?: Special | null;
  // A guest's small extra (bow, glasses, flower...; see GuestTrim), only drawn without the apron.
  trim?: string;
}) {
  const kind: Species = SPECIES[face] ?? 'bear';
  const look = LOOK[kind];
  const step = useRef(new Animated.Value(0)).current;
  const t = useStrain(strain);
  const clip = 'head' + useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    if (!walking) {
      step.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(step, { toValue: 1, duration: 180, useNativeDriver: native }),
        Animated.timing(step, { toValue: -1, duration: 360, useNativeDriver: native }),
        Animated.timing(step, { toValue: 0, duration: 180, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [walking]);

  const w = size * 1.45;
  const h = (w * 134) / 112;
  const rotate = step.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });
  const lift = step.interpolate({ inputRange: [-1, 0, 1], outputRange: [-3, 0, -3] });
  const limb = look.limb ?? look.fur;
  const s = { stroke: LINE, strokeWidth: SW };
  const feet = kind === 'chick' ? '#F7B26A' : kind === 'duck' ? DUCK_BILL : kind === 'penguin' ? PG_ORANGE : limb;

  return (
    <Animated.View style={{ width: w, height: h, transform: [{ translateY: lift }, { rotate }, ...(kind === 'penguin' ? penguinWobble(t) : [])] }}>
      <Svg width={w} height={h} viewBox="-6 -22 112 134">
        <Defs>
          <ClipPath id={clip}>
            <Path d={headFor(kind)} />
          </ClipPath>
        </Defs>
        {/* the dragon's wings sit behind its tail */}
        {kind === 'dragon' && <DragonWings look={look} t={t} />}
        {/* the dog shows its tail as a guest too */}
        {(apron || kind === 'dog') && <Tail kind={kind} look={look} t={t} />}
        {/* feet with paw pads */}
        {!sitting && kind === 'duck' && <DuckFeet />}
        {!sitting && kind === 'penguin' && <PenguinFeet />}
        {!sitting && kind !== 'duck' && kind !== 'penguin' && (
          <G>
            <Ellipse cx={39} cy={105} rx={9} ry={5.5} fill={feet} {...s} />
            <Ellipse cx={61} cy={105} rx={9} ry={5.5} fill={feet} {...s} />
            {kind !== 'chick' && kind !== 'unicorn' && <Ellipse cx={39} cy={106} rx={3.6} ry={2.4} fill={PINK} />}
            {kind !== 'chick' && kind !== 'unicorn' && <Ellipse cx={61} cy={106} rx={3.6} ry={2.4} fill={PINK} />}
          </G>
        )}
        {!sitting && kind === 'unicorn' && <UnicornHooves />}
        {/* raised arms run from the shoulder, behind the body, up to the paw so they stay attached */}
        {(pose === 'wave' || pose === 'cheer') && <RaisedArm side={1} fill={limb} />}
        {pose === 'cheer' && <RaisedArm side={-1} fill={limb} />}
        {sitting && (
          <G>
            <Ellipse cx={37} cy={104} rx={8} ry={7} fill={feet} {...s} />
            <Ellipse cx={63} cy={104} rx={8} ry={7} fill={feet} {...s} />
          </G>
        )}
        {/* chubby body */}
        <Path d="M33 72 C27 84 27 104 50 104 C73 104 73 84 67 72 Z" fill={look.body ?? look.fur} {...s} strokeLinejoin="round" />
        {kind === 'chick' ? (
          // the chick's pale tummy is bigger, like a baby chick's soft front
          <Ellipse cx={50} cy={91} rx={14} ry={11.5} fill={look.light} />
        ) : (
          <Ellipse cx={50} cy={92} rx={11} ry={9} fill={kind === 'sheep' ? '#FFF8F0' : look.light} />
        )}
        {kind === 'penguin' && <PenguinBelly />}
        {kind === 'dragon' && <DragonBelly />}
        <Ellipse cx={50} cy={74} rx={15} ry={3.5} fill="#8A5A3C" opacity={0.12} />
        {apron ? <Apron berry={wear === 'strawapron'} /> : kind !== 'chick' && <Scarf color={shirt ?? SHIRTS[0]} />}
        {apron && <Scarf color="#F28C8C" />}
        {apron && kind === 'squirrel' && pose === 'stand' && <Acorn />}
        {apron && kind === 'otter' && pose === 'stand' && <OtterFish t={t} />}
        {apron && kind === 'seaotter' && <Shell hug={pose === 'stand'} t={t} />}
        {apron && kind === 'duck' && <SailorScarf />}
        {kind === 'duck' && <DuckWings look={look} t={t} pose={pose} />}
        {kind === 'penguin' && <PenguinFlippers look={look} t={t} pose={pose} />}
        {/* paws resting on the tummy (raised paws are drawn behind the head above); the chick has wing nubs instead */}
        {WINGED.includes(kind) ? null : kind === 'hamster' && pose === 'stand' ? (
          <HamsterPaws />
        ) : (
          <G fill={limb} {...s}>
            {kind !== 'chick' && (pose === 'stand' || pose === 'wave') && <Ellipse cx={36} cy={84} rx={6} ry={8} transform="rotate(25 36 84)" />}
            {kind !== 'chick' && pose === 'stand' && <Ellipse cx={64} cy={84} rx={6} ry={8} transform="rotate(-25 64 84)" />}
          </G>
        )}
        <Back kind={kind} t={t} />
        <Ears kind={kind} look={look} t={t} apron={apron} />
        {kind === 'dragon' && special && <DragonCheeks look={look} puff={specialPhase(special).cheek} />}
        {/* big head, in the animal's own silhouette (headFor) */}
        {/* the sea otter's and dog's outlines are their fluffy edges (drawn in Back) instead of the smooth one */}
        <Path d={headFor(kind)} fill={look.fur} {...(kind === 'seaotter' || kind === 'dog' ? {} : s)} />
        <G clipPath={`url(#${clip})`}>
          <Markings kind={kind} look={look} />
        </G>
        {kind !== 'rabbit' && kind !== 'chick' && kind !== 'panda' && kind !== 'sheep' && kind !== 'squirrel' && kind !== 'duck' && kind !== 'unicorn' && kind !== 'dragon' && !guestNoTuft(kind) && !apron && (
          <Path d="M45 18 Q47 12 50 17 Q53 11 55 18" transform={`translate(0 ${headDrop(kind)})`} fill={look.fur} stroke={LINE} strokeWidth={1.6} strokeLinejoin="round" />
        )}
        <Face kind={kind} mood={mood} t={t} special={special} />
        <Front kind={kind} look={look} t={t} apron={apron} />
        {pose === 'hold' && WINGED.includes(kind) && [41, 59].map((cx) => <WingReach key={cx} to={[cx, 71]} fur={look.fur} />)}
        {pose === 'hold' && !WINGED.includes(kind) && (
          <G fill={limb} stroke={LINE} strokeWidth={SW}>
            <Ellipse cx={41} cy={71} rx={6.5} ry={5.5} />
            <Ellipse cx={59} cy={71} rx={6.5} ry={5.5} />
          </G>
        )}
        {apron && kind === 'duck' && <DuckLick look={look} t={t} />}
        {kind === 'dragon' && <DragonSnort t={t} />}
        {apron && <ChefHat />}
        {/* the unicorn's horn stands in front of the hat and its band outfits, except the pins worn over the horn's tip */}
        {kind === 'unicorn' && UNI_PINS.includes(wear) && <UnicornHorn t={t} apron={apron} />}
        {wear !== '' && <Accessory wear={wear} />}
        {kind === 'unicorn' && !UNI_PINS.includes(wear) && <UnicornHorn t={t} apron={apron} />}
        {!apron && trim !== '' && <GuestTrim trim={trim} kind={kind} />}
        {sitting && kind !== 'chick' && kind !== 'duck' && kind !== 'penguin' && kind !== 'unicorn' && (
          <G fill={PINK}>
            <Ellipse cx={37} cy={106} rx={3.6} ry={3} />
            <Ellipse cx={63} cy={106} rx={3.6} ry={3} />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}

// Tools the baker holds. The last four are carried to and from the oven.
export type Tool =
  | 'spoon'
  | 'whisk'
  | 'spatula'
  | 'chips'
  | 'pin'
  | 'wheel'
  | 'knead'
  // a strip of pie dough, laid across the filling for the lattice
  | 'strip'
  | 'cutter'
  | 'ring'
  | 'scoop'
  | 'piping'
  | 'pour'
  // ingredients tipped or dropped in by hand
  | 'milk'
  | 'egg'
  | 'sugar'
  | 'butter'
  | 'flour'
  | 'berry'
  | 'yeast'
  // a baked macaron shell, pressed on top of the filling
  | 'shell'
  | 'tray'
  | 'pan'
  | 'dish'
  | 'tin';

// What sits on a carried tray: plain rounds, chocolate-chip rounds, flower-shaped butter cookies, pairs of pink
// macaron shells, rings (donuts) or crescents.
export type TrayItem = 'round' | 'chip' | 'flower' | 'macaron' | 'ring' | 'crescent';

// The butter cookie's scalloped flower (Art's 🧈, in its 40-unit box): the cutter, the cut dough and the cookie match.
export const FLOWER_PATH =
  'M20 5 Q24 5 25 8.5 Q28.5 6.5 31 9 Q33.5 11.5 31.5 15 Q35 16 35 20 Q35 24 31.5 25 Q33.5 28.5 31 31 Q28.5 33.5 25 31.5 Q24 35 20 35 Q16 35 15 31.5 Q11.5 33.5 9 31 Q6.5 28.5 8.5 25 Q5 24 5 20 Q5 16 8.5 15 Q6.5 11.5 9 9 Q11.5 6.5 15 8.5 Q16 5 20 5 Z';

// A tool held in both paws, drawn over a Character of the same size (pose 'grip') so the paws wrap the tool.
export function Hands({
  face,
  size = 30,
  tool,
  hot,
  baked,
  item = 'round',
  cream = '#FFF4F0',
  flowing = true,
}: {
  face: string;
  size?: number;
  tool: Tool;
  hot?: boolean;
  baked?: boolean;
  item?: TrayItem;
  cream?: string;
  // pour: whether the batter is running out (not while the bowl is carried over to the pan)
  flowing?: boolean;
}) {
  const kind = SPECIES[face] ?? 'bear';
  const look = LOOK[kind];
  const paw = hot ? '#F2A8B3' : look.limb ?? look.fur; // oven mitts for a hot tray
  const w = size * 1.45;
  const h = (w * 134) / 112;
  const wood = '#D9A46C';
  const woodLine = '#A8714A';
  const metal = '#AEB6BB';
  const metalLine = '#7C858A';
  const raw = '#F6E3B8';
  const rawLine = '#D9BE8C';
  const gold = '#D9964A';
  const goldLine = '#8C5A2B';
  const s = { stroke: LINE, strokeWidth: SW };
  const PAWS: Record<Tool, [number, number][]> = {
    spoon: [[53, 70], [49, 81]],
    whisk: [[65, 56], [61, 66]],
    spatula: [[53, 70], [49, 81]],
    chips: [[38, 72], [60, 66]],
    pin: [[25, 86], [75, 86]],
    wheel: [[56, 72], [51, 82]],
    knead: [[38, 94], [62, 94]],
    strip: [[33, 93], [67, 93]],
    cutter: [[42, 80], [58, 80]],
    ring: [[42, 80], [58, 80]],
    scoop: [[55, 72], [50, 82]],
    piping: [[43, 70], [55, 78]],
    pour: [[28, 80], [70, 86]],
    milk: [[38, 64], [62, 76]],
    egg: [[34, 76], [66, 76]],
    sugar: [[38, 72], [60, 66]],
    butter: [[37, 80], [63, 80]],
    flour: [[40, 70], [62, 74]],
    berry: [[43, 86], [57, 86]],
    yeast: [[41, 70], [59, 64]],
    shell: [[39, 92], [61, 92]],
    tray: [[11, 82], [89, 82]],
    pan: [[13, 84], [87, 84]],
    dish: [[13, 84], [87, 84]],
    tin: [[21, 84], [79, 84]],
  };
  const paws = PAWS[tool];
  const dough = baked ? gold : raw;
  const doughLine = baked ? goldLine : rawLine;
  return (
    <Svg width={w} height={h} viewBox="-6 -22 112 134" pointerEvents="none">
      {tool === 'spoon' && (
        <G>
          {/* the bowl of the spoon is down in the batter: the Kitchen draws the mixing bowl's front wall over it */}
          <Path d="M70 50 L49 99" stroke={woodLine} strokeWidth={7} strokeLinecap="round" />
          <Path d="M70 50 L49 99" stroke={wood} strokeWidth={4.5} strokeLinecap="round" />
          <Ellipse cx={48} cy={103} rx={6} ry={7.5} fill={wood} stroke={woodLine} strokeWidth={1.6} />
        </G>
      )}
      {tool === 'whisk' && (
        <G>
          {/* the balloon goes down into the bowl's opening; its tip is hidden behind the bowl's front wall */}
          <Path d="M70 46 L59 72" stroke={woodLine} strokeWidth={8} strokeLinecap="round" />
          <Path d="M70 46 L59 72" stroke={wood} strokeWidth={5.5} strokeLinecap="round" />
          <G fill="none" stroke={metalLine} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M59 72 C45 78 41 98 48 104 C56 108 65 86 59 72" />
            <Path d="M59 72 C51 84 47 98 50 104" />
            <Path d="M59 72 C59 84 57 96 54 104" />
          </G>
          {/* foam on the wires, where they whip the batter */}
          <Circle cx={46} cy={95} r={3.6} fill="#FFFFFF" stroke={rawLine} strokeWidth={1} />
          <Circle cx={53} cy={97} r={2.8} fill="#FFFFFF" stroke={rawLine} strokeWidth={1} />
        </G>
      )}
      {tool === 'spatula' && (
        <G>
          <Path d="M70 50 L50 94" stroke={woodLine} strokeWidth={7} strokeLinecap="round" />
          <Path d="M70 50 L50 94" stroke={wood} strokeWidth={4.5} strokeLinecap="round" />
          <Rect x={40} y={92} width={15} height={14} rx={5} fill="#F2A8B3" stroke="#C97C88" strokeWidth={1.8} transform="rotate(24 47.5 99)" />
        </G>
      )}
      {tool === 'chips' && (
        <G>
          {/* a little paper bag tipped over the bowl, chips tumbling out */}
          <Path d="M36 58 L62 52 L66 74 L42 82 Z" fill="#E9C9A0" stroke={woodLine} strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M36 58 L62 52" stroke="#B9875A" strokeWidth={3} strokeLinecap="round" />
          <Rect x={46} y={63} width={10} height={8} rx={2} fill="#7A4A2E" transform="rotate(-14 51 67)" />
          <G fill="#5B3A29">
            <Path d="M46 88 l3 -4 l3 4 Z" />
            <Path d="M54 96 l3 -4 l3 4 Z" />
            <Path d="M44 102 l3 -4 l3 4 Z" />
          </G>
        </G>
      )}
      {tool === 'pin' && (
        <G>
          <Rect x={2} y={83} width={104 - 8} height={6} rx={3} fill={woodLine} />
          <Rect x={16} y={79} width={68} height={14} rx={7} fill="#E2B987" stroke={woodLine} strokeWidth={1.6} />
        </G>
      )}
      {tool === 'wheel' && (
        <G>
          {/* pastry wheel: wooden handle, metal wheel */}
          <Path d="M60 64 L48 96" stroke={woodLine} strokeWidth={8} strokeLinecap="round" />
          <Path d="M60 64 L48 96" stroke={wood} strokeWidth={5.5} strokeLinecap="round" />
          <Circle cx={46} cy={102} r={9} fill="#DDE3E6" stroke={metalLine} strokeWidth={2} />
          <Path d="M46 94 L46 110 M38 102 L54 102" stroke={metalLine} strokeWidth={1.4} />
          <Circle cx={46} cy={102} r={2.4} fill={metalLine} />
        </G>
      )}
      {tool === 'cutter' && (
        <G>
          <Rect x={44} y={74} width={12} height={10} rx={3} fill={metal} stroke={metalLine} strokeWidth={1.4} />
          {/* a flower cutter, the same scalloped flower as the butter cookie */}
          <G transform="translate(50 96) scale(0.62) translate(-20 -20)">
            <Path d={FLOWER_PATH} fill="#FFFFFF" fillOpacity={0.35} stroke="#E07A8C" strokeWidth={6} strokeLinejoin="round" />
          </G>
        </G>
      )}
      {tool === 'ring' && (
        <G>
          <Rect x={44} y={74} width={12} height={10} rx={3} fill={metal} stroke={metalLine} strokeWidth={1.4} />
          <Circle cx={50} cy={97} r={12} fill="#FFFFFF" fillOpacity={0.35} stroke="#7FB7D9" strokeWidth={4} />
          <Circle cx={50} cy={97} r={4} fill="none" stroke="#7FB7D9" strokeWidth={3} />
        </G>
      )}
      {tool === 'scoop' && (
        <G>
          <Path d="M60 62 L50 90" stroke={metalLine} strokeWidth={7} strokeLinecap="round" />
          <Path d="M60 62 L50 90" stroke={metal} strokeWidth={4.5} strokeLinecap="round" />
          <Path d="M36 96 A12 12 0 0 0 60 96 Z" fill={metal} stroke={metalLine} strokeWidth={1.8} />
          <Path d="M38 96 A10 9 0 0 1 58 96 Z" fill={raw} stroke={rawLine} strokeWidth={1.4} />
          <Circle cx={45} cy={92} r={1.6} fill="#5B3A29" />
          <Circle cx={51} cy={90} r={1.6} fill="#5B3A29" />
        </G>
      )}
      {tool === 'piping' && (
        <G>
          {/* piping bag pointing down at the tray, a dab of filling at the tip */}
          <Path d="M36 60 L64 64 L52 100 Z" fill={cream} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M38 66 L60 69" stroke="#F2A8B3" strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M49 96 L55 96 L52 104 Z" fill={metal} stroke={metalLine} strokeWidth={1.2} strokeLinejoin="round" />
          <Circle cx={52} cy={108} r={3} fill={cream} stroke={LINE} strokeWidth={1.2} />
        </G>
      )}
      {tool === 'pour' && (
        <G>
          {/* the mixing bowl tipped toward the pan, batter running out */}
          {flowing && <Path d="M66 96 Q72 102 70 112" stroke={raw} strokeWidth={5} strokeLinecap="round" fill="none" />}
          <G transform="rotate(28 48 86)">
            <Path d="M24 80 L72 80 Q70 100 48 101 Q26 100 24 80 Z" fill="#BFE3F7" stroke="#6FA8C8" strokeWidth={2} strokeLinejoin="round" />
            <Ellipse cx={48} cy={80} rx={24} ry={4.5} fill={raw} stroke="#6FA8C8" strokeWidth={2} />
          </G>
        </G>
      )}
      {tool === 'milk' && (
        <G>
          {/* a milk carton tipped over the bowl, a white ribbon of milk running out of the spout */}
          <Path d="M43 84 Q41 94 44 106" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Path d="M43 84 Q41 94 44 106" stroke="#DCE8F0" strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.8} />
          <G transform="rotate(-58 50 70)">
            <Path d="M40 60 L60 60 L60 92 L40 92 Z" fill="#FFFFFF" stroke="#7FA9C9" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M40 60 L50 50 L60 60 Z" fill="#9CCDEB" stroke="#7FA9C9" strokeWidth={1.8} strokeLinejoin="round" />
            <Rect x={40} y={70} width={20} height={9} fill="#9CCDEB" />
            <Circle cx={50} cy={74.5} r={2.6} fill="#FFFFFF" />
          </G>
        </G>
      )}
      {tool === 'egg' && (
        <G>
          {/* an egg cracked in two over the bowl, the yolk dropping in */}
          <Path d="M32 70 Q30 82 41 84 Q46 84 47 78 L44 74 L46 70 Z" fill="#FFF8EC" stroke="#D9BE8C" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M68 70 Q70 82 59 84 Q54 84 53 78 L56 74 L54 70 Z" fill="#FFF8EC" stroke="#D9BE8C" strokeWidth={1.6} strokeLinejoin="round" />
          <Ellipse cx={50} cy={92} rx={5.5} ry={3.4} fill="#FFFFFF" opacity={0.9} />
          <Circle cx={50} cy={91.6} r={3.4} fill="#FFC94A" stroke="#E8A93A" strokeWidth={1.2} />
          <Path d="M50 82 L50 86" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
        </G>
      )}
      {tool === 'sugar' && (
        <G>
          {/* a little sugar bag tipped over, white grains pouring out */}
          <Path d="M36 58 L62 52 L66 74 L42 82 Z" fill="#FBE3E8" stroke="#D98A98" strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M36 58 L62 52" stroke="#E9A7B4" strokeWidth={3} strokeLinecap="round" />
          <Rect x={45} y={63} width={11} height={8} rx={2} fill="#FFFFFF" stroke="#D98A98" strokeWidth={1} transform="rotate(-14 51 67)" />
          <G fill="#FFFFFF" stroke="#E6D6CC" strokeWidth={0.6}>
            <Circle cx={45} cy={85} r={1.8} />
            <Circle cx={50} cy={89} r={1.6} />
            <Circle cx={44} cy={92} r={1.8} />
            <Circle cx={49} cy={95} r={1.5} />
            <Circle cx={53} cy={84} r={1.4} />
          </G>
        </G>
      )}
      {tool === 'butter' && (
        <G>
          {/* a pat of butter held in both paws, a slice dropping off */}
          <Rect x={39} y={70} width={22} height={12} rx={2.5} fill="#F7D891" stroke="#D9A94F" strokeWidth={1.8} />
          <Path d="M41 73 L59 73" stroke="#FFF1C2" strokeWidth={1.6} strokeLinecap="round" />
          <Rect x={45} y={92} width={10} height={7} rx={2} fill="#F7D891" stroke="#D9A94F" strokeWidth={1.4} transform="rotate(14 50 95)" />
        </G>
      )}
      {tool === 'flour' && (
        <G>
          {/* a measuring cup of flour tipped over, a soft white puff falling */}
          <G transform="rotate(-50 52 70)">
            <Path d="M41 62 L63 62 L60 80 L44 80 Z" fill={metal} stroke={metalLine} strokeWidth={1.8} strokeLinejoin="round" />
            <Ellipse cx={52} cy={62} rx={11} ry={2.6} fill="#FFFFFF" stroke={metalLine} strokeWidth={1.4} />
            <Path d="M63 66 L72 66" stroke={metalLine} strokeWidth={3.4} strokeLinecap="round" />
          </G>
          <G fill="#FFFFFF" opacity={0.95}>
            <Circle cx={44} cy={90} r={4} />
            <Circle cx={49} cy={97} r={3.4} />
            <Circle cx={42} cy={101} r={2.6} />
            <Circle cx={51} cy={104} r={2} />
          </G>
        </G>
      )}
      {tool === 'berry' && (
        <G>
          {/* one strawberry held between two paws, about to go on the cake */}
          <Path d="M43 88 Q43 84 50 84 Q57 84 57 88 Q57 96 50 103 Q43 96 43 88 Z" fill="#E8505B" stroke="#B83A44" strokeWidth={1.6} strokeLinejoin="round" />
          <G fill="#FFE07A">
            <Circle cx={47} cy={90} r={0.9} />
            <Circle cx={53} cy={90} r={0.9} />
            <Circle cx={50} cy={95} r={0.9} />
          </G>
          <Path d="M44 84 L47 80 L50 83 L53 80 L56 84 Z" fill="#7DC383" stroke="#4E9A5A" strokeWidth={1.2} strokeLinejoin="round" />
        </G>
      )}
      {tool === 'yeast' && (
        <G>
          {/* a little packet of dry yeast tipped over the bowl, tan granules falling in */}
          <Path d="M40 60 L58 56 L61 72 L44 76 Z" fill="#FFF8EC" stroke="#B9875A" strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M40 60 L58 56" stroke="#C98A3E" strokeWidth={3.4} strokeLinecap="round" />
          <Rect x={45} y={64} width={10} height={6} rx={1.5} fill="#E9D2A6" transform="rotate(-12 50 67)" />
          <G fill="#D9B77E" stroke="#B98F62" strokeWidth={0.5}>
            <Circle cx={46} cy={84} r={1.5} />
            <Circle cx={50} cy={88} r={1.3} />
            <Circle cx={45} cy={92} r={1.5} />
            <Circle cx={49} cy={96} r={1.2} />
            <Circle cx={52} cy={83} r={1.1} />
          </G>
        </G>
      )}
      {tool === 'strip' && (
        <G>
          {/* a strip of pie dough held at both ends, sagging a little, about to go across the filling */}
          <Path d="M28 92 Q50 99 72 92" stroke={rawLine} strokeWidth={7} strokeLinecap="round" fill="none" />
          <Path d="M28 92 Q50 99 72 92" stroke={raw} strokeWidth={5} strokeLinecap="round" fill="none" />
        </G>
      )}
      {tool === 'shell' && (
        <G>
          {/* a baked macaron shell held by its edges, about to go on its filling */}
          <Path d="M40 96 Q40 85 50 85 Q60 85 60 96 Z" fill="#F7A9BC" stroke="#D98A98" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M41 96 L59 96" stroke="#E98DA3" strokeWidth={1.4} strokeDasharray="1.6 1.6" />
          <Ellipse cx={46} cy={89} rx={3} ry={1.2} fill="#FFFFFF" opacity={0.55} />
        </G>
      )}
      {tool === 'tray' && (
        <G>
          {[30, 50, 70].map((cx) => (
            <G key={cx}>
              {item === 'ring' ? (
                // a donut fresh from the fryer: golden, glazed later on the counter
                <G>
                  <Ellipse cx={cx} cy={78} rx={8.5} ry={5} fill={baked ? '#E3AE6E' : raw} stroke={doughLine} strokeWidth={1.2} />
                  <Ellipse cx={cx} cy={77.5} rx={2.6} ry={1.5} fill="#8E979C" />
                </G>
              ) : item === 'crescent' ? (
                <Path d={`M${cx - 9} 80 Q${cx} 70 ${cx + 9} 80 Q${cx} 75 ${cx - 9} 80 Z`} fill={dough} stroke={doughLine} strokeWidth={1.4} strokeLinejoin="round" />
              ) : item === 'macaron' ? (
                // two shells for each macaron
                <G>
                  <Ellipse cx={cx - 4.6} cy={78.5} rx={4.4} ry={3.4} fill={baked ? '#F7A9BC' : '#FBD3DA'} stroke="#D98A98" strokeWidth={1.1} />
                  <Ellipse cx={cx + 4.6} cy={78.5} rx={4.4} ry={3.4} fill={baked ? '#F7A9BC' : '#FBD3DA'} stroke="#D98A98" strokeWidth={1.1} />
                </G>
              ) : (
                <G>
                  <Ellipse cx={cx} cy={78} rx={8} ry={5} fill={baked ? (item === 'flower' ? '#F7D891' : '#E2AE6C') : raw} stroke={baked ? goldLine : rawLine} strokeWidth={1.2} strokeDasharray={item === 'flower' ? '3 1' : undefined} />
                  {item === 'chip' && <Circle cx={cx - 2} cy={77} r={1.6} fill="#5B3A29" />}
                  {item === 'chip' && <Circle cx={cx + 3} cy={79} r={1.4} fill="#5B3A29" />}
                  {item === 'flower' && <Circle cx={cx} cy={77.6} r={1.6} fill="#E8A653" />}
                </G>
              )}
            </G>
          ))}
          <Rect x={8} y={82} width={84} height={7} rx={3} fill="#A7B0B5" stroke="#6E777C" strokeWidth={1.6} />
        </G>
      )}
      {tool === 'pan' && (
        <G>
          {/* round cake pan seen from the side; the sponge domes up once baked */}
          {baked && <Path d="M22 78 Q50 62 78 78 Z" fill={gold} stroke={goldLine} strokeWidth={1.4} />}
          <Rect x={18} y={76} width={64} height={16} rx={3} fill="#C4CBCF" stroke="#6E777C" strokeWidth={1.8} />
          <Rect x={20} y={77} width={60} height={4} rx={2} fill={baked ? gold : raw} />
        </G>
      )}
      {tool === 'dish' && (
        <G>
          {/* pie dish seen from a little above: crust rim, apple filling under a lattice (as on the counter) */}
          <Path d="M15 80 L85 80 L78 92 L22 92 Z" fill="#F4C9A8" stroke="#B9875A" strokeWidth={1.8} strokeLinejoin="round" />
          <Ellipse cx={50} cy={80} rx={35} ry={6.5} fill={dough} stroke={doughLine} strokeWidth={1.4} />
          <Path d="M23 80 Q50 66 77 80 Q50 87 23 80 Z" fill="#F2C76E" stroke="#C99A3E" strokeWidth={1.2} />
          <G stroke={dough} strokeWidth={2.6} strokeLinecap="round">
            <Path d="M32 82 L38 74 M44 83 L50 72 M56 83 L62 73 M67 81 L70 77" />
            <Path d="M27 78 L73 76 M33 82 L68 81" />
          </G>
        </G>
      )}
      {tool === 'tin' && (
        <G>
          {/* loaf tin: three risen rolls of dough going in; once baked a golden 산형 식빵 over the rim */}
          <Path
            d={baked ? 'M26 80 C26 60 42 60 42 69 C42 58 58 58 58 69 C58 60 74 60 74 80 Z' : 'M27 80 C27 64 42 64 42 72 C42 62 58 62 58 72 C58 64 73 64 73 80 Z'}
            fill={dough}
            stroke={doughLine}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <Path d="M24 78 L76 78 L72 94 L28 94 Z" fill="#AEB6BB" stroke="#6E777C" strokeWidth={1.8} strokeLinejoin="round" />
        </G>
      )}
      {WINGED.includes(kind) ? (
        // the penguin and the duck have no paws: their own wings reach out to the tool
        paws.map(([cx, cy], i) => <WingReach key={i} to={[cx, cy]} fur={look.fur} tip={hot ? paw : undefined} />)
      ) : (
        <G fill={paw} {...s}>
          {paws.map(([cx, cy], i) => (
            <Ellipse key={i} cx={cx} cy={cy} rx={6.5} ry={5.5} />
          ))}
        </G>
      )}
    </Svg>
  );
}

// Bakers with wings instead of arms: they hold things with their wings, so no extra paws are drawn for them.
const WINGED: Species[] = ['penguin', 'duck'];

// A wing stretched from its shoulder to a point (a tool's handle, a tray's edge): a tapered flipper with a rounded
// tip. tip: an oven mitt's colour over the tip for a hot tray.
function WingReach({ to: [tx, ty], fur, tip }: { to: [number, number]; fur: string; tip?: string }) {
  const [sx, sy] = [tx < 50 ? 35 : 65, 77];
  const len = Math.hypot(tx - sx, ty - sy) || 1;
  const [dx, dy] = [(tx - sx) / len, (ty - sy) / len];
  const [nx, ny] = [-dy, dx];
  const p = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const [mx, my] = [(sx + tx) / 2, (sy + ty) / 2];
  const d =
    `M${p(sx + nx * 5, sy + ny * 5)} Q${p(mx + nx * 5.5, my + ny * 5.5)} ${p(tx + nx * 3.4, ty + ny * 3.4)}` +
    ` Q${p(tx + dx * 6, ty + dy * 6)} ${p(tx - nx * 3.4, ty - ny * 3.4)}` +
    ` Q${p(mx - nx * 4.5, my - ny * 4.5)} ${p(sx - nx * 5, sy - ny * 5)} Z`;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <G>
      <Path d={d} fill={fur} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
      {tip && <Ellipse cx={tx + dx * 1.5} cy={ty + dy * 1.5} rx={5.5} ry={4.6} fill={tip} stroke={LINE} strokeWidth={SW} transform={`rotate(${deg.toFixed(1)} ${(tx + dx * 1.5).toFixed(1)} ${(ty + dy * 1.5).toFixed(1)})`} />}
    </G>
  );
}

// side 1 is the viewer's right. Outline first, fur on top, then the paw at the end.
function RaisedArm({ side, fill }: { side: 1 | -1; fill: string }) {
  const x = (v: number) => 50 + side * (v - 50);
  const d = `M${x(63)} 81 Q${x(77)} 79 ${x(84)} 68`;
  return (
    <G>
      <Path d={d} stroke={LINE} strokeWidth={10 + SW * 2} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={fill} strokeWidth={10} strokeLinecap="round" fill="none" />
      <Ellipse cx={x(86)} cy={63} rx={6.5} ry={7.5} fill={fill} stroke={LINE} strokeWidth={SW} transform={`rotate(${side * 20} ${x(86)} 63)`} />
    </G>
  );
}

const rot = (a: number, x: number, y: number) => `rotate(${a.toFixed(2)} ${x} ${y})`;

// A thick rounded stroke with the sticker outline around it (tails, the trunk, antlers).
function Limb({ d, fill, width }: { d: string; fill: string; width: number }) {
  return (
    <G fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} stroke={LINE} strokeWidth={width + SW * 2} />
      <Path d={d} stroke={fill} strokeWidth={width} />
    </G>
  );
}

// Puffs (sheep's wool, the dog's tail): outlines first, then the fills, so they merge into one cloud.
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

const ring = (n: number, rx: number, ry: number, from = 0, to = 360) =>
  Array.from({ length: n }, (_, i): [number, number] => {
    const a = ((from + ((to - from) * i) / (n - (to - from === 360 ? 0 : 1))) * Math.PI) / 180;
    return [50 + Math.cos(a) * rx, 47 + Math.sin(a) * ry];
  });

// The lion cub's front: its scruffy tuft (a fringe peeking out under the chef hat, or a little crown of fluff on the
// guest), a pink-brown nose over the shared one, and faint baby spots on its feet (and tummy, on the guest).
// While straining the tuft bristles up and out, with little puff marks.
const CUB_CROWN = 'M37.5 21 Q36 15.5 41.4 14.6 Q41.4 9.6 46.4 10.2 Q48.6 6.4 52.6 8.6 Q57.4 8.2 57.6 12.6 Q63.4 14 62.5 21';
function CubFront({ look, t, apron }: { look: Look; t: number; apron?: boolean }) {
  const s = { stroke: LINE, strokeWidth: 1.8, strokeLinejoin: 'round' as const };
  const k = (1 + 0.14 * t).toFixed(3);
  // Soft rounded locks of fluff, each ending in a little point, the middle ones longest.
  const lens = [25.4, 27.2, 28.4, 27, 25.2];
  let fringe = 'M37.5 18 L37.5 21';
  lens.forEach((len, i) => {
    const x0 = 37.5 + i * 5;
    const y = len + 2.2 * t;
    const tip = x0 + 2.5 + (i % 2 ? 0.7 : -0.7);
    const end = i === lens.length - 1 ? 21 : 23.4 + t;
    fringe += ` Q${x0.toFixed(2)} ${(y - 0.6).toFixed(2)} ${tip.toFixed(2)} ${y.toFixed(2)} Q${(x0 + 5).toFixed(2)} ${(y - 1.2).toFixed(2)} ${(x0 + 5).toFixed(2)} ${end.toFixed(2)}`;
  });
  fringe += ' L62.5 18 Z';
  const spots: [number, number, number][] = [[33.6, 104.4, 1.4], [35.4, 108, 1], [66.4, 104.4, 1.4], [64.6, 108, 1]];
  if (!apron) spots.push([41, 96.5, 1.6], [59, 96.5, 1.6], [45.5, 100.6, 1.1], [54.5, 100.6, 1.1]);
  return (
    <G>
      <G fill={CUB_SPOT} opacity={0.6}>
        {spots.map(([x, y, r], i) => (
          <Circle key={i} cx={x} cy={y} r={r} />
        ))}
      </G>
      <Path d="M46.6 55.3 Q50 53.8 53.4 55.3 Q53 58.2 50 59 Q47 58.2 46.6 55.3 Z" fill={CUB_NOSE} />
      <Ellipse cx={48.7} cy={55.4} rx={1.1} ry={0.6} fill="#FFFFFF" opacity={0.75} />
      <G transform={`translate(50 18) scale(${k}) translate(-50 -18)`}>
        {apron ? (
          <G fill={CUB_TUFT} {...s}>
            {/* wisps poking out at the hat's sides */}
            {[1, -1].map((side) => {
              const x = (v: number) => 50 + side * (v - 50);
              return (
                <Path
                  key={side}
                  d={`M${x(37)} 19.5 Q${x(32)} 19.4 ${x(31.2)} 15 Q${x(33.6)} 16.4 ${x(34.4)} 15.4 Q${x(33.4)} 11.6 ${x(36.4)} 9.6 L${x(37.4)} 12 Z`}
                />
              );
            })}
            <Path d={fringe} />
          </G>
        ) : (
          <G fill={CUB_TUFT} {...s}>
            {/* a little crown of fluff on top, falling into a fringe */}
            <Path d={CUB_CROWN + ' L62.5 23 L37.5 23 Z'} stroke="none" />
            <Path d={fringe.replace('M37.5 18 L37.5 21', 'M37.5 21').replace(' L62.5 18', ' L62.5 21')} stroke="none" />
            <Path d={CUB_CROWN} fill="none" />
            <Path d={fringe.replace('M37.5 18 L37.5 21', 'M37.5 21').replace(' L62.5 18 Z', '')} fill="none" />
          </G>
        )}
      </G>
      {t > 0.05 && (
        <G opacity={Math.min(1, t * 1.5)} stroke={LINE} strokeWidth={1.5} strokeLinecap="round" fill="none">
          <Path d="M28.5 9.5 L25.5 6 M31.5 6 L30.5 2" />
          <Path d="M71.5 9.5 L74.5 6 M68.5 6 L69.5 2" />
        </G>
      )}
    </G>
  );
}

// Behind the ears and head.
function Back({ kind, t }: { kind: Species; t: number }) {
  if (isGuestKind(kind)) return <GuestBack kind={kind} t={t} />;
  switch (kind) {
    case 'lion': {
      // No mane yet: just soft cheek fluff peeking out at the sides of the head; it puffs out while straining.
      const k = 1 + 0.18 * t;
      return (
        <G fill={LOOK.lion.fur} stroke={LINE} strokeWidth={SW} strokeLinejoin="round">
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={`translate(${x(19)} 58) scale(${k.toFixed(3)}) translate(${-x(19)} -58)`}>
                <Path d={`M${x(16)} 51 Q${x(11)} 51 ${x(11.5)} 55 Q${x(8.6)} 57 ${x(11.2)} 60 Q${x(10)} 63.6 ${x(14.6)} 63.2 Q${x(16)} 66 ${x(19.5)} 64 Z`} />
              </G>
            );
          })}
        </G>
      );
    }
    case 'dog':
      return <DogFluff t={t} />;
    case 'seaotter':
      return <SeaOtterBack t={t} />;
    case 'deer':
      // A tufted cream ruff of chest fluff under the chin (the scarf's knot still shows); it fluffs up while straining.
      return (
        <G transform={`translate(50 72) scale(${(1 + 0.08 * t).toFixed(3)}) translate(-50 -72)`} strokeLinejoin="round">
          <Path
            d="M40 66 L60 66 L59.6 73 Q61.8 74.8 59.8 77.2 Q59.2 80.6 55.6 79.8 Q54 83.2 50 82.4 Q46 83.2 44.4 79.8 Q40.8 80.6 40.2 77.2 Q38.2 74.8 40.4 73 Z"
            fill={LOOK.deer.light}
            stroke={LINE}
            strokeWidth={SW}
          />
          <Path d="M46.6 75.8 Q47.4 77.2 46.8 78.4 M53.4 75.8 Q52.6 77.2 53.2 78.4 M50 77 Q50.8 78.6 50 80.2" stroke="#EAD3BA" strokeWidth={1.2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'sheep':
      // A wool bonnet over the top and sides; it bounces while straining.
      return (
        <G transform={`translate(0 ${(-2.5 * t).toFixed(2)})`}>
          <Puffs pts={ring(11, 38, 31, 150, 390)} r={10.5} fill={WOOL} />
        </G>
      );
    case 'unicorn':
      return <UnicornMane t={t} />;
    default:
      return null;
  }
}

function Ears({ kind, look, t, apron }: { kind: Species; look: Look; t: number; apron?: boolean }) {
  if (isGuestKind(kind)) return <GuestEars kind={kind} look={look} t={t} />;
  const s = { stroke: LINE, strokeWidth: SW };
  switch (kind) {
    case 'rabbit':
      return (
        <G>
          {/* the upright ear flops over while straining */}
          <G transform={rot(-32 * t, 36, 22)}>
            <Ellipse cx={30} cy={6} rx={8.5} ry={19} fill={look.fur} {...s} transform="rotate(-22 30 6)" />
            <Ellipse cx={30} cy={7} rx={4} ry={13} fill={look.ear} transform="rotate(-22 30 7)" />
          </G>
          {/* one ear flops to the side */}
          <G transform={rot(14 * t, 68, 20)}>
            <Ellipse cx={76} cy={12} rx={8.5} ry={19} fill={look.fur} {...s} transform="rotate(55 76 12)" />
            <Ellipse cx={76} cy={12} rx={4} ry={13} fill={look.ear} transform="rotate(55 76 12)" />
          </G>
        </G>
      );
    case 'cat':
    case 'fox':
    case 'wolf': {
      // Pointed ears; they flatten back while straining. The cat's are shorter and softer.
      const tip = kind === 'cat' ? -3 : 5;
      const left = look.fur;
      const right = look.fur;
      const a = (kind === 'wolf' ? 22 : 14) * t;
      return (
        <G>
          <G transform={rot(-a, 30, 32)}>
            <Path d={`M20 36 Q18 ${10 - tip} 26 ${8 - tip} Q36 14 42 22 Z`} fill={left} {...s} strokeLinejoin="round" />
            <Path d={`M25 29 Q24 ${16 - tip} 28 ${15 - tip} Q34 18 37 23 Z`} fill={look.ear} />
          </G>
          <G transform={rot(a, 70, 32)}>
            <Path d={`M80 36 Q82 ${10 - tip} 74 ${8 - tip} Q64 14 58 22 Z`} fill={right} {...s} strokeLinejoin="round" />
            <Path d={`M75 29 Q76 ${16 - tip} 72 ${15 - tip} Q66 18 63 23 Z`} fill={look.ear} />
          </G>
          {kind === 'wolf' && (
            // fluffy cheek tufts
            <G fill={look.light} {...s} strokeLinejoin="round">
              <Path d="M18 49 Q8 49 9.5 55 Q5 59.5 11 62.5 Q13 67 21 64 Z" />
              <Path d="M82 49 Q92 49 90.5 55 Q95 59.5 89 62.5 Q87 67 79 64 Z" />
            </G>
          )}
        </G>
      );
    }
    case 'elephant': {
      // Big floppy ears that flap out while straining.
      const a = 10 * t;
      return (
        <G>
          <G transform={rot(-a, 24, 34)}>
            <Ellipse cx={11} cy={45} rx={16} ry={19} fill={look.fur} {...s} transform="rotate(-8 11 45)" />
            <Ellipse cx={11} cy={46} rx={9} ry={12} fill={look.ear} transform="rotate(-8 11 46)" />
          </G>
          <G transform={rot(a, 76, 34)}>
            <Ellipse cx={89} cy={45} rx={16} ry={19} fill={look.fur} {...s} transform="rotate(8 89 45)" />
            <Ellipse cx={89} cy={46} rx={9} ry={12} fill={look.ear} transform="rotate(8 89 46)" />
          </G>
        </G>
      );
    }
    case 'sheep': {
      // Little ears poking out sideways from under the wool; they bob while straining.
      const a = 14 * t;
      return (
        <G>
          <G transform={rot(-a, 18, 44)}>
            <Ellipse cx={7} cy={47} rx={11} ry={6} fill={look.fur} {...s} transform="rotate(22 7 47)" />
            <Ellipse cx={8} cy={47} rx={6.5} ry={3} fill={look.ear} transform="rotate(22 8 47)" />
          </G>
          <G transform={rot(a, 82, 44)}>
            <Ellipse cx={93} cy={47} rx={11} ry={6} fill={look.fur} {...s} transform="rotate(-22 93 47)" />
            <Ellipse cx={92} cy={47} rx={6.5} ry={3} fill={look.ear} transform="rotate(-22 92 47)" />
          </G>
        </G>
      );
    }
    case 'deer': {
      // A fawn: little nubby antler buds by the hat, long soft leaf ears with a fluff of cream inside, and fluffy cheek
      // tufts that break the round outline. The ears perk up and wiggle while straining.
      const a = 26 * t;
      return (
        <G strokeLinejoin="round">
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side}>
                <Limb fill={ANTLER} width={4.4} d={`M${x(31.5)} 22 Q${x(29)} 15 ${x(26.5)} 9 M${x(28.6)} 15.2 Q${x(25)} 14.6 ${x(22.2)} 12.2`} />
                {/* cheek fluff, behind the head so only the tufts poke out */}
                <Path
                  d={`M${x(18.5)} 46 C${x(13.6)} 46 ${x(10.2)} 48.4 ${x(8.8)} 52.2 C${x(10.6)} 52.2 ${x(12)} 52.6 ${x(13.2)} 53.4 C${x(9.6)} 55.6 ${x(8.2)} 58.8 ${x(8.8)} 62.2 C${x(11)} 61.2 ${x(13.2)} 61 ${x(15)} 61.4 C${x(15.4)} 64.4 ${x(17.4)} 67 ${x(20.6)} 68.2 L${x(22)} 66 Z`}
                  fill={look.fur}
                  {...s}
                />
                <G transform={rot(-side * a, x(24), 31)}>
                  <Path
                    d={`M${x(26)} 27 C${x(17)} 19.5 ${x(5)} 21.5 ${x(-1.5)} 31 C${x(5)} 39.5 ${x(17)} 41 ${x(26)} 36 Z`}
                    fill={look.fur}
                    {...s}
                  />
                  <Path d={`M${x(23)} 29.3 C${x(16)} 25 ${x(8)} 26 ${x(3.2)} 31.3 C${x(8.5)} 36.4 ${x(16)} 36.6 ${x(23)} 33.8 Z`} fill={look.ear} />
                  <Path
                    d={`M${x(22.5)} 28.6 Q${x(18.5)} 30.4 ${x(16)} 30 Q${x(18.4)} 31.6 ${x(15.4)} 33.2 Q${x(19.4)} 33.6 ${x(22.5)} 34.6 Z`}
                    fill="#FFFAF2"
                  />
                </G>
              </G>
            );
          })}
        </G>
      );
    }
    case 'pig':
      // Its floppy ears fold forward over the head, so they're drawn in front (see Front).
      return null;
    case 'dog': {
      // Big upright ears like the real puppy's: tall and wide, pink inside, with scruffy tufts on the edges and
      // white fur at the base. They perk up and out while straining.
      const a = 9 * t;
      return (
        <G strokeLinejoin="round">
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={`translate(0 ${(-1.8 * t).toFixed(2)}) ${rot(-side * a, x(28), 30)}`}>
                <Path
                  d={`M${x(18.5)} 37 Q${x(12)} 25 ${x(11.5)} 13 L${x(9)} 11.2 L${x(11.8)} 9.4 Q${x(12)} 1.5 ${x(15.5)} -2.5 Q${x(19.5)} -6 ${x(23)} -2.2 Q${x(28.5)} 2.5 ${x(32)} 8.6 L${x(33.6)} 6.4 L${x(34.4)} 11.4 Q${x(38.5)} 15 ${x(41.5)} 20 Z`}
                  fill={look.fur}
                  {...s}
                />
                <Path d={`M${x(21)} 31 Q${x(16)} 18 ${x(16.8)} 4.5 Q${x(19.4)} 0.6 ${x(22.2)} 3.4 Q${x(28.5)} 9.5 ${x(33)} 17.5 Z`} fill={look.ear} />
                <Path
                  d={`M${x(19.5)} 32 L${x(19.6)} 22.5 L${x(22.2)} 25.6 L${x(23.4)} 18.6 L${x(26)} 23.4 L${x(28.6)} 17.4 L${x(30)} 22.4 L${x(33.6)} 19 L${x(34.5)} 30 Z`}
                  fill={look.fur}
                />
              </G>
            );
          })}
        </G>
      );
    }
    case 'lion':
      // Round cub ears: the dark back shows as a rim round a fluffy cream inside. They wiggle while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            const a = -side * t * (12 + 6 * Math.sin(t * Math.PI * 5));
            return (
              <G key={side} transform={rot(a, x(30), 32)}>
                <Circle cx={x(24)} cy={23} r={8.6} fill={CUB_EAR} {...s} />
                <Circle cx={x(25)} cy={24.4} r={5.4} fill={look.ear} />
                <Path d={`M${x(23.2)} 23 Q${x(24.6)} 25 ${x(24.2)} 27.4 M${x(26.4)} 22.6 Q${x(27.4)} 24.4 ${x(27)} 26.4`} stroke="#EED6B8" strokeWidth={1} strokeLinecap="round" fill="none" />
              </G>
            );
          })}
        </G>
      );
    case 'chick': {
      // A plain baby chick: two or three soft hair strands on top (bakers: two peeking out beside the hat) and stubby
      // wing nubs at the sides of the body. While straining the wings flap and the strands bounce.
      const a = 34 * t;
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={rot(side * (a - 4), x(31), 80)}>
                <Path
                  d={`M${x(33)} 77.5 Q${x(24)} 77 ${x(21)} 84 Q${x(19.5)} 89 ${x(25)} 89.5 Q${x(30)} 90 ${x(33)} 86 Z`}
                  fill={look.fur}
                  {...s}
                  strokeLinejoin="round"
                />
              </G>
            );
          })}
          <G
            transform={`translate(0 ${(-2.2 * t).toFixed(2)}) ${rot(8 * Math.sin(t * Math.PI * 2), apron ? 64 : 50, apron ? 20 : 17)}`}
            fill="none"
            stroke={LINE}
            strokeWidth={1.9}
            strokeLinecap="round"
          >
            {apron ? (
              <Path d="M63 19 Q66 13 71 12 M64.5 20 Q69 17 73 18" />
            ) : (
              <Path d="M50 17 Q49 10 52.5 6 M47 17.5 Q44 12.5 45 9 M53 17.5 Q56 13 59.5 12.5" />
            )}
          </G>
        </G>
      );
    }
    case 'koala': {
      // Big fluffy ears with pale inner tufts; they quiver (a quick shiver) while straining.
      const q = t * (7 + 5 * Math.sin(t * Math.PI * 7));
      const at = (cx: number, cy: number, r: number, a: number): [number, number] => [
        cx + Math.cos((a * Math.PI) / 180) * r,
        cy + Math.sin((a * Math.PI) / 180) * r,
      ];
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            const m = ([px, py]: [number, number]): [number, number] => [x(px), py];
            const tufts = [95, 130, 165, 200, 235, 270].map((a) => m(at(13.5, 30, 12.5, a)));
            const inner = [150, 190, 230].map((a) => m(at(12, 31, 6.5, a)));
            return (
              <G key={side} transform={rot(-side * q, x(29), 38)}>
                <Circle cx={x(13.5)} cy={30} r={13} fill={look.fur} {...s} />
                {tufts.map(([tx, ty], i) => (
                  <Circle key={'o' + i} cx={tx} cy={ty} r={4.3} fill={look.fur} {...s} />
                ))}
                <Circle cx={x(13.5)} cy={30} r={13 - SW / 2} fill={look.fur} />
                {tufts.map(([tx, ty], i) => (
                  <Circle key={'f' + i} cx={tx} cy={ty} r={4.3 - SW / 2} fill={look.fur} />
                ))}
                <Circle cx={x(13)} cy={31} r={7.5} fill={look.ear} />
                {inner.map(([tx, ty], i) => (
                  <Circle key={'i' + i} cx={tx} cy={ty} r={3.4} fill={look.ear} />
                ))}
                <Path
                  d={`M${x(11)} 28 Q${x(14)} 31 ${x(12)} 35 M${x(15.5)} 27 Q${x(17.5)} 30 ${x(16.5)} 33`}
                  stroke="#E3E1EA"
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            );
          })}
        </G>
      );
    }
    case 'panda':
      return <RoundEars look={look} t={t} r={10.5} y={21} fill={look.ear} />;
    case 'tiger':
      return <RoundEars look={look} t={t} r={10} y={22} inner={look.ear} />;
    case 'hamster':
      return <HamsterEars look={look} t={t} />;
    case 'squirrel':
      // Small upright oval ears; they wiggle outward while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={rot(-side * 12 * t, x(31), 31)}>
                <Ellipse cx={x(26)} cy={21} rx={7.5} ry={9} fill={look.fur} {...s} transform={rot(-side * 16, x(26), 21)} />
                <Ellipse cx={x(26.5)} cy={22.5} rx={3.8} ry={5} fill={look.ear} transform={rot(-side * 16, x(26.5), 22.5)} />
              </G>
            );
          })}
        </G>
      );
    case 'otter':
      // Small round ears set low on the sides of the head; they press flat while straining.
      return (
        <G>
          {[1, -1].map((side) => {
            const x = (v: number) => 50 + side * (v - 50);
            return (
              <G key={side} transform={`translate(${(side * 1.2 * t).toFixed(2)} ${(1.5 * t).toFixed(2)})`}>
                <Circle cx={x(16)} cy={31} r={6.6} fill={look.fur} {...s} />
                <Circle cx={x(16.8)} cy={31.8} r={3.3} fill={look.ear} />
              </G>
            );
          })}
        </G>
      );
    case 'seaotter':
      return null; // no ears to see, just the fuzzy round head
    case 'dragon':
      return <DragonHorns look={look} t={t} apron={apron} />;
    case 'duck':
      // A feather curl springing up from the top of the head (under the chef hat on the baker, see DuckLick); it
      // bounces and ruffles while straining.
      return apron ? null : (
        <G transform={`translate(0 ${(headDrop('duck') - 1.5 * t).toFixed(2)}) ${rot(-14 * t, 50, 18)}`}>
          <Limb d="M49.5 19 C48 11 52.5 5.5 57.5 7 C61 8.2 60.5 12.8 57 12.6" fill={look.fur} width={4.6} />
          <Limb d="M46 19 C44.5 15 42.5 13 40 13.2" fill={look.fur} width={3.2} />
        </G>
      );
    case 'penguin':
      return null; // no ears: the flippers are drawn with the body (PenguinFlippers)
    case 'unicorn':
      return <UnicornEars look={look} t={t} />;
    default:
      return <RoundEars look={look} t={t} r={10} y={21} inner={look.ear} />;
  }
}

// Round ears (bear, panda, tiger, lion); they wiggle outward while straining.
function RoundEars({ look, t, r, y, fill, inner }: { look: Look; t: number; r: number; y: number; fill?: string; inner?: string }) {
  const s = { stroke: LINE, strokeWidth: SW };
  return (
    <G>
      {[24, 76].map((x) => (
        <G key={x} transform={rot((x < 50 ? -12 : 12) * t, x < 50 ? 30 : 70, y + 10)}>
          <Circle cx={x} cy={y} r={r} fill={fill ?? look.fur} {...s} />
          {inner && <Circle cx={x} cy={y + 1} r={r * 0.5} fill={inner} />}
        </G>
      ))}
    </G>
  );
}

// One floppy pig ear (side 1 = left, -1 = right), folded forward over the corner of the head: soft and round, the
// tip hanging down towards the face, a pink crease where it folds. While straining it bobs and the tip flips up.
function PigEar({ side, look, t }: { side: 1 | -1; look: Look; t: number }) {
  const x = (v: number) => (50 + side * (v - 50)).toFixed(1);
  return (
    <G transform={`translate(0 ${(-1.5 * t).toFixed(2)}) ${rot(side * (18 * t - 10), +x(22), 9)}`}>
      <Path
        d={`M${x(12)} 12.5 C${x(15.5)} 6 ${x(27)} 5 ${x(31.5)} 11 C${x(32)} 17.5 ${x(28)} 24 ${x(22.5)} 27.5 C${x(18.5)} 30 ${x(15)} 28 ${x(14.5)} 23.5 C${x(14)} 19.5 ${x(12)} 16.5 ${x(12)} 12.5 Z`}
        fill={look.fur}
        stroke={LINE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Path d={`M${x(14)} 12.5 Q${x(21.5)} 7.8 ${x(29)} 11.2`} stroke={look.ear} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </G>
  );
}

// Tails peek out beside the body. Only the bakers wear them, and the dog as a guest too (see Character). They flick while straining.
function Tail({ kind, look, t }: { kind: Species; look: Look; t: number }) {
  const swing = (a: number, children: React.ReactNode) => <G transform={rot(a * t, 68, 96)}>{children}</G>;
  switch (kind) {
    case 'cat':
      // The tuxedo's grey tail with a cream tip, and a little bell on a ribbon bow. It fluffs up and flicks outward while straining.
      return swing(12, (
        <G>
          <Limb d="M66 97 Q88 99 87 82 Q86 72 92 66" fill={look.fur} width={6 + 3.5 * t} />
          <Path d="M88 75.5 Q87 70 92 66" stroke={look.light} strokeWidth={6 + 3.5 * t} strokeLinecap="round" fill="none" />
          <G stroke="#D9707F" strokeWidth={1.2} strokeLinejoin="round" fill="#F7A1AE">
            <Path d="M86 88.5 L81 85.5 L81.5 91.5 Z" />
            <Path d="M86 88.5 L91 85 L91.5 91 Z" />
            <Circle cx={86} cy={88.5} r={1.6} />
          </G>
          <Circle cx={86} cy={93.5} r={3.2} fill="#FFD25C" stroke="#C9973E" strokeWidth={1.2} />
          <Path d="M84.4 94.4 L87.6 94.4" stroke="#C9973E" strokeWidth={1} strokeLinecap="round" />
        </G>
      ));
    case 'dog':
      // Like the real puppy's: a fluffy plume that stands up beside the head and curls over at the tip. It wags
      // while straining.
      return swing(-14, (
        // drawn a little smaller than its path, shrunk toward where it leaves the back
        <G strokeLinejoin="round" strokeLinecap="round" transform="translate(70 96) scale(0.8) translate(-70 -96)">
          <Path d={DOG_TAIL} fill={look.fur} stroke={LINE} strokeWidth={SW / 0.8} />
          <Path d="M90 92.6 Q93.4 90.6 94.6 87.4 M95.8 82 Q97.6 79 96.8 75.6" fill="none" stroke={LINE} strokeWidth={1.25} opacity={0.4} />
        </G>
      ));
    case 'tiger':
      return swing(-24, (
        <G>
          <Limb d="M66 97 Q89 99 88 81 Q87 71 93 64" fill={look.fur} width={6.5} />
          <Path d="M66 97 Q89 99 88 81 Q87 71 93 64" stroke={STRIPE} strokeWidth={6.5} strokeDasharray="3 5" fill="none" />
        </G>
      ));
    case 'lion':
      // A thin cub tail with a soft tuft at the tip.
      return swing(-24, (
        <G>
          <Limb d="M66 97 Q86 101 87.5 85" fill={look.fur} width={3.4} />
          <Puffs pts={[[87.6, 83], [85.4, 79.6], [89.6, 79.4], [87.6, 77]]} r={3.4} fill={CUB_TUFT} />
        </G>
      ));
    case 'elephant':
      return swing(-20, (
        <G>
          <Limb d="M68 97 Q79 100 81 91" fill={look.fur} width={3} />
          <Path d="M81 91 L79 86 M81 91 L83 86" stroke="#9AA6C0" strokeWidth={1.6} strokeLinecap="round" />
        </G>
      ));
    case 'wolf':
      // A big fluffy tail with a white tip.
      return swing(-18, (
        <G>
          <Ellipse cx={81} cy={84} rx={8} ry={16} fill={look.fur} stroke={LINE} strokeWidth={SW} transform="rotate(38 81 84)" />
          <Ellipse cx={87} cy={75} rx={5} ry={6.5} fill={look.light} transform="rotate(38 87 75)" />
        </G>
      ));
    case 'sheep':
      return swing(-16, <Puffs pts={[[72, 95], [76, 90]]} r={5.5} fill={WOOL} />);
    case 'deer':
      // A fawn's little flag of a tail: chestnut on top, a white fluffy underside that flashes while straining.
      return swing(-26, (
        <G transform="rotate(32 72 90)" strokeLinejoin="round">
          <Path d="M68.5 95 Q66.5 86 72 82.5 Q77.5 86 75.5 95 Z" fill="#FFFAF2" stroke={LINE} strokeWidth={SW} />
          <Path d="M69.4 92 Q68.4 86.4 72 84.4 Q75.6 86.4 74.6 92 Q72 89.6 69.4 92 Z" fill={look.fur} />
        </G>
      ));
    case 'koala':
      // No tail to speak of: the baker koala keeps a little eucalyptus sprig tucked under its arm instead.
      return swing(-18, (
        <G stroke={LINE} strokeWidth={1.5} strokeLinejoin="round">
          <Path d="M64 92 Q79 88 84 74" fill="none" stroke="#8FAE8A" strokeWidth={2} strokeLinecap="round" />
          {[[78.5, 84, -58], [88, 80, 52], [80, 74, -30], [88, 70.5, 28], [84.5, 66, 4]].map(([x, y, a], i) => (
            <G key={i}>
              <Ellipse cx={x} cy={y} rx={3.9} ry={5.6} fill={i % 2 ? '#BFE0CF' : EUCALYPTUS} transform={rot(a, x, y)} />
              <Path d={`M${x} ${y + 3.8} L${x} ${y - 3.8}`} stroke="#8FBBA6" strokeWidth={0.8} transform={rot(a, x, y)} />
            </G>
          ))}
        </G>
      ));
    case 'chick':
      // A tiny smooth tail tuft peeking out behind; it flicks while straining.
      return swing(-24, <Path d="M67 96 Q74 97 77 92 Q78.5 96 75 99.5 Q71 102 66 101 Z" fill={look.fur} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />);
    case 'pig':
      // A corkscrew tail: one full curl and a flick at the end.
      return swing(-30, <Limb d="M67 95 C73 96 77.5 93 77.5 89 C77.5 85 72.5 85 72.5 88.5 C72.5 92 78 92.5 80 89 C81.5 86 81 83 83.5 81" fill={look.fur} width={2.6} />);
    case 'squirrel': {
      // The big bushy tail curling up behind the body to the top of the head; it fluffs up while straining
      // (taller more than wider, so it stays inside the drawing).
      const k = 0.04 * t;
      return (
        <G transform={`translate(66 98) scale(${(1 + k).toFixed(3)} ${(1 + 2.5 * k).toFixed(3)}) rotate(${(-5 * t).toFixed(2)}) translate(-66 -98)`}>
          <Path d="M62 100 C80 110 101.5 104 101.5 84 C101.5 74 97 68 97.5 58 C98 48 101.5 42 101 31 C100.5 18 91 11 83 13.5 C76 16 74 24 79 27 L70 64 Z" fill={SQ_TAIL} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
          <Path d="M72 97 C88 100 95 92 95 82 C95 73 91 66 91.5 56 C92 46 95.5 38 93 29 C91 23 87 20.5 84 22" stroke={SQ_FLUFF} strokeWidth={5} strokeLinecap="round" fill="none" />
          {t > 0.05 && (
            <G opacity={Math.min(1, t * 1.5)} stroke={LINE} strokeWidth={1.5} strokeLinecap="round" fill="none">
              <Path d="M95 11.5 L98.5 7.5 M88 9.5 L88.5 5" />
              <Path d="M86 106.5 L87.5 110 M95 104 L98 107" />
            </G>
          )}
        </G>
      );
    }
    case 'dragon':
      return swing(-22, <DragonTail look={look} />);
    case 'otter': {
      // A long thick tail tapering to a point, sweeping out and up at the side. While straining it thumps the floor:
      // it slaps down hard (an ease-in, so it lands with a bump) and little dust puffs pop out by the tip.
      const a = 18 * t * t;
      return (
        <G>
          <G transform={rot(a, 66, 97)} strokeLinejoin="round">
            <Path
              d="M63 90 C73 89.5 83 90 89.5 82.5 Q93.5 77.5 96.5 70 Q98.6 76 97.6 82.5 C95.5 96 82 104.5 63 103 Z"
              fill={look.fur}
              stroke={LINE}
              strokeWidth={SW}
            />
            <Path d="M70 95.5 C80 95.5 88 92 92.5 84" stroke="#E2BB9A" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.8} />
          </G>
          {t > 0.75 && (
            <G opacity={Math.min(1, (t - 0.75) * 5)} stroke={LINE} strokeWidth={1.5} strokeLinecap="round" fill="none">
              <Path d="M97 99 L101 97 M95 104 L99.5 104.5 M91 107 L92.5 110" />
            </G>
          )}
        </G>
      );
    }
    case 'penguin':
      // A little pointed tail peeking out behind; it wags with the waddle while straining.
      return swing(-20, <Path d="M66 99 Q72 99.6 76 97.2 Q75 102 69.5 103.6 Q67 103.8 65.5 102.8 Z" fill={look.fur} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />);
    case 'unicorn':
      return <UnicornTail t={t} />;
    default:
      return null;
  }
}

// Patches, stripes and muzzles, clipped to the head.
function Markings({ kind, look }: { kind: Species; look: Look }) {
  if (isGuestKind(kind)) return <GuestMarkings kind={kind} look={look} />;
  switch (kind) {
    case 'bear':
      return <Ellipse cx={50} cy={59} rx={10} ry={7} fill={look.light} />;
    case 'dragon':
      // A cream snout and a few darker mint freckles on the forehead.
      return (
        <G>
          <Ellipse cx={50} cy={59.5} rx={11.5} ry={7.6} fill={look.light} />
          <G fill={DRAGON_SPOT}>
            <Circle cx={39} cy={30} r={2.2} />
            <Circle cx={34.5} cy={34.5} r={1.4} />
            <Circle cx={62} cy={29} r={1.8} />
          </G>
        </G>
      );
    case 'cat':
      // Tuxedo mask: cream lower face rising to a soft point between the eyes.
      return <Path d="M8 62 Q14 48 27 45 Q39 42.5 45 36.5 Q50 29.5 55 36.5 Q61 42.5 73 45 Q86 48 92 62 L92 80 L8 80 Z" fill={look.light} />;
    case 'dog':
      // No muzzle patch: a baby puppy's face is all soft white fur, with no lines across it.
      return null;
    case 'tiger':
      return (
        <G>
          <Path d="M10 58 Q28 49 42 56 Q50 60 58 56 Q72 49 90 58 L90 80 L10 80 Z" fill={look.light} />
          <G stroke={STRIPE} strokeWidth={2.6} strokeLinecap="round" fill="none">
            <Path d="M44.5 25.5 H55.5" />
            <Path d="M46 30 H54" />
            <Path d="M44.5 34.5 H55.5" />
          </G>
          <G fill={STRIPE}>
            {/* cheek stripes running in from the ruff's edge */}
            <Path d="M6 38.5 L25 42.5 L6 46.5 Z" />
            <Path d="M6 48.5 L22 51.5 L6 54.5 Z" />
            <Path d="M94 38.5 L75 42.5 L94 46.5 Z" />
            <Path d="M94 48.5 L78 51.5 L94 54.5 Z" />
          </G>
        </G>
      );
    case 'lion':
      // A puffy two-lobed cream muzzle with whisker dots, and a pale chin.
      return (
        <G>
          <Ellipse cx={50} cy={64} rx={6} ry={4.5} fill={look.light} />
          <Circle cx={45.4} cy={60.4} r={6.2} fill={look.light} />
          <Circle cx={54.6} cy={60.4} r={6.2} fill={look.light} />
          <G fill={CUB_SPOT}>
            {[[42.2, 59.2], [41, 61.8], [43.6, 62.2], [57.8, 59.2], [59, 61.8], [56.4, 62.2]].map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r={0.75} />
            ))}
          </G>
        </G>
      );
    case 'koala':
      // A pale chin under the big nose.
      return <Ellipse cx={50} cy={71} rx={11} ry={5} fill={look.light} />;
    case 'wolf':
      return (
        <G>
          <Path d="M10 60 Q24 49 37 56 Q45 59 47 50 L50 43 L53 50 Q55 59 63 56 Q76 49 90 60 L90 80 L10 80 Z" fill={look.light} />
        </G>
      );
    case 'deer':
      // Cream muzzle and chin, and the sika fawn's white spots scattered over the crown and temples.
      return (
        <G>
          <Path d="M36 61 Q37 52.5 50 53 Q63 52.5 64 61 Q63.5 71 50 71 Q36.5 71 36 61 Z" fill={look.light} />
          <G fill={SPOT}>
            {[1, -1].map((side) => {
              const x = (v: number) => 50 + side * (v - 50);
              return (
                <G key={side}>
                  <Ellipse cx={x(24.5)} cy={33} rx={2.7} ry={2.3} />
                  <Ellipse cx={x(30.5)} cy={26.5} rx={2.2} ry={1.9} />
                  <Ellipse cx={x(19.5)} cy={40.5} rx={1.9} ry={1.7} />
                  <Ellipse cx={x(31.5)} cy={35.5} rx={1.5} ry={1.3} />
                  <Ellipse cx={x(37.5)} cy={21} rx={1.6} ry={1.4} />
                </G>
              );
            })}
          </G>
        </G>
      );
    case 'hamster':
      // Cream cheeks and muzzle, with a paler band between them and the golden fur so they blend softly.
      return (
        <G>
          <G fill={HAM_BLEND}>
            <Ellipse cx={50} cy={65} rx={22} ry={13} />
            <Ellipse cx={27} cy={65} rx={13} ry={10.5} />
            <Ellipse cx={73} cy={65} rx={13} ry={10.5} />
          </G>
          <G fill={look.light}>
            <Ellipse cx={50} cy={65.5} rx={16.5} ry={10} />
            <Ellipse cx={28} cy={66} rx={10} ry={7.5} />
            <Ellipse cx={72} cy={66} rx={10} ry={7.5} />
          </G>
        </G>
      );
    case 'fox':
      return <Path d="M16 54 Q32 50 50 60 Q68 50 84 54 Q80 73 50 73.5 Q20 73 16 54 Z" fill={look.light} />;
    case 'panda':
      return (
        <G fill="#6A5A5E">
          <Ellipse cx={36} cy={51.5} rx={8} ry={9.8} transform="rotate(30 36 51.5)" />
          <Ellipse cx={64} cy={51.5} rx={8} ry={9.8} transform="rotate(-30 64 51.5)" />
        </G>
      );
    case 'squirrel':
      // Three dark stripes down the forehead (they show under the hat band) and a puffy two-lobed muzzle.
      return (
        <G>
          <G fill={SQ_STRIPE}>
            <Path d="M47.6 14 L52.4 14 L51 35 Q50 37 49 35 Z" />
            <Path d="M37.5 16 L42 15 L43.6 32 Q42.8 34 41.8 32.2 Z" />
            <Path d="M62.5 16 L58 15 L56.4 32 Q57.2 34 58.2 32.2 Z" />
          </G>
          <Circle cx={45.6} cy={60.5} r={6.2} fill={look.light} />
          <Circle cx={54.4} cy={60.5} r={6.2} fill={look.light} />
        </G>
      );
    case 'otter':
      // A cream chin and throat rising round the muzzle, and two round whisker pads.
      return (
        <G>
          <Path d="M6 64 Q20 66.5 31 61.5 Q38 58 40.5 54.5 Q45 51 50 51.5 Q55 51 59.5 54.5 Q62 58 69 61.5 Q80 66.5 94 64 L94 80 L6 80 Z" fill={look.light} />
          <G fill="#FFFBF4" stroke="#F0D9C2" strokeWidth={0.9}>
            <Circle cx={45.4} cy={59.6} r={5.6} />
            <Circle cx={54.6} cy={59.6} r={5.6} />
          </G>
        </G>
      );
    case 'penguin':
      return <PenguinFace />;
    case 'unicorn':
      return <UnicornMuzzle look={look} />;
    default:
      return null;
  }
}

// In front of the face: floppy dog ears, the trunk, the snout, the sheep's fringe.
function Front({ kind, look, t, apron }: { kind: Species; look: Look; t: number; apron?: boolean }) {
  if (isGuestKind(kind)) return <GuestFront kind={kind} look={look} t={t} />;
  const s = { stroke: LINE, strokeWidth: SW, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'hamster':
      return <HamsterFront look={look} t={t} />;
    case 'dog': {
      // Soft puppy bangs and, on the guest, a pink bow by one ear. (The ears are in Ears.)
      return (
        <G strokeLinejoin="round">
          {/* a scruffy tuft standing up on top of the head (under the chef's hat it hides) */}
          <Path d="M43.5 17.6 L45.6 12 L47.8 15.4 L50 10 L52.2 15.4 L54.4 12 L56.5 17.6" fill={look.fur} {...s} />
          <Path d={`${DOG_CROWN} L71 24 L29 24 Z`} fill={look.fur} />
          {/* shaggy brows over the eyes */}
          <G fill="none" stroke={DOG_SHADE} strokeWidth={1.2} strokeLinecap="round">
            <Path d="M31.5 42.6 Q33.6 39.6 36.4 41 Q38.8 38.4 42 41.4" />
            <Path d="M68.5 42.6 Q66.4 39.6 63.6 41 Q61.2 38.4 58 41.4" />
          </G>
          {!apron && (
            <G transform={`translate(4 -4) ${rot(-20, 68, 22)}`}>
              <Path d="M68 22 L61.5 18.5 Q60 22 61.5 25.5 Z M68 22 L74.5 18.5 Q76 22 74.5 25.5 Z" fill="#F7A3B6" {...s} strokeWidth={1.4} />
              <Circle cx={68} cy={22} r={2.2} fill="#F28CA3" stroke={LINE} strokeWidth={1.2} />
            </G>
          )}
        </G>
      );
    }
    case 'lion':
      return <CubFront look={look} t={t} apron={apron} />;
    case 'elephant': {
      // A short trunk that curls up at the tip; it curls tighter while straining.
      const tx = 57.5 + 2 * t;
      const ty = 60.5 - 3.5 * t;
      const d = `M50 50 C50 56 50 61 53 63 C${(56 + t).toFixed(1)} 64.5 ${tx.toFixed(1)} ${(63 - 2 * t).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`;
      return (
        <G>
          <Path d={d} stroke={LINE} strokeWidth={8.5 + SW * 2} strokeLinecap="round" fill="none" />
          <Ellipse cx={50} cy={48} rx={8} ry={6.5} fill={look.fur} />
          <Path d={d} stroke={look.fur} strokeWidth={8.5} strokeLinecap="round" fill="none" />
          <Ellipse cx={tx} cy={ty} rx={2.2} ry={1.6} fill="#F8C6D0" />
          <Path d="M47.8 55.5 Q50 56.4 52.2 55.5 M48 59 Q50.2 59.9 52.4 59" stroke="#AEB9D2" strokeWidth={1.1} strokeLinecap="round" fill="none" />
        </G>
      );
    }
    case 'pig': {
      // Big rosy cheeks, the floppy ears, and a wide snout low in the face. While straining the snout puffs up,
      // the nostrils flare and it snorts little clouds.
      const k = 1 + 0.08 * t;
      return (
        <G>
          <Circle cx={26} cy={59} r={7.5} fill="#FFADBD" opacity={0.9} />
          <Circle cx={74} cy={59} r={7.5} fill="#FFADBD" opacity={0.9} />
          <PigEar side={1} look={look} t={t} />
          <PigEar side={-1} look={look} t={t} />
          {t > 0.05 &&
            [-1, 1].map((side) => (
              <G key={side} opacity={Math.min(1, 1.7 - t)} fill="#FFFFFF" stroke="#D9BFA8" strokeWidth={1.1}>
                <Circle cx={50 + side * (11 + 9 * t)} cy={62 + 6 * t} r={1.8 + 2.4 * t} />
                <Circle cx={50 + side * (15 + 13 * t)} cy={64 + 8 * t} r={1.2 + 1.6 * t} />
              </G>
            ))}
          <G transform={`translate(50 57.5) scale(${k.toFixed(3)}) translate(-50 -57.5)`}>
            <Ellipse cx={50} cy={57.5} rx={9.6} ry={6.3} fill="#FFB3C1" {...s} strokeWidth={1.8} />
            <Ellipse cx={46.6} cy={53.8} rx={3.2} ry={1.1} fill="#FFFFFF" opacity={0.55} />
            <Ellipse cx={46.4} cy={58} rx={1.7 + 0.6 * t} ry={2.7} fill="#D9788D" />
            <Ellipse cx={53.6} cy={58} rx={1.7 + 0.6 * t} ry={2.7} fill="#D9788D" />
          </G>
        </G>
      );
    }
    case 'cat': {
      // Big soft blush with whiskers drawn across it; the whiskers bristle up while straining.
      const up = 4 * t;
      return (
        <G>
          <G fill="#FFAAB6" opacity={0.75}>
            <Ellipse cx={25} cy={59} rx={8.5} ry={5.6} />
            <Ellipse cx={75} cy={59} rx={8.5} ry={5.6} />
          </G>
          <G stroke="#B98F86" strokeWidth={1.2} strokeLinecap="round" fill="none">
            {[1, -1].map((side) => {
              const x = (v: number) => (50 + side * (v - 50)).toFixed(1);
              return (
                <G key={side}>
                  <Path d={`M${x(17)} ${(55 - up).toFixed(1)} L${x(31)} 57.5`} />
                  <Path d={`M${x(16.5)} ${(59.5 - up * 0.5).toFixed(1)} L${x(31)} 59.5`} />
                  <Path d={`M${x(17.5)} 64 L${x(30.5)} 61.5`} />
                </G>
              );
            })}
          </G>
        </G>
      );
    }
    case 'deer':
      // A soft forelock that peeks out in little locks under the hat; it bounces while straining.
      return (
        <G transform={`translate(0 ${(-1.8 * t).toFixed(2)})`} strokeLinejoin="round">
          {/* only the tufts on top and the locks' tips are outlined, so the sides melt into the head's fur */}
          <Path
            d="M39.6 21.4 Q39 17.2 43.4 16.4 Q44.4 12.4 48 14.6 Q50.4 10.8 53 14.4 Q56.4 12.4 57 16.4 Q61.2 17.2 60.4 21.4 Q61.6 25 57.8 24.8 Q56.6 27.8 53.2 26 Q50 29 46.8 26 Q43.4 27.8 42.2 24.8 Q38.4 25 39.6 21.4 Z"
            fill={look.fur}
          />
          <Path
            d="M43 16.6 Q44.4 12.4 48 14.6 Q50.4 10.8 53 14.4 Q55.6 12.4 57 16.6 M60.4 21.4 Q61.6 25 57.8 24.8 Q56.6 27.8 53.2 26 Q50 29 46.8 26 Q43.4 27.8 42.2 24.8 Q38.4 25 39.6 21.4"
            fill="none"
            stroke={LINE}
            strokeWidth={SW}
            strokeLinecap="round"
          />
        </G>
      );
    case 'sheep':
      // A woolly fringe peeking out under the hat.
      return (
        <G transform={`translate(0 ${(-2.5 * t).toFixed(2)})`}>
          <Puffs pts={[[37, 25], [50, 23], [63, 25], [43.5, 27], [56.5, 27]]} r={6.5} fill={WOOL} />
        </G>
      );
    case 'otter': {
      // A small dark nose (over the shared pink one) and fine whiskers fanning from the pads; they bristle up and out
      // while straining.
      const up = 5 * t;
      return (
        <G>
          <G stroke={OTTER_WHISKER} strokeWidth={1} strokeLinecap="round" fill="none">
            {[1, -1].map((side) => {
              const x = (v: number) => (50 + side * (v - 50)).toFixed(1);
              return (
                <G key={side}>
                  <Path d={`M${x(40)} 58.6 Q${x(35.5)} ${(57 - up).toFixed(1)} ${x(31)} ${(57 - up * 1.2).toFixed(1)}`} />
                  <Path d={`M${x(40.2)} 61.4 Q${x(35.5)} ${(61.6 - up * 0.5).toFixed(1)} ${x(31.5)} ${(62.8 - up * 0.6).toFixed(1)}`} />
                </G>
              );
            })}
          </G>
          <Path
            d="M45.4 54.8 Q50 53.2 54.6 54.8 Q55.4 56.4 53.6 58 Q51.4 59.8 50 59.8 Q48.6 59.8 46.4 58 Q44.6 56.4 45.4 54.8 Z"
            fill={OTTER_NOSE}
            stroke={OTTER_NOSE}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
          <Ellipse cx={48.4} cy={55.4} rx={1.5} ry={0.8} fill="#FFFFFF" opacity={0.8} />
        </G>
      );
    }
    case 'seaotter':
      return <SeaOtterFront t={t} />;
    case 'duck':
      // While straining a couple of loose feathers ruffle off (the bill quacks open in DuckBill).
      return t > 0.08 ? (
        <G opacity={Math.min(1, t * 1.6)}>
          {[[14, 20, -30], [87, 27, 35]].map(([x, y, a], i) => (
            <G key={i} transform={`translate(${x} ${(y - 5 * t).toFixed(2)}) rotate(${(a + 30 * t * (i ? 1 : -1)).toFixed(1)})`}>
              <Path d="M0 -4.2 Q2.6 -1 0 4.2 Q-2.6 -1 0 -4.2 Z" fill={look.fur} stroke={LINE} strokeWidth={1.2} strokeLinejoin="round" />
              <Path d="M0 -2.6 V3.6" stroke="#E8DCC8" strokeWidth={0.9} />
            </G>
          ))}
        </G>
      ) : null;
    case 'unicorn':
      return <UnicornForelock t={t} apron={apron} />;
    default:
      return null;
  }
}

// ---- fluffy outlines (used by the sea otter) ----
// Points round HEAD with their outward normals, and soft scallops or wisps drawn along them.
const HAM_SEGS: [number, number][][] = [
  [[50, 16], [74, 16], [86, 31], [86, 48]],
  [[86, 48], [86, 65], [71, 74], [50, 74]],
  [[50, 74], [29, 74], [14, 65], [14, 48]],
  [[14, 48], [14, 31], [26, 16], [50, 16]],
];
// A point on an outline with its outward normal, from a tangent (tx, ty) running clockwise.
type FP = { x: number; y: number; nx: number; ny: number };
const fp = (x: number, y: number, tx: number, ty: number): FP => {
  const l = Math.hypot(tx, ty) || 1;
  return { x, y, nx: ty / l, ny: -tx / l };
};
// s 0-1 round HEAD, clockwise from the top.
function headAt(s: number): FP {
  const i = Math.min(3, Math.floor(s * 4));
  const u = s * 4 - i;
  const v = 1 - u;
  const [a, b, c, d] = HAM_SEGS[i];
  const at = (k: 0 | 1) => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k];
  const tan = (k: 0 | 1) => 3 * v * v * (b[k] - a[k]) + 6 * v * u * (c[k] - b[k]) + 3 * u * u * (d[k] - c[k]);
  return fp(at(0), at(1), tan(0), tan(1));
}
// n bumps along an outline: pts are the n+1 valleys, mids the n peaks.
function sampleEdge(at: (s: number) => FP, n: number) {
  const pts = Array.from({ length: n + 1 }, (_, i) => at(i / n));
  const mids = Array.from({ length: n }, (_, i) => at((i + 0.5) / n));
  return { pts, mids };
}
// Soft scallops (and pointed wisps at the spike indices) along sampled points.
function fluffPath({ pts, mids }: { pts: FP[]; mids: FP[] }, bulge: number, spikes: number[] = [], spike = 0) {
  const o = (p: FP, k: number) => `${(p.x + p.nx * k).toFixed(2)} ${(p.y + p.ny * k).toFixed(2)}`;
  let d = `M${o(pts[0], 0.3)}`;
  mids.forEach((m, i) => {
    d += spikes.includes(i) ? ` L${o(m, spike)} L${o(pts[i + 1], 0.3)}` : ` Q${o(m, 2 * bulge)} ${o(pts[i + 1], 0.3)}`;
  });
  return d;
}
// The hamster: a simple chubby golden-tan baby with a smooth outline, small round ears, cream cheeks and muzzle that
// blend softly into the fur, a few fine whiskers and a little tuft of fur at each cheek. Standing, it holds its tiny
// pink paws together at its chest. While straining its cheeks puff out and its ears wiggle.
const HAM_BEAD = true; // small bead eyes (like the sea otter's) instead of the shared big shiny ones
const HAM_EAR = '#DDB0B3';
const HAM_BLEND = '#F6D0A4'; // between the golden fur and the cream cheeks
const HAM_PAW = '#FFCFCB';
const HAM_WHISKER = '#C4A086';

function HamsterEars({ look, t }: { look: Look; t: number }) {
  return (
    <G>
      {[25, 75].map((x) => (
        <G key={x} transform={rot((x < 50 ? -14 : 14) * t, x < 50 ? 31 : 69, 32)}>
          <Circle cx={x} cy={22.5} r={8} fill={look.fur} stroke={LINE} strokeWidth={SW} />
          <Circle cx={x} cy={23.3} r={4.9} fill={HAM_EAR} />
        </G>
      ))}
    </G>
  );
}

function HamsterFront({ look, t }: { look: Look; t: number }) {
  // The cheek tufts poke out a little further as the cheeks puff while straining.
  const out = 1.2 * t;
  return (
    <G>
      {[1, -1].map((side) => (
        <G key={side} transform={side === 1 ? `translate(${-out} 0)` : `translate(${100 + out} 0) scale(-1 1)`}>
          {/* a puffed cheek (only while straining) and a small cream tuft of fur at the side of the face */}
          {t > 0.02 && <Ellipse cx={17.5} cy={61} rx={2 + 2 * t} ry={5 + t} fill={look.light} stroke={LINE} strokeWidth={SW} />}
          <Path
            d="M16.2 55.6 Q12.6 56.4 11.4 58.2 Q13.8 58.6 14.6 59.4 Q12 61.2 11.6 63.2 Q14.8 63 17.4 61.8 Z"
            fill={look.light}
            stroke={LINE}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <Path d="M17.4 61.8 L16.2 55.6" stroke={look.light} strokeWidth={2} />
          {/* fine whiskers */}
          <Path d="M36 58.4 Q27 56.4 19.5 56.6 M36.4 60.6 Q28 61.2 20.6 63.8" stroke={HAM_WHISKER} strokeWidth={0.8} strokeLinecap="round" fill="none" />
        </G>
      ))}
    </G>
  );
}

// Tiny pink paws held together at the chest.
function HamsterPaws() {
  return (
    <G>
      <G fill={HAM_PAW} stroke={LINE} strokeWidth={1.6}>
        <Ellipse cx={44.6} cy={80.5} rx={4.8} ry={4} transform="rotate(20 44.6 80.5)" />
        <Ellipse cx={55.4} cy={80.5} rx={4.8} ry={4} transform="rotate(-20 55.4 80.5)" />
      </G>
      <Path d="M43.8 83.6 L44.5 81.6 M46.4 83.2 L46.6 81.2 M56.2 83.6 L55.5 81.6 M53.6 83.2 L53.4 81.2" stroke="#E79A9C" strokeWidth={0.8} strokeLinecap="round" />
    </G>
  );
}

function Face({ kind, mood: given, t = 0, special }: { kind: Species; mood: Mood; t?: number; special?: Special | null }) {
  // The dragon shuts its eyes happily while it blows, and its mouth makes a little "o" (DragonMouth).
  const blowing = kind === 'dragon' && !!special && specialPhase(special).cheek + specialPhase(special).strength > 0.05;
  const mood: Mood = blowing ? 'happy' : given;
  const onDark = kind === 'panda' || guestOnDark(kind);
  // The pig's mouth sits below its snout; the elephant's is under the trunk.
  const dy = kind === 'pig' ? 5 : kind === 'koala' ? 3 : 0;
  const darkNose = kind === 'dog' || kind === 'wolf' || kind === 'panda' || kind === 'deer';
  return (
    <G>
      <Ellipse cx={26} cy={58} rx={7} ry={4.5} fill="#FFAAB6" opacity={0.6} />
      <Ellipse cx={74} cy={58} rx={7} ry={4.5} fill="#FFAAB6" opacity={0.6} />
      {mood === 'happy' ? (
        <G stroke={onDark ? '#FFFFFF' : EYE} strokeWidth={2.6} strokeLinecap="round" fill="none">
          <Path d="M31 52 Q37 45 43 52" />
          <Path d="M57 52 Q63 45 69 52" />
        </G>
      ) : mood === 'effort' ? (
        // Squeezed > < eyes and a sweat drop: working hard.
        <G>
          <G stroke={onDark ? '#FFFFFF' : EYE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M32 46 L41 50.5 L32 55" />
            <Path d="M68 46 L59 50.5 L68 55" />
          </G>
          <Path d="M84 30 Q79 38 81.5 41 Q84 43.5 86.5 41 Q89 38 84 30 Z" fill="#BFE3F7" stroke="#8CC3E3" strokeWidth={1.2} />
        </G>
      ) : mood === 'sleepy' ? (
        <G stroke={onDark ? '#FFFFFF' : EYE} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <Path d="M31 50 Q37 55 43 50" />
          <Path d="M57 50 Q63 55 69 50" />
        </G>
      ) : kind === 'chick' && CHICK_BEAD ? (
        // Small dark bead eyes set wide, like a baby chick's.
        <G>
          <Ellipse cx={34} cy={51} rx={3.3} ry={3.9} fill={SO_EYE} />
          <Ellipse cx={66} cy={51} rx={3.3} ry={3.9} fill={SO_EYE} />
          <Circle cx={33.1} cy={49.6} r={1} fill="#FFFFFF" />
          <Circle cx={65.1} cy={49.6} r={1} fill="#FFFFFF" />
        </G>
      ) : kind === 'seaotter' && SO_BEAD ? (
        // Small round bead eyes set wide apart, each with one shine.
        <G>
          <Ellipse cx={33} cy={51} rx={3.9} ry={4.5} fill={SO_EYE} />
          <Ellipse cx={67} cy={51} rx={3.9} ry={4.5} fill={SO_EYE} />
          <Circle cx={32} cy={49.4} r={1.15} fill="#FFFFFF" />
          <Circle cx={66} cy={49.4} r={1.15} fill="#FFFFFF" />
        </G>
      ) : kind === 'hamster' && HAM_BEAD ? (
        // The hamster's small dark bead eyes, each with one shine.
        <G>
          <Ellipse cx={35} cy={50.5} rx={3.7} ry={4.3} fill={SO_EYE} />
          <Ellipse cx={65} cy={50.5} rx={3.7} ry={4.3} fill={SO_EYE} />
          <Circle cx={34} cy={49} r={1.15} fill="#FFFFFF" />
          <Circle cx={64} cy={49} r={1.15} fill="#FFFFFF" />
        </G>
      ) : kind === 'cat' ? (
        // The cat's eyes are small calm ovals.
        <G>
          <Ellipse cx={37} cy={51} rx={3.4} ry={4.4} fill={EYE} />
          <Ellipse cx={63} cy={51} rx={3.4} ry={4.4} fill={EYE} />
          <Circle cx={36} cy={49.4} r={1.1} fill="#FFFFFF" />
          <Circle cx={62} cy={49.4} r={1.1} fill="#FFFFFF" />
        </G>
      ) : (
        <G>
          <Ellipse cx={37} cy={50} rx={5.6} ry={6.6} fill={EYE} />
          <Ellipse cx={63} cy={50} rx={5.6} ry={6.6} fill={EYE} />
          <Ellipse cx={37} cy={53} rx={3.8} ry={2.8} fill="#8A5A3C" />
          <Ellipse cx={63} cy={53} rx={3.8} ry={2.8} fill="#8A5A3C" />
          <Circle cx={35} cy={47.4} r={2.3} fill="#FFFFFF" />
          <Circle cx={61} cy={47.4} r={2.3} fill="#FFFFFF" />
          <Circle cx={39.2} cy={53.6} r={1} fill="#FFFFFF" />
          <Circle cx={65.2} cy={53.6} r={1} fill="#FFFFFF" />
        </G>
      )}
      {(kind === 'deer' || kind === 'unicorn') && mood !== 'effort' && (
        // Long lashes at the outer corners: the fawn's gentle eyes.
        <G stroke={EYE} strokeWidth={1.3} strokeLinecap="round" fill="none">
          {mood === 'normal' || mood === 'shock' ? (
            <Path d="M31.8 47 Q29.6 46.6 28.8 45 M32.8 45 Q31 43.8 30.8 42 M68.2 47 Q70.4 46.6 71.2 45 M67.2 45 Q69 43.8 69.2 42" />
          ) : (
            <Path d={mood === 'happy' ? 'M31.6 51 L28.4 50 M32.6 49 L30 46.8 M68.4 51 L71.6 50 M67.4 49 L70 46.8' : 'M31.8 51 L28.8 52.6 M33.4 52.6 L31.6 55 M68.2 51 L71.2 52.6 M66.6 52.6 L68.4 55'} />
          )}
        </G>
      )}
      {kind === 'tiger' && (
        <G stroke={LINE} strokeWidth={1.3} strokeLinecap="round">
          <Path d="M13 56 L21 57.5 M14 61.5 L21.5 60" />
          <Path d="M87 56 L79 57.5 M86 61.5 L78.5 60" />
        </G>
      )}
      {isGuestKind(kind) ? (
        <GuestNose kind={kind} />
      ) : kind === 'duck' ? (
        <DuckBill mood={mood} t={t} />
      ) : kind === 'penguin' ? (
        <PenguinBeak mood={mood} t={t} />
      ) : kind === 'chick' ? (
        // A small orange diamond beak with a line between its halves.
        <G stroke={CHICK_BEAK_LINE} strokeWidth={1.3} strokeLinejoin="round" strokeLinecap="round">
          <Path d="M46 57 L50 53.6 L54 57 L50 61.2 Z" fill={CHICK_BEAK} />
          <Path d="M46.6 57 Q50 58 53.4 57" fill="none" />
        </G>
      ) : kind === 'koala' ? (
        // The koala's big oval nose, with a shine.
        <G>
          <Ellipse cx={50} cy={56} rx={5.6} ry={7} fill={KOALA_NOSE} />
          <Ellipse cx={48.1} cy={52.4} rx={1.7} ry={1.1} fill="#FFFFFF" opacity={0.85} transform="rotate(-20 48.1 52.4)" />
          <Circle cx={52.2} cy={59.8} r={0.7} fill="#FFFFFF" opacity={0.5} />
        </G>
      ) : darkNose ? (
        <G>
          <Ellipse cx={50} cy={56.2} rx={kind === 'deer' ? 3.2 : kind === 'dog' ? 4.8 : 4.2} ry={kind === 'deer' ? 2.4 : kind === 'dog' ? 3.5 : 3} fill={kind === 'deer' ? '#8A5A3C' : kind === 'dog' ? '#4A3537' : '#5B4A4E'} />
          <Ellipse cx={48.8} cy={55.2} rx={1.2} ry={0.7} fill="#FFFFFF" opacity={0.8} />
        </G>
      ) : kind === 'dragon' ? (
        <G fill={DRAGON_NOSTRIL}>
          <Ellipse cx={46.6} cy={56.2} rx={1.3} ry={0.95} />
          <Ellipse cx={53.4} cy={56.2} rx={1.3} ry={0.95} />
        </G>
      ) : kind === 'pig' || kind === 'elephant' || kind === 'unicorn' ? null : (
        <Path d="M47.6 56 Q50 54.6 52.4 56 Q50 58.6 47.6 56 Z" fill={PINK} stroke={PINK} strokeWidth={1.2} strokeLinejoin="round" />
      )}
      <G transform={`translate(0 ${dy})`}>
        {kind === 'duck' || kind === 'penguin' || guestNoMouth(kind) ? null : blowing ? (
          <DragonMouth special={special!} />
        ) : mood === 'shock' ? (
          <Ellipse cx={50} cy={64.5} rx={2.8} ry={3.6} fill="#E8737F" stroke={LINE} strokeWidth={1.2} />
        ) : mood === 'happy' && kind !== 'chick' ? (
          <G>
            <Path d="M45.5 61 Q50 61.8 54.5 61 Q53.5 67.5 50 67.5 Q46.5 67.5 45.5 61 Z" fill="#E8737F" stroke={LINE} strokeWidth={1.2} strokeLinejoin="round" />
            {kind === 'squirrel' && <Teeth y={61.4} />}
          </G>
        ) : mood === 'effort' ? (
          <Path d="M44.5 63 L47.2 61 L50 63 L52.8 61 L55.5 63" fill="none" stroke={LINE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        ) : kind === 'chick' || kind === 'seaotter' ? null : (
          <G>
            {kind === 'dog' && <Path d="M48 61.6 Q48 65.8 50 65.8 Q52 65.8 52 61.6 Z" fill="#F28C9C" />}
            {kind === 'squirrel' && <Teeth y={61.4} />}
            <Path d="M45 60.5 Q47.5 63.2 50 60.5 Q52.5 63.2 55 60.5" fill="none" stroke={LINE} strokeWidth={1.8} strokeLinecap="round" />
          </G>
        )}
      </G>
    </G>
  );
}

// A bib apron with a neck strap, waist tie and pocket, like a chef character.
// berry: the strawberry apron from the 꾸미기 shop, pink with little strawberries.
function Apron({ berry }: { berry?: boolean }) {
  const trim = berry ? '#F28C9C' : '#F0B3A0';
  return (
    <G stroke={LINE} strokeWidth={1.8} strokeLinejoin="round">
      <Path d="M41 71 Q50 76 59 71" fill="none" stroke={trim} strokeWidth={2.4} />
      <Path d="M40 74 H60 V82 Q66 84 66 92 Q66 102 50 102 Q34 102 34 92 Q34 84 40 82 Z" fill={berry ? '#FFCCD6' : '#FFFFFF'} />
      {berry &&
        [[43, 99], [57, 99], [50, 86.5]].map(([x, y], i) => (
          <G key={i} stroke="none">
            <Path d={`M${x - 2.6} ${y - 1.4} Q${x} ${y - 2.8} ${x + 2.6} ${y - 1.4} Q${x + 2.3} ${y + 3} ${x} ${y + 4} Q${x - 2.3} ${y + 3} ${x - 2.6} ${y - 1.4} Z`} fill="#F0606F" />
            <Path d={`M${x - 2.2} ${y - 1.8} L${x} ${y - 3.6} L${x + 2.2} ${y - 1.8}`} fill="none" stroke="#6FBF73" strokeWidth={1.4} />
            <Circle cx={x - 0.8} cy={y + 0.6} r={0.45} fill="#FFE07A" />
            <Circle cx={x + 0.9} cy={y + 1.6} r={0.45} fill="#FFE07A" />
          </G>
        ))}
      <Path d="M33 84 Q50 88 67 84" fill="none" stroke={trim} strokeWidth={2.4} />
      <Path d="M44 90 H56 V95 Q50 97.5 44 95 Z" fill={berry ? '#FFF6F7' : '#FFF3EC'} stroke={trim} strokeWidth={1.4} />
      <Circle cx={50} cy={78} r={1.6} fill={trim} stroke="none" />
    </G>
  );
}

// Guests wear a little neckerchief in their own colour.
function Scarf({ color }: { color: string }) {
  return (
    <G stroke={LINE} strokeWidth={1.6} strokeLinejoin="round">
      <Path d="M34 72 Q50 79 66 72 L64 77 Q50 84 36 77 Z" fill={color} />
      <Path d="M53 79 L59 88 L49 85 Z" fill={color} />
    </G>
  );
}

// Outfits from the decoration shop. The baker always wears the chef hat (toque) and apron, so everything is placed on
// that look: pins on the hat band (y 4-22, x 36-64), toppers on the puffs (top near y -17), neckwear at the apron neck.
const heartPath = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy + r * 0.95} C${cx - r * 1.35} ${cy + r * 0.05} ${cx - r * 1.05} ${cy - r * 1.15} ${cx} ${cy - r * 0.45} C${cx + r * 1.05} ${cy - r * 1.15} ${cx + r * 1.35} ${cy + r * 0.05} ${cx} ${cy + r * 0.95} Z`;
const leafPath = (cx: number, cy: number, r: number) => {
  // A five-pointed maple leaf.
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const q = i % 2 ? r * 0.48 : r;
    d += `${i ? 'L' : 'M'}${(cx + q * Math.cos(a)).toFixed(2)} ${(cy + q * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
};

function Accessory({ wear }: { wear: string }) {
  const o = { stroke: LINE, strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  switch (wear) {
    // ---- premium ----
    case 'ribbon':
      // A pink ribbon tied round the hat band, bow on the right.
      return (
        <G {...o}>
          <Path d="M37 13.5 Q50 17.5 63 13.5 L63 18.5 Q50 22.5 37 18.5 Z" fill="#FF9BB8" />
          <Path d="M63 16 L72 9 L73 22 Z" fill="#FF9BB8" />
          <Path d="M63 16 L68 26 L64.5 26.5 Z" fill="#FF7FA5" />
          <Circle cx={63} cy={16} r={3.2} fill="#FF7FA5" />
        </G>
      );
    case 'glasses':
      return (
        <G stroke="#8A5A3C" strokeWidth={2.2} fill="rgba(255,255,255,0.15)">
          <Circle cx={37} cy={50} r={10} />
          <Circle cx={63} cy={50} r={10} />
          <Path d="M47 49 Q50 46 53 49" fill="none" />
        </G>
      );
    case 'heartglasses':
      return (
        <G>
          <Path d="M45 47 Q50 44 55 47" fill="none" stroke="#D9566F" strokeWidth={2} />
          {[37, 63].map((x) => (
            <G key={x}>
              <Path d={heartPath(x, 49, 9.5)} fill="#F2708C" fillOpacity={0.85} stroke="#D9566F" strokeWidth={2} strokeLinejoin="round" />
              <Ellipse cx={x - 4} cy={45.5} rx={2.4} ry={1.3} fill="#FFFFFF" opacity={0.8} transform={`rotate(-30 ${x - 4} 45.5)`} />
            </G>
          ))}
        </G>
      );
    case 'flower': {
      // A daisy tucked into the right side of the hat band.
      const petals = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return { x: 63 + Math.cos(a) * 5, y: 10 + Math.sin(a) * 5 };
      });
      return (
        <G stroke={LINE} strokeWidth={1.4}>
          <Path d="M60 15 Q57 19 58 22" fill="none" stroke="#6FA86B" strokeWidth={1.8} />
          {petals.map((q, i) => (
            <Circle key={i} cx={q.x} cy={q.y} r={3.9} fill="#FFFFFF" />
          ))}
          <Circle cx={63} cy={10} r={3.1} fill="#FFD25C" />
        </G>
      );
    }
    case 'star':
      // A gold star badge on the front of the hat.
      return (
        <G>
          <Path
            d="M50 6 L52.6 11.4 L58.4 12 L54 15.9 L55.3 21.6 L50 18.6 L44.7 21.6 L46 15.9 L41.6 12 L47.4 11.4 Z"
            fill="#FFE070"
            {...o}
          />
          <Circle cx={48} cy={11.5} r={0.9} fill="#FFFFFF" />
        </G>
      );
    // ---- gold ----
    case 'sprout':
      // A little sprout growing out of the toque's right puff.
      return (
        <G {...o}>
          <Path d="M63 -3 Q68 -7 69.5 -12" fill="none" stroke="#6FA86B" strokeWidth={2.4} />
          <Path d="M69 -11.5 Q63 -15.5 58 -12.5 Q62 -8 69 -11.5 Z" fill="#9BD58F" />
          <Path d="M69.5 -11.5 Q74 -17.5 80.5 -14.5 Q76.5 -8 69.5 -11.5 Z" fill="#B6E3A6" />
        </G>
      );
    case 'heart':
      // A heart pin on the hat band.
      return (
        <G>
          <Path d={heartPath(57, 13, 5.2)} fill="#FF8FA8" {...o} />
          <Ellipse cx={55} cy={11} rx={1.2} ry={0.7} fill="#FFFFFF" opacity={0.85} transform="rotate(-30 55 11)" />
        </G>
      );
    case 'leafpin':
      // A maple leaf pinned to the left of the hat band.
      return (
        <G transform="rotate(-18 42 12)">
          <Path d="M42 17 L42 22" stroke="#B8743F" strokeWidth={1.6} strokeLinecap="round" />
          <Path d={leafPath(42, 12, 6.5)} fill="#F2994A" {...o} strokeWidth={1.4} />
          <Path d="M42 17 V8.5 M42 13.5 L38.5 10.5 M42 13.5 L45.5 10.5" fill="none" stroke="#D9773A" strokeWidth={0.9} strokeLinecap="round" />
        </G>
      );
    case 'cherry':
      // Two cherries hanging from the left of the hat band.
      return (
        <G stroke={LINE} strokeWidth={1.5}>
          <Path d="M40 23 Q41 14 44 8 Q45.5 15 46 23" fill="none" stroke="#6FA86B" strokeWidth={1.8} />
          <Path d="M44 8 Q49 5 51.5 8.5 Q47 10.5 44 8 Z" fill="#9BD58F" />
          <Circle cx={40} cy={24} r={4.4} fill="#F05A6A" />
          <Circle cx={46.5} cy={24.5} r={4.4} fill="#E8475A" />
          <Circle cx={38.6} cy={22.6} r={1.2} fill="#FFFFFF" stroke="none" />
          <Circle cx={45.1} cy={23.1} r={1.2} fill="#FFFFFF" stroke="none" />
        </G>
      );
    case 'bowtie':
      // Sits on the apron's neckerchief knot.
      return (
        <G {...o} fill="#F2788F">
          <Path d="M50 75 L40 69 L40 81 Z" />
          <Path d="M50 75 L60 69 L60 81 Z" />
          <Circle cx={50} cy={75} r={3.2} fill="#D9566F" />
        </G>
      );
    case 'brooch':
      // A cookie brooch with a tiny bow, pinned on the apron pocket.
      return (
        <G>
          <Path d="M46.5 88.5 L50 90.5 L53.5 88.5 L53.5 92 L50 90.5 L46.5 92 Z" fill="#9ED3C4" {...o} strokeWidth={1.1} />
          <Circle cx={50} cy={94} r={4.6} fill="#E8B474" {...o} strokeWidth={1.3} />
          {[[-1.8, -1.6], [1.6, -0.8], [-0.4, 1.8], [2, 2]].map(([x, y], i) => (
            <Circle key={i} cx={50 + x} cy={94 + y} r={0.8} fill="#7A4E33" />
          ))}
        </G>
      );
    case 'scarf':
      // A chunky knitted scarf over the neckerchief, one end hanging down.
      return (
        <G {...o}>
          <Path d="M58 77 L57 95 Q60 97 64 95 L62.5 76 Z" fill="#F7C26B" />
          <Path d="M57.6 83 L63.1 82.6 M57.3 89 L63.6 88.6" stroke="#F28C8C" strokeWidth={2} />
          <Path d="M57.6 95.5 V99 M60.5 96.5 V100 M63.4 95.5 V99" stroke="#F7C26B" strokeWidth={1.6} />
          <Path d="M32 69 Q50 79 68 69 L68.5 76.5 Q50 87 31.5 76.5 Z" fill="#F7C26B" />
          <Path d="M33 72.8 Q50 82.5 67.5 72.8" fill="none" stroke="#F28C8C" strokeWidth={2} />
          <Path d="M38 71 V78.5 M44 73.5 V81.5 M50 74.5 V82.5 M56 73.5 V81.5 M62 71 V78.5" stroke="#E6A84E" strokeWidth={0.9} />
        </G>
      );
    case 'blush':
      return (
        <G fill="#FF8FA8" opacity={0.75}>
          <Ellipse cx={30} cy={58} rx={6} ry={3.5} />
          <Ellipse cx={70} cy={58} rx={6} ry={3.5} />
          <Path d="M22 50 L23 47 L24 50 L27 51 L24 52 L23 55 L22 52 L19 51 Z" fill="#FFD25C" opacity={1} />
          <Path d="M78 50 L79 47 L80 50 L83 51 L80 52 L79 55 L78 52 L75 51 Z" fill="#FFD25C" opacity={1} />
        </G>
      );
    case 'headphones':
      // Study headphones: the band runs up to the sides of the hat and tucks behind it.
      return (
        <G {...o}>
          <Path d="M17 42 Q16 22 37 11 M83 42 Q84 22 63 11" fill="none" stroke={LINE} strokeWidth={5.5} />
          <Path d="M17 42 Q16 22 37 11 M83 42 Q84 22 63 11" fill="none" stroke="#9ED3C4" strokeWidth={3} />
          {[13, 87].map((x) => (
            <G key={x}>
              <Rect x={x - 6} y={37} width={12} height={19} rx={6} fill="#9ED3C4" />
              <Rect x={x - 3.2} y={40.5} width={6.4} height={12} rx={3.2} fill="#F7B6C2" strokeWidth={1.1} />
            </G>
          ))}
          <Path d="M87 43 L87.8 44.8 L89.7 45 L88.3 46.2 L88.7 48 L87 47 L85.3 48 L85.7 46.2 L84.3 45 L86.2 44.8 Z" fill="#FFE070" stroke="none" />
        </G>
      );
    case 'crown':
      // A little crown perched on the hat's right puff.
      return (
        <G transform="rotate(16 64 -9)">
          <Path d="M55 -4 L54 -16 L59.5 -10.5 L64 -19 L68.5 -10.5 L74 -16 L73 -4 Z" fill="#FFD25C" stroke="#C9973E" strokeWidth={1.8} strokeLinejoin="round" />
          <Circle cx={64} cy={-8} r={2} fill="#F28C8C" />
          <Circle cx={58.5} cy={-7} r={1.1} fill="#9ED3C4" />
          <Circle cx={69.5} cy={-7} r={1.1} fill="#9ED3C4" />
        </G>
      );
    case 'goldtoque':
      // A gold-trimmed chef hat: a shiny band with a jewel, and a few sparkles.
      return (
        <G>
          <Path d="M36.7 11.5 Q50 15.5 63.3 11.5 L63 20 Q50 23 37 20 Z" fill="#FFD25C" stroke="#C9973E" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M39 14.6 Q50 18 61 14.6" fill="none" stroke="#FFF1B8" strokeWidth={1.2} strokeLinecap="round" />
          <Path d="M50 13.5 L53.2 17 L50 20.5 L46.8 17 Z" fill="#F2708C" stroke="#C9973E" strokeWidth={1.2} strokeLinejoin="round" />
          {[[29, -6, 1], [73, -13, 1.3], [76, 4, 0.8]].map(([x, y, k], i) => (
            <Path
              key={i}
              d={`M${x} ${y - 4 * k} Q${x} ${y} ${x + 4 * k} ${y} Q${x} ${y} ${x} ${y + 4 * k} Q${x} ${y} ${x - 4 * k} ${y} Q${x} ${y} ${x} ${y - 4 * k} Z`}
              fill="#FFD25C"
            />
          ))}
        </G>
      );
    default:
      return null;
  }
}

// A tall puffy toque with a pleated band and a red neckerchief.
function ChefHat() {
  return (
    <G stroke={LINE} strokeWidth={1.8} strokeLinejoin="round">
      <Circle cx={37} cy={0} r={9} fill="#FFFFFF" />
      <Circle cx={63} cy={0} r={9} fill="#FFFFFF" />
      <Circle cx={44} cy={-7} r={10} fill="#FFFFFF" />
      <Circle cx={57} cy={-7} r={10} fill="#FFFFFF" />
      <Path d="M36 4 Q50 9 64 4 L63 20 Q50 23 37 20 Z" fill="#FFFFFF" />
      <Path d="M43 9 V20 M50 10 V21.5 M57 9 V20" stroke="#E8DCCB" strokeWidth={1.4} />
    </G>
  );
}

// A gold coin drawn in code so it looks the same on every phone.
export function GoldCoin({ size = 16 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#F5C542',
        borderWidth: Math.max(1, size * 0.1),
        borderColor: '#C9962B',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: size,
          borderWidth: Math.max(1, size * 0.07),
          borderColor: '#E3AE34',
          backgroundColor: '#FAD766',
        }}
      />
    </View>
  );
}

// The squirrel's two little buck teeth, hanging from the mouth at y.
function Teeth({ y }: { y: number }) {
  return (
    <G stroke={LINE} strokeWidth={1.1} strokeLinejoin="round">
      <Path d={`M47.7 ${y} L52.3 ${y} L52.3 ${y + 3.2} Q52.3 ${y + 4} 51.5 ${y + 4} L48.5 ${y + 4} Q47.7 ${y + 4} 47.7 ${y + 3.2} Z`} fill="#FFFFFF" />
      <Path d={`M50 ${y} V${y + 4}`} />
    </G>
  );
}

// A cream-white duckling, told apart from the yellow chick by its colour, its wide flat rounded bill,
// A cream-white duckling, told apart from the fluffy yellow chick by its smooth outline, its wide flat rounded bill,
// webbed orange feet, little wing nubs and a feather curl. The baker adds a little blue sailor scarf.

// The bill: a broad rounded upper bill over a smaller lower one. It opens for happy and shock, and while straining
// it opens and shuts in a quack (t).
function DuckBill({ mood, t }: { mood: Mood; t: number }) {
  const open = mood === 'shock' ? 4.4 : mood === 'happy' ? 2.8 : 5 * t;
  return (
    <G stroke={LINE} strokeWidth={1.6} strokeLinejoin="round">
      {open > 0.3 && <Ellipse cx={50} cy={63.2 + open / 2} rx={7} ry={1.8 + open / 2} fill="#E8737F" stroke="none" />}
      <Path
        d="M42.5 61 Q50 64 57.5 61 Q56.8 67 50 67.2 Q43.2 67 42.5 61 Z"
        fill={DUCK_BILL_DARK}
        transform={`translate(0 ${open.toFixed(2)})`}
      />
      <Path d="M39 59.5 C39 55.6 44.5 55.2 50 56.2 C55.5 55.2 61 55.6 61 59.5 C61 63 56 64 50 63.6 C44 64 39 63 39 59.5 Z" fill={DUCK_BILL} />
      <Ellipse cx={44.4} cy={58} rx={3} ry={1.1} fill="#FFFFFF" opacity={0.6} stroke="none" transform="rotate(-8 44.4 58)" />
      <Ellipse cx={47} cy={59.4} rx={0.9} ry={0.6} fill={DUCK_BILL_DARK} stroke="none" />
      <Ellipse cx={53} cy={59.4} rx={0.9} ry={0.6} fill={DUCK_BILL_DARK} stroke="none" />
    </G>
  );
}

// Orange webbed feet with three rounded toes, turned a little outward.
function DuckFeet() {
  return (
    <G stroke={LINE} strokeWidth={SW} strokeLinejoin="round">
      {[39, 61].map((c) => {
        const x = (v: number) => (c + v).toFixed(1);
        return (
          <G key={c} transform={rot(c < 50 ? 10 : -10, c, 101)}>
            <Path
              d={`M${x(-3)} 100 C${x(-8)} 101.5 ${x(-11)} 104 ${x(-10.5)} 107.4 Q${x(-9)} 110.2 ${x(-5.4)} 108.6 Q${x(-3)} 111 ${x(0)} 109.2 Q${x(3)} 111 ${x(5.4)} 108.6 Q${x(9)} 110.2 ${x(10.5)} 107.4 C${x(11)} 104 ${x(8)} 101.5 ${x(3)} 100 Z`}
              fill={DUCK_BILL}
            />
            <Path d={`M${x(-1.5)} 103 L${x(-5.2)} 107.6 M${x(1.5)} 103 L${x(5.2)} 107.6`} stroke={DUCK_BILL_DARK} strokeWidth={1.1} strokeLinecap="round" fill="none" />
          </G>
        );
      })}
    </G>
  );
}

// Little rounded wing nubs at the sides of the body, part of it: only their outer edge is outlined, so they melt into
// the body. They flap up and down while straining.
function DuckWings({ look, t, pose }: { look: Look; t: number; pose: Pose }) {
  const flap = 24 * t * (0.7 + 0.3 * Math.sin(t * Math.PI * 6));
  return (
    <G>
      {wingSides(pose).map((side) => {
        const x = (v: number) => (50 + side * (v - 50)).toFixed(1);
        const edge = `M${x(31.2)} 77.5 C${x(26)} 77.8 ${x(21.4)} 81.4 ${x(21)} 86.2 C${x(20.8)} 89.4 ${x(23.4)} 90.6 ${x(26)} 89.6 C${x(27.6)} 89 ${x(28.8)} 89.2 ${x(30.2)} 90`;
        return (
          <G key={side} transform={rot(side * flap, +x(30.5), 84)}>
            <Path d={`${edge} L${x(34)} 90 L${x(34)} 77.5 Z`} fill={look.fur} />
            <Path d={edge} fill="none" stroke={LINE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
          </G>
        );
      })}
    </G>
  );
}

// The baker duck's sailor scarf: sky blue with a white stripe and two tails, over the usual baker's neckerchief.
function SailorScarf() {
  return (
    <G stroke={LINE} strokeWidth={1.6} strokeLinejoin="round">
      <Path d="M34 72 Q50 79 66 72 L64 77 Q50 84 36 77 Z" fill={SAILOR} />
      <Path d="M35.6 74.4 Q50 81 64.4 74.4" stroke="#FFFFFF" strokeWidth={1.2} fill="none" />
      <Path d="M51 79 L59.5 88.5 L48.5 85.5 Z" fill={SAILOR} />
      <Path d="M53 81.6 L56.6 85.8 L51.6 84.4" stroke="#FFFFFF" strokeWidth={1} fill="none" />
      <Circle cx={51} cy={79.6} r={2.3} fill={SAILOR} />
    </G>
  );
}

// The baker's feather tuft, peeking out from under the chef hat onto its forehead; it bounces while straining.
function DuckLick({ look, t }: { look: Look; t: number }) {
  return (
    <G transform={`translate(0 ${(1.2 * t).toFixed(2)}) ${rot(12 * t, 51, 19)}`}>
      <Path d="M45 19.5 Q44.6 25.4 48.2 27.8 Q47.6 24.6 50.4 23.2 Q52.6 27 56.2 26.6 Q53.6 24 54.8 19.5 Z" fill={look.fur} stroke={LINE} strokeWidth={1.8} strokeLinejoin="round" />
    </G>
  );
}

// The acorn the squirrel baker hugs to its tummy (standing, apron on); the resting paws hold it from the sides.
function Acorn() {
  return (
    <G stroke={LINE} strokeWidth={1.6} strokeLinejoin="round">
      <Path d="M43 83.5 Q43 93.5 50 97.5 Q57 93.5 57 83.5 Z" fill="#D58E55" />
      <Path d="M46 87 Q46.5 91.5 49 94" stroke="#F0B887" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M41.5 84.5 Q41.5 77 50 76.5 Q58.5 77 58.5 84.5 Q50 86.5 41.5 84.5 Z" fill="#9C6440" />
      <Path d="M45 79.5 L47.5 84.5 M50 77.5 L50 85 M55 79.5 L52.5 84.5" stroke="#7D4C2F" strokeWidth={1} />
      <Path d="M50 76.6 Q50.4 73.6 53 72.6" fill="none" stroke="#7D4C2F" strokeWidth={2} strokeLinecap="round" />
    </G>
  );
}

// The baker otter's little fish, hugged to its tummy under the paws; it wriggles while straining.
function OtterFish({ t }: { t: number }) {
  const w = Math.sin(t * Math.PI * 3) * 8 * t;
  return (
    <G transform={rot(-8 + w, 50, 87)} stroke="#6FA8C8" strokeWidth={1.5} strokeLinejoin="round">
      <Path d="M58 87 L66.5 81.5 Q65 87 66.5 92.5 Z" fill={OTTER_FISH} />
      <Path d="M38 87 Q45 79.5 53 81.5 Q58 83.5 59.5 87 Q58 90.5 53 92.5 Q45 94.5 38 87 Z" fill={OTTER_FISH} />
      <Path d="M49 82 Q51.5 87 49 92" fill="none" stroke="#8CC0DE" strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx={42.6} cy={86} r={1.2} fill="#3B4A5A" stroke="none" />
      <Ellipse cx={46} cy={84} rx={2.6} ry={1} fill="#FFFFFF" opacity={0.6} stroke="none" />
    </G>
  );
}

// ---- sea otter ----
// A baby sea otter, kept very simple: a round pale cream head with a soft bristly outline (no ears, no hood), small bead
// eyes set wide, a wide dark button nose and no mouth when calm, sitting on a soft taupe body. The baker hugs a little
// pink scallop shell. While straining its fuzz bristles up and it taps its shell.
const SO_HEAD = sampleEdge(headAt, 30);
// Bumps that end in a little pointed tuft instead of a soft scallop.
const SO_TUFTS = [3, 7, 10, 13, 17, 20, 23, 27];

function SeaOtterBack({ t }: { t: number }) {
  const edge = fluffPath(SO_HEAD, 1 + 0.6 * t, SO_TUFTS, 2.4 + 2.4 * t) + ' Z';
  return (
    <G>
      <Path d={edge} fill={LOOK.seaotter.fur} />
      <Path d={edge} fill="none" stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
    </G>
  );
}

function SeaOtterFront({ t }: { t: number }) {
  return (
    // a wide dark button nose (it covers the shared pink one) with a shine; it twitches up while straining
    <G transform={`translate(0 ${(-0.8 * t).toFixed(2)})`}>
      <Path d="M44.6 53.2 Q50 51.4 55.4 53.2 Q56 55.4 52.8 57.6 Q50 59.2 47.2 57.6 Q44 55.4 44.6 53.2 Z" fill={SO_EYE} />
      <Ellipse cx={47.6} cy={53.6} rx={1.5} ry={0.7} fill="#FFFFFF" opacity={0.75} />
    </G>
  );
}

// The shell: hugged to the tummy when standing (the resting paws hold it from the sides), otherwise tucked under the
// arm like a sea otter's pocket stone. It taps up and down while straining.
function Shell({ hug, t }: { hug: boolean; t: number }) {
  const at = hug
    ? `translate(50 ${(87 - 2.5 * t).toFixed(2)}) rotate(${(-8 * t).toFixed(2)})`
    : `translate(69.5 ${(93 - 3 * t).toFixed(2)}) rotate(${(18 - 14 * t).toFixed(2)}) scale(0.82)`;
  return (
    <G transform={at} stroke="#D98A8E" strokeWidth={1.5} strokeLinejoin="round">
      <Path d="M0 7.5 L-9 -1.5 Q-8.5 -9.5 0 -10 Q8.5 -9.5 9 -1.5 Z" fill="#FFCFC8" />
      <Path d="M0 7.5 L-5 -8.6 M0 7.5 L0 -10 M0 7.5 L5 -8.6" fill="none" strokeWidth={1.1} />
      <Path d="M-3.2 7.8 Q0 5.6 3.2 7.8 L2.4 10.4 Q0 11.4 -2.4 10.4 Z" fill="#FFB8B4" />
      <Ellipse cx={-4.4} cy={-5} rx={1.6} ry={2.4} fill="#FFFFFF" stroke="none" opacity={0.75} transform="rotate(-20 -4.4 -5)" />
    </G>
  );
}

// ---- dog ----
// The puppy's head edge round its own head shape instead of a smooth outline (Character skips the head's stroke for it):
// soft scallops over the crown and chin, and spiky terrier tufts sticking out at the cheeks. It puffs out while straining.
const DOG_EDGE = sampleEdge(headEdgeAt('dog'), 22);
// The plume tail: a short, puffy, scruffy plume up from the back beside the head, curling over toward the head.
const DOG_TAIL =
  'M68 97.5 Q73 101 78.6 98.6 Q83.4 101.6 87.4 97.6 Q92.6 99 94.4 94 L97.4 94.8 L96.4 91.6 Q101.6 90.4 101.4 85.6 ' +
  'Q105.6 82.4 103 78.4 L105.6 76.2 L101.6 75.6 Q101.6 70.2 96.6 69.6 Q94.6 65.4 90.2 67.6 L88.6 64.8 L87.4 68.6 ' +
  'Q84.4 70 85.2 73.8 Q89.4 76 89.2 80 Q88.6 86 81 88.6 Q75 90.4 68 90 Z';
const DOG_SHADE = '#D9BCA3'; // soft tan for the shaggy brows
const DOG_SPIKES = [4, 5, 6, 7, 8, 13, 14, 15, 16, 17]; // the cheeks, both sides (the edge runs right side down, then left up)
function DogFluff({ t }: { t: number }) {
  const d = fluffPath(DOG_EDGE, 1.4 + t, DOG_SPIKES, 3 + 1.5 * t) + ' Z';
  return (
    <G>
      <Path d={d} fill={LOOK.dog.fur} />
      <Path d={d} fill="none" stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
    </G>
  );
}

// ---- penguin ----
// A chubby baby penguin: a soft blue-grey cap and back, a white heart-shaped face mask and a big white belly, a tiny
// orange beak and orange feet, small flippers at its sides and the shared rosy cheeks. Sold for won, so in the kitchen it
// also glides with its tray and belly-slides when a bake is done (Kitchen's PenguinMotion). While straining its flippers
// flap fast and it wobbles side to side (뒤뚱뒤뚱).
const PG_ORANGE = '#FFB65C';
const PG_ORANGE_DARK = '#EE9A45';
const PG_MASK = 'M50 36.5 C45 29.5 26.5 29.5 21.5 40.5 C17 50 17.5 61 21 80 L79 80 C82.5 61 83 50 78.5 40.5 C73.5 29.5 55 29.5 50 36.5 Z';

// The whole drawing rocks side to side while straining: two little wobbles per strain cycle.
function penguinWobble(t: number) {
  return t > 0 ? [{ rotate: `${(9 * Math.sin(t * Math.PI * 2)).toFixed(2)}deg` }] : [];
}

// The white face mask, clipped to the head: it rises to a soft point between the eyes, leaving a blue-grey cap.
function PenguinFace() {
  return <Path d={PG_MASK} fill="#FFFFFF" />;
}

// The big white belly from the neck down (the baker's apron sits over it).
function PenguinBelly() {
  return <Path d="M38.5 74 Q50 70.5 61.5 74 Q68.5 86 65 96.5 Q59.5 103 50 103 Q40.5 103 35 96.5 Q31.5 86 38.5 74 Z" fill="#FFFFFF" />;
}

// The tiny orange beak; it opens for happy and shock, and pips open and shut while straining.
function PenguinBeak({ mood, t }: { mood: Mood; t: number }) {
  const open = mood === 'shock' ? 3.8 : mood === 'happy' ? 2.4 : 2.2 * Math.abs(Math.sin(t * Math.PI * 2));
  return (
    <G stroke={PG_ORANGE_DARK} strokeWidth={1.3} strokeLinejoin="round">
      {open > 0.3 && <Ellipse cx={50} cy={58.6 + open / 2} rx={3.4} ry={1.4 + open / 2} fill="#E8737F" stroke="none" />}
      <Path d="M46.6 58 Q50 59.2 53.4 58 Q52.2 61.8 50 62.2 Q47.8 61.8 46.6 58 Z" fill={PG_ORANGE_DARK} transform={`translate(0 ${open.toFixed(2)})`} />
      <Path d="M45.2 55.6 Q50 53 54.8 55.6 Q53.2 59.6 50 60.4 Q46.8 59.6 45.2 55.6 Z" fill={PG_ORANGE} />
      <Ellipse cx={48.4} cy={55.6} rx={1.5} ry={0.7} fill="#FFFFFF" opacity={0.7} stroke="none" />
    </G>
  );
}

// Small orange feet with three rounded toes, turned a little outward.
function PenguinFeet() {
  return (
    <G stroke={LINE} strokeWidth={SW} strokeLinejoin="round">
      {[40, 60].map((c) => {
        const x = (v: number) => (c + v).toFixed(1);
        return (
          <G key={c} transform={rot(c < 50 ? 12 : -12, c, 104)}>
            <Path
              d={`M${x(-8)} 104.5 C${x(-8)} 99.5 ${x(8)} 99.5 ${x(8)} 104.5 Q${x(7)} 109 ${x(2.7)} 107.6 Q${x(0)} 110 ${x(-2.7)} 107.6 Q${x(-7)} 109 ${x(-8)} 104.5 Z`}
              fill={PG_ORANGE}
            />
          </G>
        );
      })}
    </G>
  );
}

// Small flippers hanging at the sides of the body. Left out on the side of a raised arm (wave, cheer), which reads as
// the flipper lifted. While straining they flap fast, with little motion marks.
// Which folded wings to draw (side 1 is the viewer's left): none while both reach out (cheer, holding, a tool in
// them), and only the left one while the right waves.
function wingSides(pose: Pose) {
  return ([1, -1] as const).filter((side) => pose === 'stand' || (pose === 'wave' && side === 1));
}

function PenguinFlippers({ look, t, pose }: { look: Look; t: number; pose: Pose }) {
  const flap = 14 * t + 26 * Math.abs(Math.sin(t * Math.PI * 3.5)) * Math.min(1, t * 4);
  const sides = wingSides(pose);
  return (
    <G>
      {sides.map((side) => {
        const x = (v: number) => (50 + side * (v - 50)).toFixed(1);
        return (
          <G key={side}>
            <G transform={rot(side * (2 + flap), +x(32.5), 77.5)}>
              <Path
                d={`M${x(33.5)} 75.5 C${x(27)} 77.5 ${x(22.8)} 84.2 ${x(21.8)} 90.2 C${x(21.4)} 93.4 ${x(23.8)} 94.6 ${x(26)} 92.8 C${x(29.4)} 90 ${x(32)} 87 ${x(34.2)} 84 Z`}
                fill={look.fur}
                stroke={LINE}
                strokeWidth={SW}
                strokeLinejoin="round"
              />
            </G>
            {t > 0.15 && (
              <Path
                d={`M${x(14)} 76 Q${x(11.5)} 79 ${x(12)} 82.5 M${x(10)} 85 Q${x(8)} 88 ${x(9)} 91`}
                stroke={LINE}
                strokeWidth={1.4}
                strokeLinecap="round"
                fill="none"
                opacity={Math.min(1, (t - 0.15) * 2)}
              />
            )}
          </G>
        );
      })}
    </G>
  );
}

// ---- the unicorn (premium) ----
// A chubby cream baby unicorn: a pastel rainbow mane down one side, a little gold spiral horn and a puffy cloud fringe,
// leaf ears, a rainbow tail on the baker, and lilac hooves. Its strain flourish: the mane bounces and the horn glints.
// (Its kitchen special motions, the rainbow sparkles and star dust, are in Kitchen's UnicornMagic.)
const UNI_MANE = ['#F9B8CC', '#D7C4F3', '#B5E5CF', '#FCE29C'];
const UNI_HORN = '#FFE08A';
const UNI_HORN_LINE = '#D9A54A';
const UNI_HOOF = '#DCCDF2';
// Outfits that sit in front of the horn (the star badge reads as a star on its tip; the cherries hang beside it).
const UNI_PINS = ['star', 'cherry'];
// A soft four-point sparkle centred on x, y.
const sparklePath = (x: number, y: number, r: number) =>
  `M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`;

const UNI_EDGE = headEdgeAt('unicorn');
// The mane's strands down the right side of the head: [from s, to s round the outline, offset out, width, colour].
// Each ends in a little curl. The longest lies closest to the head, so the colours layer like a rainbow.
const UNI_STRANDS: [number, number, number, number, number][] = [
  [0.035, 0.335, 2.5, 6.4, 0], [0.05, 0.27, 7.4, 6, 1], [0.07, 0.2, 11.8, 5.4, 2],
];
function strandPath(from: number, to: number, off: number, lift: number, curl: number) {
  const pts: [number, number][] = [];
  const n = 18;
  let last = { x: 0, y: 0, nx: 0, ny: 0 };
  for (let i = 0; i <= n; i++) {
    const s = from + ((to - from) * i) / n;
    const e = UNI_EDGE(s);
    const o = off + lift * (i / n) + 1.2 * Math.sin((i / n) * Math.PI * 3);
    pts.push([e.x + e.nx * o, e.y + e.ny * o - lift * (i / n)]);
    last = e;
  }
  // a curl at the end, turning back in towards the head
  const [ex, ey] = pts[pts.length - 1];
  const tx = -last.ny;
  const ty = last.nx; // along the outline (clockwise)
  const cx = ex + last.nx * -curl;
  const cy = ey + last.ny * -curl;
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 1.1;
    const r = curl * (1 - i * 0.07);
    pts.push([cx + last.nx * Math.cos(a) * r + tx * Math.sin(a) * r, cy + last.ny * Math.cos(a) * r + ty * Math.sin(a) * r]);
  }
  return 'M' + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L');
}
function UnicornMane({ t }: { t: number }) {
  // The strands share one outline (all outlines first, then the fills), so they read as one striped rainbow mane.
  // While straining they bounce up and out, the outer ones more.
  const strands = UNI_STRANDS.map(([a, b, off, w, c], i) => ({ d: strandPath(a, b, off, t * (1.5 + i * 1.2), 2.6), w, c: UNI_MANE[c] }));
  return (
    <G strokeLinecap="round" strokeLinejoin="round" fill="none">
      {strands.map(({ d, w }, i) => (
        <Path key={'o' + i} d={d} stroke={LINE} strokeWidth={w + SW * 2} />
      ))}
      {strands.slice().reverse().map(({ d, w, c }, i) => (
        <Path key={'f' + i} d={d} stroke={c} strokeWidth={w} />
      ))}
    </G>
  );
}

function UnicornEars({ look, t }: { look: Look; t: number }) {
  // Upright leaf ears; they wiggle out while straining.
  return (
    <G strokeLinejoin="round">
      {[1, -1].map((side) => {
        const x = (v: number) => 50 + side * (v - 50);
        return (
          <G key={side} transform={rot(-side * 12 * t, x(30), 26)}>
            <Path d={`M${x(24)} 32 C${x(16)} 23 ${x(14.5)} 12 ${x(18)} 4.5 C${x(25.5)} 8 ${x(33)} 14 ${x(37)} 22 Z`} fill={look.fur} stroke={LINE} strokeWidth={SW} />
            <Path d={`M${x(25)} 26.5 C${x(20.5)} 20.5 ${x(19.5)} 14.5 ${x(20.8)} 10 C${x(25)} 12.5 ${x(29.5)} 16.5 ${x(32)} 21.5 Z`} fill={look.ear} />
          </G>
        );
      })}
    </G>
  );
}

function UnicornMuzzle({ look }: { look: Look }) {
  // A soft pink muzzle with two little nostrils (instead of the shared nose).
  return (
    <G>
      <Ellipse cx={50} cy={60} rx={11.5} ry={7.6} fill={look.light} />
      <Ellipse cx={46.4} cy={57.4} rx={1.25} ry={0.95} fill="#E9A3B5" />
      <Ellipse cx={53.6} cy={57.4} rx={1.25} ry={0.95} fill="#E9A3B5" />
    </G>
  );
}

// The forelock: a cloud fringe of round pastel puffs, bigger and lower on the left so it sweeps to one side. The puffs
// are drawn as one sticker (all outlines, then all fills) so they merge into one fluffy cloud. It sits under the hat
// band on the baker (a little higher on the guest's bare head) and bounces while straining.
// [x, y, r, mane colour]
const UNI_FRINGE_PUFFS: [number, number, number, number][] = [
  [29, 31, 5.4, 2], [36.5, 28.6, 6.6, 1], [45, 26, 7.2, 0], [57.5, 24.8, 6.2, 1], [65.5, 26.6, 5, 2], [51, 21, 7, 0],
];
const uniPuff = (x: number, y: number, r: number) => `M${x - r} ${y} A${r} ${r} 0 1 0 ${x + r} ${y} A${r} ${r} 0 1 0 ${x - r} ${y} Z`;
function UnicornForelock({ t, apron }: { t: number; apron?: boolean }) {
  const y0 = apron ? 0 : -2.5;
  const parts = UNI_FRINGE_PUFFS.map(([x, y, r, c]): [string, string] => [uniPuff(x, y, r), UNI_MANE[c]]);
  return (
    <G transform={`translate(0 ${(y0 - 2 * t).toFixed(2)})`}>
      {parts.map(([d], i) => (
        <Path key={'o' + i} d={d} fill={LINE} stroke={LINE} strokeWidth={SW * 2} strokeLinejoin="round" />
      ))}
      {parts.map(([d, c], i) => (
        <Path key={'f' + i} d={d} fill={c} />
      ))}
      <G stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.85}>
        <Path d="M32.8 26.4 Q34.6 24.4 37.4 24.2" />
        <Path d="M41 23.2 Q43 21.2 46 21" />
      </G>
      <G stroke={LINE} strokeWidth={1.1} strokeLinecap="round" fill="none" opacity={0.55}>
        <Path d="M34 32 Q36.5 33.4 39 32" />
        <Path d="M42.4 30 Q45 31.6 47.6 30" />
        <Path d="M63.2 29.4 Q65.5 30.6 67.8 29.4" />
      </G>
    </G>
  );
}

// The little gold spiral horn on the forehead, in front of the chef hat (taller on the guest, with no hat on).
// While straining it glints: a shine runs up it and a sparkle pops at the tip.
function UnicornHorn({ t, apron }: { t: number; apron?: boolean }) {
  const tip = apron ? 10 : 2;
  const base = 34;
  const hw = 6;
  const len = base - tip;
  const at = (u: number) => base - len * u; // y at a fraction up the horn
  const half = (u: number) => hw * (1 - u) + 0.6 * u; // half width there
  const d = `M${50 - hw} ${base} Q${50 - hw * 0.55} ${at(0.55)} 50 ${tip} Q${50 + hw * 0.55} ${at(0.55)} ${50 + hw} ${base} Q50 ${base + 2.4} ${50 - hw} ${base} Z`;
  const glint = 0.15 + 0.7 * t;
  return (
    <G>
      <Path d={d} fill={UNI_HORN} stroke={LINE} strokeWidth={1.9} strokeLinejoin="round" />
      {[0.22, 0.45, 0.67].map((u) => (
        <Path
          key={u}
          d={`M${(50 - half(u)).toFixed(2)} ${(at(u) + 1.6).toFixed(2)} Q50 ${(at(u) + 0.6).toFixed(2)} ${(50 + half(u)).toFixed(2)} ${(at(u) - 1.8).toFixed(2)}`}
          stroke={UNI_HORN_LINE}
          strokeWidth={1.1}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <Path d={`M${50 - hw * 0.45} ${base - 2} Q${50 - hw * 0.4} ${at(0.45)} ${50 - 0.9} ${at(0.8)}`} stroke="#FFF8DA" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      {t > 0.04 && (
        <G opacity={Math.min(1, t * 1.6)}>
          <Ellipse cx={50} cy={at(glint)} rx={half(glint) * 0.8} ry={1.3} fill="#FFFFFF" opacity={0.85} />
          <Path d={sparklePath(55.5, tip - 1.5, 2.5 + 3.5 * t)} fill="#FFF3B0" stroke={UNI_HORN_LINE} strokeWidth={0.9} strokeLinejoin="round" />
          <Path d={sparklePath(44, tip + 4, 1.2 + 1.8 * t)} fill="#FFFFFF" stroke="#E6BFD9" strokeWidth={0.7} strokeLinejoin="round" />
        </G>
      )}
    </G>
  );
}

function UnicornTail({ t }: { t: number }) {
  // A flowing rainbow tail of three locks; it swishes up while straining.
  const locks: [string, string][] = [
    ['M66 99 C78 103 90 101 92 90 C93.5 83 97 80 100 79', UNI_MANE[1]],
    ['M66 96 C77 97 86 93 86.5 84 C87 78 90 73 94 71', UNI_MANE[0]],
    ['M66 97.5 C75 99 82 96 82 89', UNI_MANE[2]],
  ];
  return (
    <G transform={rot(-22 * t, 68, 96)}>
      {locks.map(([d], i) => (
        <Path key={'o' + i} d={d} stroke={LINE} strokeWidth={6.5 + SW * 2} strokeLinecap="round" fill="none" />
      ))}
      {locks.map(([d, c], i) => (
        <Path key={'f' + i} d={d} stroke={c} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      ))}
    </G>
  );
}

// Little hooves under round cream feet.
function UnicornHooves() {
  return (
    <G stroke={LINE} strokeWidth={SW} strokeLinejoin="round">
      {[39, 61].map((x) => (
        <G key={x}>
          <Ellipse cx={x} cy={104.5} rx={9} ry={5.8} fill={LOOK.unicorn.fur} />
          <Path d={`M${x - 8.6} 106 Q${x} 103.6 ${x + 8.6} 106 Q${x + 7} 110.6 ${x} 110.6 Q${x - 7} 110.6 ${x - 8.6} 106 Z`} fill={UNI_HOOF} strokeWidth={1.7} />
        </G>
      ))}
    </G>
  );
}

// ---- the baby dragon (premium) ----
// A chubby mint baby dragon: soft butter-yellow horns, lilac ear fins and bat wings, a cream snout and belly, and (on
// the baker) a little tail with a heart-shaped tip. Its own strain flourish: the wings flap, the fins flutter and two
// little puffs of smoke snort out of its nostrils. Its special motions (blowing a flame into the oven, heart flames)
// are drawn by Special.tsx; here the face only puffs its cheeks and makes an "o".
const DRAGON_HORN = '#FFE6A8';
const DRAGON_WING = '#DCCBF5';
const DRAGON_RIB = '#BFA9E8';
const DRAGON_SPOT = '#A6DCC1';
const DRAGON_NOSTRIL = '#7DB49A';
const DRAGON_PLATE = '#EBD6AC';
const DRAGON_HEART = '#F9AFC2';
const SMOKE_LINE = '#D6CAC0';

// Horns and ear fins (and, on the guest with no hat, a soft crest of three bumps), all tucked behind the head.
function DragonHorns({ look, t, apron }: { look: Look; t: number; apron?: boolean }) {
  const s = { stroke: LINE, strokeWidth: SW, strokeLinejoin: 'round' as const };
  return (
    <G>
      {!apron && (
        <G fill={DRAGON_WING} {...s}>
          <Circle cx={43} cy={18} r={4.4} />
          <Circle cx={57} cy={18} r={4.4} />
          <Circle cx={50} cy={14.6} r={5} />
        </G>
      )}
      {[1, -1].map((side) => {
        const x = (v: number) => (50 + side * (v - 50)).toFixed(2);
        return (
          <G key={side}>
            {/* a little leafy fin on each side of the head; it flutters while straining */}
            <G transform={rot(side * 14 * t, +x(17), 38)}>
              <Path
                d={`M${x(20)} 29.5 L${x(8)} 27 Q${x(11.5)} 31.5 ${x(9.6)} 36.5 Q${x(13.4)} 39 ${x(12.4)} 44 L${x(16)} 46 Z`}
                fill={look.ear}
                {...s}
              />
              <Path d={`M${x(17)} 31.6 L${x(11)} 29.6 M${x(16)} 38.4 L${x(12)} 38.4`} stroke={DRAGON_RIB} strokeWidth={1.1} strokeLinecap="round" />
            </G>
            {/* a short soft horn, set out to the side so the chef hat never covers it */}
            <Path
              d={`M${x(29)} 24 Q${x(24.5)} 15 ${x(25.6)} 9.4 Q${x(27)} 5.8 ${x(30)} 8.6 Q${x(34.6)} 13.6 ${x(38)} 21.5 Z`}
              fill={DRAGON_HORN}
              {...s}
            />
            <Path d={`M${x(27.6)} 15.6 Q${x(30)} 15.2 ${x(31.4)} 13.4`} stroke="#EBC77E" strokeWidth={1.1} strokeLinecap="round" fill="none" />
          </G>
        );
      })}
    </G>
  );
}

// Little bat wings at the shoulders, behind the body; they flap up while straining.
function DragonWings({ look, t }: { look: Look; t: number }) {
  // the wings sweep out and down to the sides, then back up
  const flap = 38 * t;
  return (
    <G>
      {[1, -1].map((side) => {
        const x = (v: number) => (50 + side * (v - 50)).toFixed(2);
        return (
          <G key={side} transform={rot(-side * flap, +x(34), 80)}>
            <Path
              d={`M${x(35)} 77 C${x(29)} 70.5 ${x(22)} 66 ${x(13)} 63.5 Q${x(13.6)} 70 ${x(17.6)} 72.4 Q${x(17.4)} 78 ${x(22.6)} 80.2 Q${x(24)} 85.4 ${x(30)} 87.5 Z`}
              fill={DRAGON_WING}
              stroke={LINE}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <Path d={`M${x(33)} 78 L${x(17.6)} 72.4 M${x(33)} 80 L${x(22.6)} 80.2`} stroke={DRAGON_RIB} strokeWidth={1.2} strokeLinecap="round" />
            {/* the wing's bony top edge in the body colour */}
            <Path d={`M${x(34)} 76.6 C${x(28.6)} 70.8 ${x(22)} 66.6 ${x(14.6)} 64.4`} stroke={look.fur} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          </G>
        );
      })}
    </G>
  );
}

// Soft plates across the cream belly (hidden under the apron on the baker).
function DragonBelly() {
  return (
    <G stroke={DRAGON_PLATE} strokeWidth={1.2} strokeLinecap="round" fill="none">
      <Path d="M42.4 87.6 Q50 89.6 57.6 87.6" />
      <Path d="M40.6 92.4 Q50 94.6 59.4 92.4" />
      <Path d="M42.4 97.2 Q50 99 57.6 97.2" />
    </G>
  );
}

// The baker's tail: a short chubby tail curling up beside the body, with a heart-shaped tip.
function DragonTail({ look }: { look: Look }) {
  return (
    <G>
      <Limb d="M63 98 Q85 103 89.6 92 Q91.6 87 90.4 82.5" fill={look.fur} width={6.4} />
      <Path d={heartPath(90.6, 76.4, 6)} fill={DRAGON_HEART} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" transform={rot(-8, 90.6, 79)} />
      <G fill={DRAGON_WING} stroke={LINE} strokeWidth={1.4} strokeLinejoin="round">
        <Path d="M75.2 98.2 L77.4 93.4 L79.6 97.8 Z" />
        <Path d="M84.4 94.4 L88.4 91.2 L88.4 96 Z" />
      </G>
    </G>
  );
}

// Cheeks puffed full of air before a blow, bulging out past the face (drawn behind the head).
function DragonCheeks({ look, puff }: { look: Look; puff: number }) {
  if (puff < 0.04) return null;
  const r = 4 + 8.5 * puff;
  return (
    <G fill={look.fur} stroke={LINE} strokeWidth={SW}>
      <Circle cx={20 - 3 * puff} cy={60.5} r={r} />
      <Circle cx={80 + 3 * puff} cy={60.5} r={r} />
    </G>
  );
}

// The little round mouth while it breathes in (pressed shut) and blows ("o").
function DragonMouth({ special }: { special: Special }) {
  const { blowing, strength } = specialPhase(special);
  return blowing ? (
    <Ellipse cx={50} cy={63} rx={2.4 + 0.8 * strength} ry={2.6 + 1 * strength} fill="#E8737F" stroke={LINE} strokeWidth={1.2} />
  ) : (
    <Path d="M47.4 62 Q50 63 52.6 62" fill="none" stroke={LINE} strokeWidth={1.8} strokeLinecap="round" />
  );
}

// While straining: two little puffs of smoke snort out of the nostrils and drift out over the cheeks.
function DragonSnort({ t }: { t: number }) {
  if (t < 0.08) return null;
  return (
    <G opacity={Math.min(1, t * 1.6) * (1 - 0.35 * t)}>
      {[1, -1].map((side) => {
        const x = 50 - side * (6 + 16 * t);
        const y = 58 + 3 * t;
        return (
          <G key={side} fill="#FFFFFF" stroke={SMOKE_LINE} strokeWidth={1.2}>
            <Circle cx={x} cy={y} r={2.4 + 2.4 * t} />
            <Circle cx={x - side * (3.4 + 2.4 * t)} cy={y - 2} r={1.6 + 1.8 * t} />
            <Circle cx={x + side * (1.6 + 1.4 * t)} cy={y + 2.6 + t} r={1.2 + 1.2 * t} />
          </G>
        );
      })}
    </G>
  );
}
