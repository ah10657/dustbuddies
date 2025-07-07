import { doc, getDoc,setDoc, collection } from 'firebase/firestore';
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
        pref_floor: '',
        pref_toilet: 'toilet',
        pref_toilet_paper: 'toiletPaper',
        pref_trashcan: 'trashcanSmall',
        pref_tub: 'bathtub',
        pref_wall: 'mainBathroom',
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
        pref_wall: 'basicBedroom',
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
      { task_name: 'Organize Closet', recurrence: 'weekly' },
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
    closet: [
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

  for (const room of roomData) {
    const roomRef = doc(roomsRef); // auto-ID
    await setDoc(roomRef, {
      display_name: room.display_name,
      room_type: room.room_type,
      ...(room.decor ? { decor: room.decor } : {}),
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
