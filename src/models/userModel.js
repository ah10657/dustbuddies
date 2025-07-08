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

export const initializeNewUser = async (userId) => {
  const userRef = doc(db, 'user', userId);

  // Step 1: Base user profile
  await setDoc(userRef, {
    avatar: {
      bottom: 'pants',
      eyes: 'eyes',
      hair: 'shortHair',
      shoes: 'shoes',
      skin: 'skin',
      top: 'shirt',
    },
    coins: 100,
  });

  // Step 2: Room templates
  const roomData = [
    {
      display_name: 'Front Yard',
      room_type: 'house',
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

  // Step 3: Starter tasks per room type
  const starterTasks = {
    bedroom: [
      { task_name: 'Vacuum', recurrence: 'daily' },
      { task_name: 'Make Bed', recurrence: 'daily' },
      { task_name: 'Dust Surfaces', recurrence: 'weekly' },
      { task_name: 'Organize Closet', recurrence: 'weekly' },
    ],
    bathroom: [
      { task_name: 'Clean Sink', recurrence: 'daily' },
      { task_name: 'Wipe Mirror', recurrence: 'weekly' },
      { task_name: 'Scrub Toilet', recurrence: 'weekly' },
      { task_name: 'Empty Trash', recurrence: 'daily' },
    ],
  };

  // Step 4: Create rooms and tasks
  const roomsRef = collection(userRef, 'rooms');

  for (const room of roomData) {
    const roomRef = doc(roomsRef); // auto-ID
    await setDoc(roomRef, {
      display_name: room.display_name,
      room_type: room.room_type,
      decor: room.decor,
      ...(room.layout ? { layout: room.layout } : {}),
    });

    const tasks = starterTasks[room.room_type];
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
