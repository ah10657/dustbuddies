// src/models/roomsModel.js

import { Task } from './tasksModel';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export class Room {
  constructor(id, data) {
    this.id = id;
    this.name = data.name || 'Unnamed Room';
    this.room_type = data.room_type || 'room';

    // Decor structure (for SVG rendering)
    this.decor = {
      background: data.decor?.background || 'defaultBackground',
      home: data.decor?.home || 'defaultHouse',
    };

    // Optional: normalize task data into Task models
    this.tasks = Array.isArray(data.tasks)
      ? data.tasks.map((t) => new Task(t))
      : [];
  }
}

// 🏠 Find the house room for HomeScreen
export const getHouseRoom = async (userId) => {
  try {
    const roomsRef = collection(db, 'user', userId, 'rooms');
    const roomsSnapshot = await getDocs(roomsRef);

    const houseRoomDoc = roomsSnapshot.docs.find(doc => doc.data().room_type === 'house');
    
    if (houseRoomDoc) {
      return {
        id: houseRoomDoc.id,
        ...houseRoomDoc.data()
      };
    }
    
    console.warn('No house room found, falling back to first room');
    // Fallback to first room if no house room is found
    const firstRoomDoc = roomsSnapshot.docs[0];
    if (firstRoomDoc) {
      return {
        id: firstRoomDoc.id,
        ...firstRoomDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching house room:', error);
    return null;
  }
};
