import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, PanResponder, Dimensions, ScrollView, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import global from '../styles/global';
// import your firebase config and user context as needed

const GRID_WIDTH = 4;
const GRID_HEIGHT = 5;
const CELL_SIZE = Math.floor(Dimensions.get('window').width / GRID_WIDTH);

function isOverlap(roomA, roomB) {
  // Returns true if roomA and roomB overlap
  return (
    roomA.layout.x < roomB.layout.x + (roomB.layout.width || 1) &&
    roomA.layout.x + (roomA.layout.width || 1) > roomB.layout.x &&
    roomA.layout.y < roomB.layout.y + (roomB.layout.height || 1) &&
    roomA.layout.y + (roomA.layout.height || 1) > roomB.layout.y
  );
}

export default function BlueprintGridScreen({ route, navigation }) {
  const initialRooms = route.params.rooms.map(room => ({ ...room, placed: false, layout: { ...room.layout } }));
  const [rooms, setRooms] = useState(initialRooms);
  const [dragging, setDragging] = useState(null); // { idx, offsetX, offsetY, fromBar }
  const [resizing, setResizing] = useState(null); // { idx, startX, startY, startWidth, startHeight }
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const gridRef = useRef();
  const [gridLayout, setGridLayout] = useState({ x: 0, y: 0 });
  const numFloors = route.params.numFloors || 1;
  const [currentFloor, setCurrentFloor] = useState(0);

  // Helper: Snap to grid
  const snapToGrid = (x, y) => ({
    x: Math.max(0, Math.min(GRID_WIDTH - 1, Math.round(x / CELL_SIZE))),
    y: Math.max(0, Math.min(GRID_HEIGHT - 1, Math.round(y / CELL_SIZE)))
  });

  // Helper: Check if a room would overlap any other placed room (excluding itself)
  const wouldOverlap = (testRoom, idxToIgnore = null) => {
    return rooms.some((r, i) =>
      r.placed &&
      i !== idxToIgnore &&
      r.floor === currentFloor && // Only check overlap on the current floor
      isOverlap(testRoom, r)
    );
  };

  // Helper: Check if a room would be off the grid
  const isOffGrid = (room) => {
    return (
      room.layout.x < 0 ||
      room.layout.y < 0 ||
      room.layout.x + (room.layout.width || 1) > GRID_WIDTH ||
      room.layout.y + (room.layout.height || 1) > GRID_HEIGHT
    );
  };

  // Drag from scroll bar
  const handleBarPressIn = (roomIdx, e) => {
    const { pageX, pageY } = e.nativeEvent;
    setDragging({
      idx: roomIdx,
      offsetX: CELL_SIZE / 2,
      offsetY: CELL_SIZE / 2,
      fromBar: true
    });
    setDragPos({ x: pageX - CELL_SIZE / 2, y: pageY - CELL_SIZE / 2 });
  };

  // Drag placed room
  const createPlacedRoomPanResponder = (room, idx) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gesture) => {
      const { pageX, pageY, locationX, locationY } = e.nativeEvent;
      setDragging({
        idx,
        offsetX: locationX,
        offsetY: locationY,
        fromBar: false
      });
      setDragPos({ x: pageX - locationX, y: pageY - locationY });
    },
    onPanResponderMove: (e, gesture) => {
      const { pageX, pageY } = e.nativeEvent;
      setDragPos({ x: pageX - dragging.offsetX, y: pageY - dragging.offsetY });
    },
    onPanResponderRelease: (e, gesture) => {
      const { pageX, pageY } = e.nativeEvent;
      const gridX = pageX - gridLayout.x - dragging.offsetX + CELL_SIZE / 2;
      const gridY = pageY - gridLayout.y - dragging.offsetY + CELL_SIZE / 2;
      const snapped = snapToGrid(gridX, gridY);
      const newRoom = {
        ...rooms[idx],
        layout: {
          ...rooms[idx].layout,
          x: snapped.x,
          y: snapped.y
        },
        floor: currentFloor
      };
      // Prevent off-grid and overlap
      if (!isOffGrid(newRoom) && !wouldOverlap(newRoom, idx)) {
        setRooms(rooms => rooms.map((r, i) =>
          i === idx ? newRoom : r
        ));
      }
      setDragging(null);
    }
  });

  // Resize handle
  const createResizePanResponder = (room, idx) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gesture) => {
      setResizing({
        idx,
        startX: e.nativeEvent.pageX,
        startY: e.nativeEvent.pageY,
        startWidth: room.layout.width || 1,
        startHeight: room.layout.height || 1
      });
    },
    onPanResponderMove: (e, gesture) => {
      if (!resizing) return;
      const dx = e.nativeEvent.pageX - resizing.startX;
      const dy = e.nativeEvent.pageY - resizing.startY;
      const newWidth = Math.max(1, Math.min(GRID_WIDTH - room.layout.x, Math.round(resizing.startWidth + dx / CELL_SIZE)));
      const newHeight = Math.max(1, Math.min(GRID_HEIGHT - room.layout.y, Math.round(resizing.startHeight + dy / CELL_SIZE)));
      const newRoom = {
        ...rooms[idx],
        layout: {
          ...rooms[idx].layout,
          width: newWidth,
          height: newHeight
        }
      };
      // Prevent off-grid and overlap
      if (!isOffGrid(newRoom) && !wouldOverlap(newRoom, idx)) {
        setRooms(rooms => rooms.map((r, i) => i === idx ? newRoom : r));
      }
    },
    onPanResponderRelease: () => setResizing(null)
  });

  // Handle drag move (global)
  const handleMove = (e) => {
    if (!dragging) return;
    setDragPos({ x: e.nativeEvent.pageX - dragging.offsetX, y: e.nativeEvent.pageY - dragging.offsetY });
  };

  // Handle drag release (global)
  const handleRelease = (e) => {
    if (!dragging) return;
    const { pageX, pageY } = e.nativeEvent;
    const gridX = pageX - gridLayout.x - dragging.offsetX + CELL_SIZE / 2;
    const gridY = pageY - gridLayout.y - dragging.offsetY + CELL_SIZE / 2;
    const snapped = snapToGrid(gridX, gridY);
    const idx = dragging.idx;
    const newRoom = {
      ...rooms[idx],
      placed: true,
      floor: currentFloor,
      layout: {
        ...rooms[idx].layout,
        x: snapped.x,
        y: snapped.y,
        width: rooms[idx].layout.width || 1,
        height: rooms[idx].layout.height || 1
      }
    };
    // Prevent off-grid and overlap
    if (
      !isOffGrid(newRoom) &&
      !wouldOverlap(newRoom, idx)
    ) {
      setRooms(rooms => rooms.map((r, i) =>
        i === idx ? newRoom : r
      ));
    }
    setDragging(null);
  };

  // Unplaced and placed rooms
  const unplacedRooms = rooms.filter(r => !r.placed);
  const placedRooms = rooms.filter(r => r.placed && r.floor === currentFloor);

  const handleDone = async () => {
    if (unplacedRooms.length > 0) return;
    let finalRooms = rooms.map(r => ({
      ...r,
      floor: r.floor ?? 0,
      ...(r.room_type === 'house' ? { placed: true } : {})
    }));
    if (!finalRooms.some(r => r.room_type === 'house')) {
      finalRooms = [
        {
          display_name: 'Front Yard',
          room_type: 'house',
          floor: 0,
          decor: {
            background: 'homeScreenYard',
            bike: 'bike',
            home: 'house',
            sun: 'sun',
          },
          placed: true,
        },
        ...finalRooms,
      ];
    }
    try {
      await AsyncStorage.setItem('pendingBlueprint', JSON.stringify(finalRooms));
    } catch (e) {
      console.warn('Could not save blueprint:', e);
    }
    navigation.navigate('Signup');
  };

  return (
    <View style={global.gridContainer}
      onMoveShouldSetResponder={() => !!dragging}
      onResponderMove={handleMove}
      onResponderRelease={handleRelease}
    >
      {/* Back button */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 16, left: 16, zIndex: 100 }}
        onPress={() => navigation.navigate('BlueprintSetup', { rooms: route.params.rooms, numFloors: route.params.numFloors })}
      >
        <Text style={{ fontSize: 24, color: '#fff' }}>{'← Back'}</Text>
      </TouchableOpacity>
      <Text style={global.headerText}>Drag your rooms onto the grid!</Text>
      {/* Horizontal scroll bar for unplaced rooms */}
      <ScrollView horizontal style={styles.scrollBar} contentContainerStyle={{ alignItems: 'center' }}>
        {unplacedRooms.map((room, idx) => {
          const realIdx = rooms.findIndex(r => r.display_name === room.display_name);
          return (
            <TouchableOpacity
              key={room.display_name}
              style={styles.unplacedRoom}
              onPressIn={e => handleBarPressIn(realIdx, e)}
            >
              <Text style={styles.roomLabel}>{room.display_name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Grid with placed rooms */}
      <View
        style={[global.grid, { width: GRID_WIDTH * CELL_SIZE, height: GRID_HEIGHT * CELL_SIZE }]}
        ref={gridRef}
        onLayout={e => setGridLayout(e.nativeEvent.layout)}
      >
        {[...Array(GRID_HEIGHT)].map((_, row) => (
          <View key={row} style={global.gridRow}>
            {[...Array(GRID_WIDTH)].map((_, col) => (
              <View key={col} style={[global.gridCell, { width: CELL_SIZE, height: CELL_SIZE }]} />
            ))}
          </View>
        ))}
        {placedRooms.map((room, idx) => {
          const realIdx = rooms.findIndex(r => r.display_name === room.display_name);
          return (
            <Animated.View
              key={room.display_name}
              style={[
                global.roomBoxMap,
                {
                  left: room.layout.x * CELL_SIZE,
                  top: room.layout.y * CELL_SIZE,
                  width: (room.layout.width || 1) * CELL_SIZE,
                  height: (room.layout.height || 1) * CELL_SIZE,
                  zIndex: resizing && resizing.idx === realIdx ? 20 : 10
                }
              ]}
              {...createPlacedRoomPanResponder(room, realIdx).panHandlers}
            >
              {/* Remove button */}
              <TouchableOpacity
                style={global.removeButton}
                onPress={() => setRooms(rooms => rooms.map((r, i) => i === realIdx ? { ...r, placed: false } : r))}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
              <Text style={global.roomBoxMapText}>{room.display_name}</Text>
              {/* Resize handle in bottom right */}
              <View
                style={global.resizeHandle}
                {...createResizePanResponder(room, realIdx).panHandlers}
              />
            </Animated.View>
          );
        })}
        {/* Floating room while dragging */}
        {dragging && (
          <Animated.View
            pointerEvents="none"
            style={[
              global.roomBoxMap,
              {
                position: 'absolute',
                left: dragPos.x - gridLayout.x,
                top: dragPos.y - gridLayout.y,
                width: CELL_SIZE,
                height: CELL_SIZE,
                zIndex: 100,
                opacity: 0.8,
              }
            ]}
          >
            <Text style={global.roomBoxMapText}>{rooms[dragging.idx].display_name}</Text>
          </Animated.View>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
        {[...Array(numFloors)].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setCurrentFloor(i)} style={{ margin: 4, padding: 8, backgroundColor: currentFloor === i ? '#2196f3' : '#eee', borderRadius: 8 }}>
            <Text style={{ color: currentFloor === i ? '#fff' : '#333' }}>Floor {i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="I'm done!" onPress={handleDone} disabled={!!(unplacedRooms.length > 0 || dragging || resizing)} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollBar: { minHeight: 60, maxHeight: 60, marginBottom: 8 },
  unplacedRoom: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginHorizontal: 8, elevation: 2 },
  roomLabel: { color: '#333', fontWeight: 'bold' },
});
