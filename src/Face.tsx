import { Circle, Ellipse, G, Path } from 'react-native-svg';

// The tiny face every ingredient drawing shares, so the fridge reads as a shelf of little friends.
export const INK = '#5A4A48';
const BLUSH = '#F7B6BE';

export function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
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
