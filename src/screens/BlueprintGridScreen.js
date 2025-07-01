import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, PanResponder, Dimensions, ScrollView, TouchableOpacity, Animated } from 'react-native';
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

  // Helper: Snap to grid
  const snapToGrid = (x, y) => ({
    x: Math.max(0, Math.min(GRID_WIDTH - 1, Math.round(x / CELL_SIZE))),
    y: Math.max(0, Math.min(GRID_HEIGHT - 1, Math.round(y / CELL_SIZE)))
  });

  // Helper: Check if a room would overlap any other placed room (excluding itself)
  const wouldOverlap = (testRoom, idxToIgnore = null) => {
    return rooms.some((r, i) =>
      r.placed && i !== idxToIgnore && isOverlap(testRoom, r)
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
        }
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
  const placedRooms = rooms.filter(r => r.placed);

  const handleDone = async () => {
    if (unplacedRooms.length > 0) return;
    navigation.goBack();
  };

  return (
    <View style={styles.container}
      onMoveShouldSetResponder={() => !!dragging}
      onResponderMove={handleMove}
      onResponderRelease={handleRelease}
    >
      <Text style={styles.header}>Drag your rooms onto the grid!</Text>
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
        style={styles.grid}
        ref={gridRef}
        onLayout={e => setGridLayout(e.nativeEvent.layout)}
      >
        {[...Array(GRID_HEIGHT)].map((_, row) => (
          <View key={row} style={styles.gridRow}>
            {[...Array(GRID_WIDTH)].map((_, col) => (
              <View key={col} style={styles.gridCell} />
            ))}
          </View>
        ))}
        {placedRooms.map((room, idx) => {
          const realIdx = rooms.findIndex(r => r.display_name === room.display_name);
          return (
            <Animated.View
              key={room.display_name}
              style={[
                styles.room,
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
              <Text style={styles.roomLabel}>{room.display_name}</Text>
              {/* Resize handle in bottom right */}
              <View
                style={styles.resizeHandle}
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
              styles.floatingRoom,
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
            <Text style={styles.roomLabel}>{rooms[dragging.idx].display_name}</Text>
          </Animated.View>
        )}
      </View>
      <Button title="I'm done!" onPress={handleDone} disabled={!!(unplacedRooms.length > 0 || dragging || resizing)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#6EC1E4' },
  header: { fontSize: 20, color: 'white', marginBottom: 8 },
  scrollBar: { minHeight: 60, maxHeight: 60, marginBottom: 8 },
  unplacedRoom: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginHorizontal: 8, elevation: 2 },
  grid: { position: 'relative', width: CELL_SIZE * GRID_WIDTH, height: CELL_SIZE * GRID_HEIGHT, backgroundColor: '#A7D8F5', borderRadius: 16, alignSelf: 'center', marginBottom: 16 },
  gridRow: { flexDirection: 'row' },
  gridCell: { width: CELL_SIZE, height: CELL_SIZE, borderWidth: 0.5, borderColor: '#fff' },
  room: { position: 'absolute', backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  roomLabel: { color: '#333', fontWeight: 'bold' },
  resizeHandle: { position: 'absolute', right: 0, bottom: 0, width: 20, height: 20, backgroundColor: 'rgba(0,0,0,0.2)', borderBottomRightRadius: 8, zIndex: 10 },
  floatingRoom: { backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 4, borderWidth: 1, borderColor: '#2196f3' },
});
