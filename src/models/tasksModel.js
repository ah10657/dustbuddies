// tasksModel.js

export class Task {
  constructor(id, data) {
    this.id = id;
    this.name = data.task_name || 'Unnamed Task';
    this.time = data.task_time ?? 0;
    this.timerEnabled = !!data.task_timer_enabled;
    this.completed = !!data.task_complete;
    this.recurrence = data.recurrence || 'daily';
    this.lastCompletedAt = data.last_completed_at
      ? new Date(data.last_completed_at)
      : null;
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

  resetIfNeeded() {
    if (this.shouldReset()) {
      this.completed = false;
    }
  }
}
