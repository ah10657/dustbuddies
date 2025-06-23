import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

/**
 * AnimatedSun component renders the sun SVG and animates the middle ring as a progress bar.
 * - progress: number (0-100)
 * - size: width of the SVG (default 100)
 */
const SVG_WIDTH = 93.6;
const SVG_HEIGHT = 66.01;
const SUN_CX = 65.39;
const SUN_CY = 37.8;
const OUTER_R = 28.32;
const INNER_R = 18.57;
const PROGRESS_R = INNER_R + (OUTER_R - INNER_R) * 0.28;
const PROGRESS_STROKE = (OUTER_R - INNER_R) * 0.5;

const AnimatedSun = ({ progress = 0, size = 200 }) => {
  // Calculate height from aspect ratio
  const aspectRatio = SVG_HEIGHT / SVG_WIDTH;
  const width = size;
  const height = size * aspectRatio;
  // Scale SVG coordinates to rendered size
  const scaleX = width / SVG_WIDTH;
  const scaleY = height / SVG_HEIGHT;
  // Center of the sun in rendered coordinates
  const sunCenterX = SUN_CX * scaleX;
  const sunCenterY = SUN_CY * scaleY;
  // Middle ring radius and stroke width in rendered coordinates
  const r = PROGRESS_R; // SVG units
  const strokeWidth = PROGRESS_STROKE; // SVG units
  const circumference = 2 * Math.PI * r;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width, height, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
        {/* Outer ring */}
        <Circle cx={SUN_CX} cy={SUN_CY} r={OUTER_R} fill="#F7FF89" />
        {/* Progress ring as thick arc */}
        <Circle
          cx={SUN_CX}
          cy={SUN_CY}
          r={PROGRESS_R}
          fill="#F7BD50"
          stroke="#F7BD50"
          strokeWidth={PROGRESS_STROKE}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
        />
        {/* Inner ring */}
        <Circle cx={SUN_CX} cy={SUN_CY} r={INNER_R} fill="#E7A120" />
        {/* Sun rays */}
        <Line x1={3} y1={31.04} x2={26.79} y2={33.78} fill="#F7FF89" stroke="#F7FF89" strokeLinecap="round" strokeMiterlimit={10} strokeWidth={10} />
        <Line x1={6.99} y1={60.76} x2={30.08} y2={54.42} fill="#F7FF89" stroke="#F7FF89" strokeLinecap="round" strokeMiterlimit={10} strokeWidth={10} />
        <Line x1={34.7} y1={14.44} x2={13.67} y2={3} fill="#F7FF89" stroke="#F7FF89" strokeLinecap="round" strokeMiterlimit={10} strokeWidth={10} />
      </Svg>
      {/* Centered percentage text at sun's center */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            left: sunCenterX - width / 2,
            top: sunCenterY - height / 2,
            width,
            height,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Text style={{ fontSize: width * 0.13, fontWeight: 'bold', color: '#fff', textAlign: 'center', textShadowColor: '#f7b32b', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>{`${progress}%`}</Text>
      </View>
    </View>
  );
};

export default AnimatedSun; 