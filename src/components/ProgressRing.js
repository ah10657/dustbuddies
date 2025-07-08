import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/**
 * ProgressRing component visually matches the sun's middle ring from the SVG.
 * - progress: number (0-100)
 * - size: diameter of the ring (default 48)
 */
const ProgressRing = ({ progress = 0, size = 48 }) => {
  // Sun SVG values
  const cx = size / 2;
  const cy = size / 2;
  // Middle ring radius from SVG: 23.85, outer: 28.32, inner: 18.57
  // We'll scale to fit the given size
  const baseRadius = 23.85;
  const baseSize = 65.39 * 2; // SVG's cx * 2 (approximate diameter)
  const scale = size / baseSize;
  const radius = baseRadius * scale;
  const strokeWidth = 8 * scale;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Outer sun ring (optional, for visual match) */}
        <Circle
          cx={cx}
          cy={cy}
          r={28.32 * scale}
          fill="#fcfc8c"
        />
        {/* Middle ring as progress bar */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#f6bc51"
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#f6bc51"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx},${cy}`}
        />
        {/* Inner sun ring (optional, for visual match) */}
        <Circle
          cx={cx}
          cy={cy}
          r={18.57 * scale}
          fill="#dfa31f"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" justifyContent="center" alignItems="center">
        <Text style={{ fontSize: size * 0.28, fontWeight: 'bold', color: '#dfa31f', textAlign: 'center' }}>{`${progress}%`}</Text>
      </View>
    </View>
  );
};

export default ProgressRing;
