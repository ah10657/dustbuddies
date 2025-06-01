// src/models/roomsModel.js

import { Task } from './tasksModel';

export class Room {
  constructor(id, data) {
    this.id = id;
    this.name = data.name || 'Unnamed Room';

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
