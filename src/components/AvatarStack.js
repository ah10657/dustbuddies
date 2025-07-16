import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { decorMap } from '../lib/svgMap';

export default function AvatarStack({ avatar, size = 100, style }) {
  const AvatarSkin = decorMap[avatar?.skin];
  const AvatarEyes = decorMap[avatar?.eyes];
  const AvatarHair = decorMap[avatar?.hair];
  const AvatarTop = decorMap[avatar?.top];
  const AvatarBottom = decorMap[avatar?.bottom];
  const AvatarShoes = decorMap[avatar?.shoes];

  // Breathing animation: up and down
  const breathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathAnim]);

  // Interpolate translateY for breathing effect (e.g., 0 to +4 px, subtle and downward)
  const breathTranslateY = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  return (
    <View style={[styles.avatarContainer, { width: size, height: size }, style]}>
      <Animated.View style={{ transform: [{ translateY: breathTranslateY }], position: 'absolute', width: size, height: size }}>
        {AvatarSkin && <AvatarSkin width={size} height={size} style={styles.layer} />}
        {AvatarEyes && <AvatarEyes width={size} height={size} style={styles.layer} />}
        {AvatarBottom && <AvatarBottom width={size} height={size} style={styles.layer} />}
        {AvatarTop && <AvatarTop width={size} height={size} style={styles.layer} />}
        {AvatarHair && <AvatarHair width={size} height={size} style={styles.layer} />}
      </Animated.View>
      {/* Shoes stay static, rendered above or below as needed for stacking */}
      {AvatarShoes && <AvatarShoes width={size} height={size} style={styles.layer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'absolute',
    bottom: 75,
    right: 20,
  },
  layer: {
    position: 'absolute',
  },
});
