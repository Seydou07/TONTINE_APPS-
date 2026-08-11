import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, Path, ClipPath } from 'react-native-svg';

const CX = 256;
const CY = 256;
const BLADE_COUNT = 6;

const polar = (r: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};

const bladePath = (index: number): string => {
  const a = index * (360 / BLADE_COUNT);
  const b = a + 360 / BLADE_COUNT;
  const mid = (a + b) / 2;

  const p1 = polar(100, a);
  const p2 = polar(200, mid);
  const p3 = polar(100, b);
  const c1 = polar(120, a + 12);
  const c2 = polar(190, mid - 12);
  const c3 = polar(190, mid + 12);
  const c4 = polar(120, b - 12);

  return `M ${CX} ${CY} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} C ${c3.x.toFixed(1)} ${c3.y.toFixed(1)} ${c4.x.toFixed(1)} ${c4.y.toFixed(1)} ${p3.x.toFixed(1)} ${p3.y.toFixed(1)} Z`;
};

const GREEN_SHADES = ['#0F8563', '#0B6E50', '#086B4B', '#07563F', '#074B36'];

const separatorPath = (angleDeg: number): string => {
  const p = polar(196, angleDeg);
  return `M ${CX} ${CY} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
};

const SEPARATOR_ANGLES = Array.from({ length: BLADE_COUNT }, (_, i) => i * (360 / BLADE_COUNT) + 30);

interface VenegaLogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
}

export default function VenegaLogo({ size = 120, showWordmark = true, wordmarkColor = '#074B36' }: VenegaLogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          <ClipPath id="venega-clip">
            <Circle cx={CX} cy={CY} r="202" />
          </ClipPath>
        </Defs>
        <G clipPath="url(#venega-clip)">
          {Array.from({ length: BLADE_COUNT }, (_, index) => {
            const d = bladePath(index);
            const fill = index === 0 ? '#D9A441' : GREEN_SHADES[index - 1];
            return <Path key={index} d={d} fill={fill} />;
          })}
          <G stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none">
            {SEPARATOR_ANGLES.map((angle, index) => (
              <Path key={index} d={separatorPath(angle)} />
            ))}
          </G>
        </G>
        <Circle cx={CX} cy={CY} r="38" fill="#FFFFFF" />
      </Svg>
      {showWordmark && (
        <Text style={[styles.wordmark, { color: wordmarkColor }]}>Venega</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  wordmark: {
    marginTop: 12,
    fontFamily: 'SoraBold',
    fontSize: 30,
    letterSpacing: -1.5,
  },
});
