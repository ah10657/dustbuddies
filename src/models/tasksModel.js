import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export class Task {
  constructor(id, data, roomId) {
    this.id = id;
    this.name = data.task_name || 'Unnamed Task';
    this.completed = !!data.task_complete;
    this.recurrence = data.recurrence || 'daily';
    this.lastCompletedAt = data.last_completed_at
      ? new Date(data.last_completed_at)
      : null;
    this.roomId = roomId; // Include if needed for context
  }

  shouldReset() {
    if (!this.lastCompletedAt) return true;

    const now = new Date();
    const daysSince = Math.floor(
      (now - this.lastCompletedAt) / (1000 * 60 * 60 * 24)
    );

    switch (this.recurrence) {
      case 'daily':
        return now.toDateString() !== this.lastCompletedAt.toDateString();
      case 'every_2_days':
        return daysSince >= 2;
      case 'weekly':
        return daysSince >= 7;
      default:
        return false;
    }
  }

  async resetIfNeeded(userId) {
    if (this.shouldReset()) {
      this.completed = false;
      // Update the database to reflect the reset
      await this.saveToDatabase(userId);
    }
  }

  // Convert back to Firestore data format
  toFirestoreData() {
    return {
      task_name: this.name,
      task_complete: this.completed,
      recurrence: this.recurrence,
      last_completed_at: this.lastCompletedAt ? this.lastCompletedAt.toISOString() : null,
    };
  }

  // Save current state to Firestore
  async saveToDatabase(userId) {
    try {
      const taskRef = doc(db, 'user', userId, 'rooms', this.roomId, 'room_tasks', this.id);
      await updateDoc(taskRef, this.toFirestoreData());
    } catch (error) {
      console.error('Error saving task to database:', error);
      throw error;
    }
  }
}

// 🔁 Fetch and convert all user tasks into Task instances
export const fetchAllUserTasks = async (userId) => {
  try {
    const roomsRef = collection(db, 'user', userId, 'rooms');
    const roomsSnapshot = await getDocs(roomsRef);

    const allTasks = [];

    for (const roomDoc of roomsSnapshot.docs) {
      const roomId = roomDoc.id;
      const tasksRef = collection(db, 'user', userId, 'rooms', roomId, 'room_tasks');
      const tasksSnapshot = await getDocs(tasksRef);

      for (const taskDoc of tasksSnapshot.docs) {
        const task = new Task(taskDoc.id, taskDoc.data(), roomId);
        await task.resetIfNeeded(userId); // Apply auto-reset and save to database
        allTasks.push(task);
      }
    }

    return allTasks;
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return [];
  }
};

// 🏠 For HomeScreen: Get global completion percentage with auto-reset
export const getGlobalTaskCompletion = async (userId) => {
  try {
    const allTasks = await fetchAllUserTasks(userId);
    
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.completed).length;
    
    return {
      totalTasks,
      completedTasks,
      completionPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasks: allTasks
    };
  } catch (error) {
    console.error('Error getting global task completion:', error);
    return { totalTasks: 0, completedTasks: 0, completionPercent: 0, tasks: [] };
  }
};

// 🚪 For RoomScreen: Get room-specific tasks with auto-reset
export const getRoomTasks = async (userId, roomId) => {
  try {
    const tasksRef = collection(db, 'user', userId, 'rooms', roomId, 'room_tasks');
    const tasksSnapshot = await getDocs(tasksRef);

    const tasks = [];
    for (const taskDoc of tasksSnapshot.docs) {
      const task = new Task(taskDoc.id, taskDoc.data(), roomId);
      await task.resetIfNeeded(userId); // Apply auto-reset and save to database
      tasks.push(task);
    }

    const remainingTasks = tasks.filter(task => !task.completed);
    const totalTasks = tasks.length;
    const completedCount = tasks.filter(task => task.completed).length;
    const progressPercent = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

    return {
      tasks,
      remainingTasks,
      totalTasks,
      completedCount,
      progressPercent
    };
  } catch (error) {
    console.error('Error fetching room tasks:', error);
    return {
      tasks: [],
      remainingTasks: [],
      totalTasks: 0,
      completedCount: 0,
      progressPercent: 0
    };
  }
};

// ⏰ For TimerScreen: Get specific task with auto-reset
export const getTaskByName = async (userId, roomId, taskName) => {
  try {
    const tasksRef = collection(db, 'user', userId, 'rooms', roomId, 'room_tasks');
    const tasksSnapshot = await getDocs(tasksRef);

    const taskDoc = tasksSnapshot.docs.find(doc => doc.data().task_name === taskName);
    
    if (taskDoc) {
      const task = new Task(taskDoc.id, taskDoc.data(), roomId);
      await task.resetIfNeeded(userId); // Apply auto-reset and save to database
      return task;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching task by name:', error);
    return null;
  }
};
