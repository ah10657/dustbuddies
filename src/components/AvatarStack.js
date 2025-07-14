import React from 'react';
import { View, StyleSheet } from 'react-native';
import { decorMap } from '../lib/svgMap';

export default function AvatarStack({ avatar, size = 100, style }) {
  const AvatarSkin = decorMap[avatar?.skin];
  const AvatarEyes = decorMap[avatar?.eyes];
  const AvatarHair = decorMap[avatar?.hair];
  const AvatarTop = decorMap[avatar?.top];
  const AvatarBottom = decorMap[avatar?.bottom];
  const AvatarShoes = decorMap[avatar?.shoes];

  return (
    <View style={[styles.avatarContainer, { width: size, height: size }, style]}>
      {AvatarSkin && <AvatarSkin width={size} height={size} style={styles.layer} />}
      {AvatarEyes && <AvatarEyes width={size} height={size} style={styles.layer} />}
      {AvatarBottom && <AvatarBottom width={size} height={size} style={styles.layer} />}
      {AvatarTop && <AvatarTop width={size} height={size} style={styles.layer} />}
        {AvatarShoes && <AvatarShoes width={size} height={size} style={styles.layer} />}
      {AvatarHair && <AvatarHair width={size} height={size} style={styles.layer} />}
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
