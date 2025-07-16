import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import { avatarParts } from '../lib/svgMap';

// SVG Imports
import LongHair from '../assets/images/avatar/long_hair.svg';
import ShortHair from '../assets/images/avatar/short_hair.svg';
import Eyes from '../assets/images/avatar/eyes.svg';
import Shirt from '../assets/images/avatar/shirt.svg';
import Pants from '../assets/images/avatar/pants.svg';
import Dress from '../assets/images/avatar/dress.svg';
import Shoes from '../assets/images/avatar/shoes.svg';
import AvatarBase from '../assets/images/avatar/skin.svg';
import AvatarStack from '../components/AvatarStack';
import global from '../styles/global';

const { width, height } = Dimensions.get('window');
const ITEM_CATEGORIES = Object.keys(avatarParts);
const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(avatarParts).map(([key, val]) => [key, val.label])
);

const DEFAULT_AVATAR = Object.fromEntries(
  Object.entries(avatarParts).map(([part, { options }]) => [
    part,
    Object.keys(options)[0] // first available option for each part
  ])
);

const MAIN_TABS = [
  { key: 'appearance', label: 'Appearance', categories: ['skin', 'eyes', 'hair'] },
  { key: 'clothes', label: 'Clothes', categories: ['top', 'bottom', 'shoes'] },
];

export default function CharacterCreatorScreen() {
  const navigation = useNavigation();
  const [mainTab, setMainTab] = useState(MAIN_TABS[0].key);
  const [selectedCategory, setSelectedCategory] = useState(MAIN_TABS[0].categories[0]);
  const [selectedItems, setSelectedItems] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const userId = getUserId();
        const userRef = doc(db, 'user', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().avatar) {
          setSelectedItems({
            ...DEFAULT_AVATAR,
            ...userSnap.data().avatar,
          });
        } else {
          setSelectedItems(DEFAULT_AVATAR);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setSelectedItems(DEFAULT_AVATAR);
      } finally {
        setLoading(false);
      }
    };
    fetchAvatar();
  }, []);

  // When mainTab changes, reset selectedCategory to the first in that tab
  useEffect(() => {
    const tabObj = MAIN_TABS.find(t => t.key === mainTab);
    if (tabObj && !tabObj.categories.includes(selectedCategory)) {
      setSelectedCategory(tabObj.categories[0]);
    }
  }, [mainTab]);

  if (loading) {
    return <View style={styles.avatarPreview}><Text>Loading...</Text></View>;
  }

  const handleSelectItem = (item) => {
    setSelectedItems({
      ...selectedItems,
      [selectedCategory]: selectedItems[selectedCategory] === item ? null : item,
    });
  };

  const handleSaveAndGoBack = async () => {
    try {
      const userId = getUserId();
      const userRef = doc(db, 'user', userId);
      // Fetch the current avatar to preserve features like skin
      const userSnap = await getDoc(userRef);
      const prevAvatar = userSnap.exists() && userSnap.data().avatar ? userSnap.data().avatar : {};
      // Merge unchanged features
      const mappedAvatar = { ...prevAvatar };
      Object.entries(selectedItems).forEach(([key, value]) => {
        if (value) {
          mappedAvatar[key] = value; // value is always a decorMap key
        }
      });
      await updateDoc(userRef, {
        avatar: mappedAvatar,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  // Get the categories for the current main tab
  const currentTabObj = MAIN_TABS.find(t => t.key === mainTab);
  const visibleCategories = currentTabObj ? currentTabObj.categories : [];

  return (
    <View style={[styles.container, { backgroundColor: '#5EB1CC', flex: 1, alignItems: 'center' }]}> {/* Use your app's blue as background */}
      {/* Avatar Preview Area - flush to top */}
      <View style={{ alignItems: 'center', width: '70%', marginBottom: 10, borderRadius: 30, backgroundColor: '#fff' }}>
        <AvatarStack
          avatar={selectedItems}
          size={height / 2}
          style={{ alignSelf: 'center' }}
        />
      </View>

      {/* Main Tabs (Appearance/Clothes) */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%'}}>
        {MAIN_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setMainTab(tab.key)}
            style={[
              styles.tab,
              mainTab === tab.key && styles.activeTab,
              { paddingHorizontal: 18, paddingVertical: 8, width: '50%', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                mainTab === tab.key && styles.activeTabText,
                { fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Customization Tabs (filtered by main tab) */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
        {visibleCategories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.tab,
              selectedCategory === category && styles.activeTab,
              {
                width: `${100 / visibleCategories.length}%`,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 0,
                paddingHorizontal: 0,
                paddingVertical: 10,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === category && styles.activeTabText,
                { fontWeight: 'bold', textAlign: 'center' },
              ]}
            >
              {CATEGORY_LABELS[category]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Customization Options - bottom 1/3, 2 rows, 3 columns */}
      <View style={{ justifyContent: 'flex-end', backgroundColor: '#95CCDD', paddingBottom: 100 }}>
        <FlatList
          data={Object.keys(avatarParts[selectedCategory].options)}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
          renderItem={({ item }) => {
            const Component = avatarParts[selectedCategory].options[item];
            const isSelected = selectedItems[selectedCategory] === item;
            return (
              <TouchableOpacity
                onPress={() => handleSelectItem(item)}
                style={[
                  styles.squareTile,
                  isSelected && { borderColor: '#ff9c33', borderWidth: 2 },
                  { backgroundColor: '#fff', margin: 8, borderRadius: 12, width: width * .30, height: width * .30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
                ]}
              >
                {Component && <Component />}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* I'm done! Button fixed at the bottom */}
      <View style={styles.bottomButtonContainer} pointerEvents="box-none">
        <View style={styles.bottomButtonBackground} />
        <TouchableOpacity
          style={global.shopButton}
          onPress={handleSaveAndGoBack}
        >
          <Text style={global.shopButtonText}>I'm done!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5EB1CC',
    paddingTop: 20,
  },
  avatarPreview: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 500,

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
    color: '#ff9c33',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    zIndex: 10,
  },
  bottomButtonBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#95CCDD', // or your preferred color
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 80,
  },
});
