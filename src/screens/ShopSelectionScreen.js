import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated as RNAnimated } from 'react-native';
import global from '../styles/global';
import { decorMap } from '../lib/svgMap';

export default function ShopSelectionScreen({ navigation }) {
  const StoreMap = decorMap.storeMap;
  const StoreBoutique = decorMap.storeBoutique;
  const StoreFurniture = decorMap.storeFurniture;
  const StoreHardware = decorMap.storeHardware;
  const StoreSalon = decorMap.storeSalon;

  // Wobble animation (like bike)
  const wobbleAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(wobbleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        RNAnimated.timing(wobbleAnim, { toValue: -1, duration: 600, useNativeDriver: true }),
        RNAnimated.timing(wobbleAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [wobbleAnim]);
  const rotate = wobbleAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-2deg', '0deg', '2deg'] });
  const skew = wobbleAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-1deg', '0deg', '1deg'] });

  // These positions/sizes are estimates and may need adjustment for your SVG map
  // All values are in percentages relative to the parent View (width/height)
  const storeOverlays = [
    {
      key: 'boutique',
      Component: StoreBoutique,
      style: {
        position: 'absolute',
        left: '10%',
        top: '20%',
        width: '30%',
        height: '30%',
        zIndex: 2,
      },
    },
    {
      key: 'furniture',
      Component: StoreFurniture,
      style: {
        position: 'absolute',
        left: '50%',
        top: '5%',
        width: '30%',
        height: '30%',
        zIndex: 2,
      },
    },
    {
      key: 'hardware',
      Component: StoreHardware,
      style: {
        position: 'absolute',
        left: '12%',
        top: '68%',
        width: '30%',
        height: '30%',
        zIndex: 2,
      },
    },
    {
      key: 'salon',
      Component: StoreSalon,
      style: {
        position: 'absolute',
        left: '60%',
        top: '55%',
        width: '30%',
        height: '30%',
        zIndex: 2,
      },
    },
  ];

  return (
    <View style={[global.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}> 
      {/* Store map background */}
      <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}>
        {StoreMap && <StoreMap width="100%" height="100%" style={{ position: 'absolute' }} />}
      </View>
      {/* Store clickable overlays */}
      <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 2 }} pointerEvents="box-none">
        {storeOverlays.map(({ key, Component, style }) => (
          <TouchableOpacity
            key={key}
            style={style}
            activeOpacity={0.7}
            onPress={() => console.log(`Pressed ${key}`)}
          >
            <RNAnimated.View style={{ width: '100%', height: '100%', transform: [{ rotate }, { skewX: skew }] }}>
              {Component && <Component width="100%" height="100%" />}
            </RNAnimated.View>
          </TouchableOpacity>
        ))}
      </View>
      {/* Foreground content */}
      <Text style={global.shopMessage}>Not Open Yet! See you soon! 🛍️</Text>
      <TouchableOpacity
        style={global.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={global.shopButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
