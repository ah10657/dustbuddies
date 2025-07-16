import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';

// SVG Imports
import LongHair from '../assets/images/avatar/long_hair.svg';
import ShortHair from '../assets/images/avatar/short_hair.svg';
import Eyes from '../assets/images/avatar/eyes.svg';
import Shirt from '../assets/images/avatar/shirt.svg';
import Pants from '../assets/images/avatar/pants.svg';
import Dress from '../assets/images/avatar/dress.svg';
import Shoes from '../assets/images/avatar/shoes.svg';
import AvatarBase from '../assets/images/avatar/skin.svg';

const ITEM_CATEGORIES = {
  hair: ['long_hair.svg', 'short_hair.svg', 'eyes.svg'],
  shirt: ['shirt.svg'],
  pants: ['dress.svg', 'pants.svg'],
  shoes: ['shoes.svg'],
};

const CATEGORY_LABELS = {
  hair: 'Hair/Makeup',
  shirt: 'Shirts',
  pants: 'Pants/Skirts',
  shoes: 'Shoes',
};

const creatorAssetMap = {
  'long_hair.svg': LongHair,
  'short_hair.svg': ShortHair,
  'eyes.svg': Eyes,
  'shirt.svg': Shirt,
  'pants.svg': Pants,
  'dress.svg': Dress,
  'shoes.svg': Shoes,
};

export default function CharacterCreatorScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('hair');
  const [selectedItems, setSelectedItems] = useState({
    hair: null,
    eyes: null,
    shirt: null,
    pants: null,
    shoes: null,
  });

  const handleSelectItem = (item) => {
    let key = selectedCategory;
    if (selectedCategory === 'hair') {
      key = item.includes('eyes') ? 'eyes' : 'hair';
    }
    const current = selectedItems[key];
    setSelectedItems({
      ...selectedItems,
      [key]: current === item ? null : item,
    });
  };

  const handleSaveAndGoBack = async () => {
    try {
      const userId = getUserId();
      const userRef = doc(db, 'user', userId);
      await updateDoc(userRef, {
        avatar: selectedItems,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar Preview */}
      <View style={styles.avatarPreview}>
        <View style={styles.avatarPlatform} />
        <AvatarBase width={200} height={200} style={[styles.avatarItem, { zIndex: 2 }]} />

        {selectedItems.eyes && (() => {
          const EyesComponent = creatorAssetMap[selectedItems.eyes];
          return EyesComponent ? (
            <EyesComponent
              width={60}
              height={30}
              style={[
                styles.avatarItem,
                {
                  zIndex: 3,
                },
              ]}
            />
          ) : null;
        })()}

        {selectedItems.hair && (() => {
          const HairComponent = creatorAssetMap[selectedItems.hair];
          return HairComponent ? (
            <HairComponent
              width={200}
              height={200}
              style={[styles.avatarItem, { zIndex: 4 }]}
            />
          ) : null;
        })()}

        {selectedItems.shirt && (() => {
          const ShirtComponent = creatorAssetMap[selectedItems.shirt];
          return ShirtComponent ? (
            <ShirtComponent
              width={200}
              height={200}
              style={[styles.avatarItem, { zIndex: 5 }]}
            />
          ) : null;
        })()}

        {selectedItems.pants && (() => {
          const PantsComponent = creatorAssetMap[selectedItems.pants];
          return PantsComponent ? (
            <PantsComponent
              width={200}
              height={200}
              style={[styles.avatarItem, { zIndex: 5 }]}
            />
          ) : null;
        })()}

        {selectedItems.shoes && (() => {
          const ShoesComponent = creatorAssetMap[selectedItems.shoes];
          return ShoesComponent ? (
            <ShoesComponent
              width={200}
              height={200}
              style={[styles.avatarItem, { zIndex: 6 }]}
            />
          ) : null;
        })()}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {Object.keys(ITEM_CATEGORIES).map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.tab,
              selectedCategory === category && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === category && styles.activeTabText,
              ]}
            >
              {CATEGORY_LABELS[category]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Item Scroll */}
      <FlatList
          data={ITEM_CATEGORIES[selectedCategory]}
          keyExtractor={(item) => item}
          numColumns={4} // Adjust based on screen width
          contentContainerStyle={styles.itemsGrid}
          renderItem={({ item }) => {
            const Component = creatorAssetMap[item];
            const isSelected = Object.values(selectedItems).includes(item);
            return (
              <TouchableOpacity
                onPress={() => handleSelectItem(item)}
                style={[
                  styles.squareTile,
                  isSelected && { borderColor: '#ff9c33', borderWidth: 2 },
                ]}
              >
                {Component && <Component width={50} height={50} />}
              </TouchableOpacity>
            );
          }}
        />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleSaveAndGoBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d4e9ff',
    paddingTop: 20,
  },
  avatarPreview: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarPlatform: {
    position: 'absolute',
    bottom: 30,
    width: 160,
    height: 250,
    borderRadius: 80,
    backgroundColor: '#b4dcff',
    zIndex: 1,
  },
  avatarItem: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    position: 'absolute',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffe5b4',
    paddingVertical: 10,
  },
  tab: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffd580',
  },
  activeTab: {
    backgroundColor: '#ff9c33',
  },
  tabText: {
    color: '#333',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsGrid: {
      paddingHorizontal: 10,
      paddingBottom: 80,
      alignItems: 'center',
  },
  squareTile: {
    width: 80,
    height: 80,
    backgroundColor: '#fcb45e',
    borderRadius: 12,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ff9c33',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
