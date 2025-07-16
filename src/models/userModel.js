import { doc, getDoc,setDoc, collection, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Your initialized Firestore
import { serverTimestamp } from 'firebase/firestore';


export const getUserData = async (userId) => {
  const userDoc = await getDoc(doc(db, 'user', userId));
  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    return null;
  }
};

export const updateUserLastLogin = async (userId) => {
  try {
    const userRef = doc(db, 'user', userId);
    await updateDoc(userRef, {
      last_login_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login time:', error);
    // Don't throw error as this is not critical for login flow
  }
};

export const initializeNewUser = async (userId, options = {}) => {
  const userRef = doc(db, 'user', userId);

  // Step 1: Base user profile
  await setDoc(userRef, {
    avatar: options.avatar || {
      bottom: 'pants',
      eyes: 'eyes',
      hair: 'shortHair',
      shoes: 'shoes',
      skin: 'skin',
      top: 'shirt',
    },
    coins: 100,
    // Add any other fields from options if needed
    ...options.otherUserData,
  });

  // Step 2: Room templates
  const roomData = options.rooms || [
    {
      display_name: 'Front Yard',
      room_type: 'house',
      floor: 0,
      decor: {
        background: 'homeScreenYard',
        ground: 'yardGround',
        bike: 'bike',
        home: 'house',
        sun: 'sun',
      },
    },
    {
      display_name: 'Bathroom',
      room_type: 'bathroom',
      floor: 0,
      decor: {
        pref_floor: 'bathroomFloor',
        pref_toilet: 'toilet',
        pref_toilet_paper: 'toiletPaper',
        pref_trashcan: 'trashcanSmall',
        pref_tub: 'bathtub',
        pref_wall: 'bathroomWall',
        pref_wall_mirror: 'wallMirror',
      },
      layout: {
        height: 2,
        width: 1,
        x: 0,
        y: 0,
      },
    },
    {
      display_name: 'Bedroom',
      room_type: 'bedroom',
      floor: 0,
      decor: {
        pref_bed: 'bed',
        pref_nightstand: '',
        pref_rug: '',
        pref_side: '',
        pref_wall: 'bedroomWall',
        pref_floor: 'bedroomFloor',
        pref_window: '',
      },
      layout: {
        height: 5,
        width: 4,
        x: 1,
        y: 0,
      },
    },
  ];

  // Step 3: Starter tasks per room type (expand as needed)
  const starterTasks = {
    bedroom: [
      { task_name: 'Vacuum', recurrence: 'daily' },
      { task_name: 'Make Bed', recurrence: 'daily' },
      { task_name: 'Dust', recurrence: 'weekly' },
      { task_name: 'Organize Storage Room', recurrence: 'weekly' },
    ],
    bathroom: [
      { task_name: 'Clean Sink', recurrence: 'daily' },
      { task_name: 'Wipe Mirror', recurrence: 'daily' },
      { task_name: 'Scrub Toilet', recurrence: 'weekly' },
      { task_name: 'Empty Trash', recurrence: 'weekly' },
      { task_name: 'Clean Tub', recurrence: 'weekly' },
      { task_name: 'Sweep Floor', recurrence: 'weekly' },
      { task_name: 'Mop Floor', recurrence: 'weekly' },
    ],
    kitchen: [
      { task_name: 'Wipe Counters', recurrence: 'daily' },
      { task_name: 'Wipe Table', recurrence: 'daily' },
      { task_name: 'Dishes', recurrence: 'daily' },
      { task_name: 'Sweep Floor', recurrence: 'daily' },
      { task_name: 'Take Out Trash', recurrence: 'weekly' },
      { task_name: 'Mop Floor', recurrence: 'weekly' },
      { task_name: 'Wipe Stove', recurrence: 'monthly' },
      { task_name: 'Clean Fridge', recurrence: 'monthly' },
    ],
    livingroom: [
      { task_name: 'Wipe Windows', recurrence: 'daily' },
      { task_name: 'Vacuum', recurrence: 'weekly' },
      { task_name: 'Dust', recurrence: 'weekly' },
      { task_name: 'Clean Upholstery', recurrence: 'monthly' },
    ],
    storageroom: [
      { task_name: 'Declutter', recurrence: 'monthly' },
      { task_name: 'Dust', recurrence: 'monthly' },
    ],
    laundryroom: [
      { task_name: 'Fold Laundry', recurrence: 'weekly' },
      { task_name: 'Wipe Machines', recurrence: 'monthly' },
    ],
    // Add more room types as needed
  };
  const defaultTasks = [
    { task_name: 'Tidy Up', recurrence: 'weekly' }
  ];

  // Step 4: Create rooms and tasks
  const roomsRef = collection(userRef, 'rooms');

  // Default decor for each room type
  const defaultDecor = {
    bedroom: {
      pref_bed: 'bed',
      pref_nightstand: '',
      pref_rug: '',
      pref_side: 'standingMirror',
      pref_wall_decor: 'framedPicture',
      pref_floor: 'bedroomFloor',
      pref_wall: 'bedroomWall',
      pref_window: '',
    },
    bathroom: {
      pref_floor: 'bathroomFloor',
      pref_toilet: 'toilet',
      pref_toilet_paper: 'toiletPaper',
      pref_trashcan: 'trashcanSmall',
      pref_tub: 'bathtub',
      pref_wall: 'bathroomWall',
      pref_wall_mirror: 'wallMirror',
    },
    kitchen: {
      pref_floor: 'kitchenFloor',
      pref_wall: 'kitchenWall',
      pref_cupboards: 'cupboards',
    },
    laundryroom: {
      pref_floor: 'laundryFloor',
      pref_wall: 'laundryWall',
      pref_washer_dryer: 'washerDryer',
      pref_shelf: 'laundryShelf',
    },
    livingroom: {
      pref_floor: 'bedroomFloor',
      pref_wall: 'livingRoomWall',
      pref_wall_decor: 'framedPictureSun',
      pref_couch: 'couch',
      pref_coffee_table: '',
      pref_side: 'pottedPlant',
      pref_window: 'windowBasic'
    },
    storageroom: {
      pref_wall: 'storageRoom'},
    house: {
      background: 'homeScreenYard',
      ground: 'yardGround',
      bike: 'bike',
      home: 'house',
      sun: 'sun',
    },
    // Add more as needed
  };

  for (const room of roomData) {
    const roomType = room.room_type;
    const decor = room.decor || defaultDecor[roomType] || {};
    const roomRef = doc(roomsRef); // auto-ID
    await setDoc(roomRef, {
      display_name: room.display_name,
      room_type: room.room_type,
      decor, // always assign decor
      ...(room.layout ? { layout: room.layout } : {}),
      ...(room.floor !== undefined ? { floor: room.floor } : {}),
    });

    // Use starterTasks for the room_type, or defaultTasks if not found
    const tasks = starterTasks[room.room_type] || defaultTasks;
    if (tasks) {
      const taskCollectionRef = collection(roomRef, 'room_tasks');
      for (const task of tasks) {
        const taskRef = doc(taskCollectionRef);
        await setDoc(taskRef, {
          ...task,
          task_complete: false,
          last_completed_at: '', // You can use serverTimestamp() if needed
        });
      }
    }
  }
};

// Delete all user data and the authenticated user
export async function deleteUserAccount(userId, user) {
  // Delete all rooms and their tasks
  const roomsSnap = await getDocs(collection(db, 'user', userId, 'rooms'));
  for (const roomDoc of roomsSnap.docs) {
    // Delete all tasks in this room
    const tasksSnap = await getDocs(collection(db, 'user', userId, 'rooms', roomDoc.id, 'room_tasks'));
    for (const taskDoc of tasksSnap.docs) {
      await deleteDoc(doc(db, 'user', userId, 'rooms', roomDoc.id, 'room_tasks', taskDoc.id));
    }
    // Delete the room itself
    await deleteDoc(doc(db, 'user', userId, 'rooms', roomDoc.id));
  }
  // Delete the user document
  await deleteDoc(doc(db, 'user', userId));
  // Delete the authenticated user
  await user.delete();
}
