import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, ClipPath, G, Path, Rect } from 'react-native-svg';

const BLADES = [
  { d: 'M 256 256 C 272 180, 300 120, 350 90 C 395 62, 435 85, 440 140 C 445 192, 425 230, 395 252 Z', fill: '#D9A441' },
  { d: 'M 256 256 C 325 228, 388 232, 428 268 C 462 300, 456 345, 425 380 C 396 410, 358 415, 325 396 Z', fill: '#0F8563' },
  { d: 'M 256 256 C 300 302, 325 360, 312 415 C 300 458, 265 470, 228 450 C 195 432, 175 402, 175 370 Z', fill: '#0B6E50' },
  { d: 'M 256 256 C 225 318, 182 372, 135 390 C 92 406, 62 378, 62 336 C 62 298, 80 270, 112 252 Z', fill: '#063C2C' },
  { d: 'M 256 256 C 188 275, 125 268, 85 235 C 48 204, 52 162, 80 128 C 106 98, 140 88, 178 98 Z', fill: '#074B36' },
  { d: 'M 256 256 C 210 205, 186 148, 198 100 C 210 56, 248 42, 282 56 C 315 68, 330 92, 330 125 Z', fill: '#0F8563' },
  { d: 'M 256 256 C 278 210, 288 155, 272 108 C 258 66, 228 55, 202 70 C 178 85, 165 112, 172 148 Z', fill: '#0A5C42' },
];

const SEPARATORS = [
  'M 256 256 C 272 180, 300 120, 350 90',
  'M 256 256 C 325 228, 388 232, 428 268',
  'M 256 256 C 300 302, 325 360, 312 415',
  'M 256 256 C 225 318, 182 372, 135 390',
  'M 256 256 C 188 275, 125 268, 85 235',
  'M 256 256 C 210 205, 186 148, 198 100',
  'M 256 256 C 278 210, 288 155, 272 108',
];

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
            <Circle cx="256" cy="256" r="200" />
          </ClipPath>
        </Defs>
        <G clipPath="url(#venega-clip)">
          {BLADES.map((blade, index) => (
            <Path key={index} d={blade.d} fill={blade.fill} />
          ))}
          <G stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" fill="none">
            {SEPARATORS.map((sep, index) => (
              <Path key={index} d={sep} />
            ))}
          </G>
        </G>
        <Circle cx="256" cy="256" r="35" fill="#FFFFFF" />
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
    fontFamily: 'Sora',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
});
