import { Task, TaskActivity, TaskPriority, TaskStatus } from '../types';
import { initialTasks } from '../data/mockData';

const STORAGE_KEY = 'exofo_tasks_data';

// Helper to load tasks from localStorage or initialize with initialTasks
function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    // localStorage not accessible or parse error
  }
  return [...initialTasks];
}

// Helper to persist tasks
function saveTasksToStorage(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    // Ignore storage quota errors
  }
}

let inMemoryTasks: Task[] = loadTasksFromStorage();

export interface TaskFilterParams {
  status?: string;
  priority?: string;
  employee?: string;
  project?: string;
  dueDate?: string; // 'all' | 'overdue' | 'this-week'
  search?: string;
}

export const taskService = {
  /**
   * Check if a task is overdue (due date < today and not completed)
   */
  isOverdue(dueDate?: string, status?: TaskStatus): boolean {
    if (!dueDate || status === 'Completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  },

  /**
   * Fetch all tasks with optional filters
   */
  async getTasks(filters?: TaskFilterParams): Promise<Task[]> {
    // Attempt live API if server is up
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const queryParams = new URLSearchParams();

      if (filters?.status && filters.status !== 'All') queryParams.append('status', filters.status);
      if (filters?.priority && filters.priority !== 'All') queryParams.append('priority', filters.priority);
      if (filters?.employee && filters.employee !== 'All') queryParams.append('employee', filters.employee);
      if (filters?.project && filters.project !== 'All') queryParams.append('project', filters.project);
      if (filters?.search) queryParams.append('search', filters.search);

      const res = await fetch(`/api/tasks?${queryParams.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fall through to memory / localStorage fallback
    }

    // Brief simulation latency
    await new Promise((r) => setTimeout(r, 60));

    let result = [...inMemoryTasks];

    // Filter by status
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((t) => t.status.toLowerCase() === filters.status!.toLowerCase());
    }

    // Filter by priority
    if (filters?.priority && filters.priority !== 'All') {
      result = result.filter((t) => t.priority.toLowerCase() === filters.priority!.toLowerCase());
    }

    // Filter by employee
    if (filters?.employee && filters.employee !== 'All') {
      result = result.filter(
        (t) =>
          t.assignedEmployeeId === filters.employee ||
          t.assignedEmployeeName?.toLowerCase().includes(filters.employee!.toLowerCase())
      );
    }

    // Filter by project
    if (filters?.project && filters.project !== 'All') {
      if (filters.project === 'independent') {
        result = result.filter((t) => t.isIndependent || !t.projectId);
      } else {
        result = result.filter(
          (t) =>
            t.projectId === filters.project ||
            t.projectCode?.toLowerCase() === filters.project!.toLowerCase() ||
            t.projectName?.toLowerCase().includes(filters.project!.toLowerCase())
        );
      }
    }

    // Filter by Due Date
    if (filters?.dueDate && filters.dueDate !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.dueDate === 'overdue') {
        result = result.filter((t) => this.isOverdue(t.dueDate, t.status));
      } else if (filters.dueDate === 'this-week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        result = result.filter((t) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          return due >= today && due <= nextWeek;
        });
      }
    }

    // Filter by search
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.taskName.toLowerCase().includes(q) ||
          t.taskId.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignedEmployeeName?.toLowerCase().includes(q) ||
          t.projectName?.toLowerCase().includes(q)
      );
    }

    return result;
  },

  /**
   * Fetch a single task by its taskId or id
   */
  async getTaskById(idOrTaskId: string): Promise<Task | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`/api/tasks/${idOrTaskId}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Fall through to memory store
    }

    await new Promise((r) => setTimeout(r, 60));

    const task = inMemoryTasks.find(
      (t) =>
        t.id === idOrTaskId ||
        t.taskId.toLowerCase() === idOrTaskId.toLowerCase()
    );

    return task ? { ...task } : null;
  },

  /**
   * Create a new task
   */
  async createTask(
    data: Omit<Task, 'id' | 'taskId' | 'createdAt' | 'updatedAt' | 'activityHistory'> & { taskId?: string }
  ): Promise<Task> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          inMemoryTasks = [json.data, ...inMemoryTasks];
          saveTasksToStorage(inMemoryTasks);
          return json.data;
        }
      }
    } catch {
      // Fallback to local store
    }

    await new Promise((r) => setTimeout(r, 120));

    // Generate unique sequential Task ID
    const maxNum = inMemoryTasks.reduce((max, t) => {
      const match = t.taskId.match(/TSK(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 3);

    const nextId = (maxNum + 1).toString().padStart(3, '0');
    const newTaskId = data.taskId || `TSK${nextId}`;

    const now = new Date().toISOString();
    const nowHuman = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isIndependent = !data.projectId || data.projectId === 'independent';

    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      taskId: newTaskId,
      isIndependent,
      projectId: isIndependent ? undefined : data.projectId,
      projectName: isIndependent ? undefined : data.projectName,
      projectCode: isIndependent ? undefined : data.projectCode,
      progress: data.status === 'Completed' ? 100 : data.status === 'In Progress' ? (data.progress || 25) : 0,
      createdAt: now,
      updatedAt: now,
      activityHistory: [
        {
          id: `act-${Date.now()}-1`,
          taskId: newTaskId,
          description: `Task created: ${data.taskName}`,
          type: 'created',
          updatedBy: data.createdBy || 'Admin (Miqdhadh)',
          timestamp: nowHuman,
        },
        ...(data.assignedEmployeeName
          ? [
              {
                id: `act-${Date.now()}-2`,
                taskId: newTaskId,
                description: `Assigned to ${data.assignedEmployeeName}`,
                type: 'assigned' as const,
                updatedBy: data.createdBy || 'Admin (Miqdhadh)',
                timestamp: nowHuman,
              },
            ]
          : []),
      ],
    };

    inMemoryTasks = [newTask, ...inMemoryTasks];
    saveTasksToStorage(inMemoryTasks);
    return { ...newTask };
  },

  /**
   * Update an existing task
   */
  async updateTask(idOrTaskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`/api/tasks/${idOrTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          const idx = inMemoryTasks.findIndex(
            (t) => t.id === idOrTaskId || t.taskId.toLowerCase() === idOrTaskId.toLowerCase()
          );
          if (idx !== -1) {
            inMemoryTasks[idx] = json.data;
            saveTasksToStorage(inMemoryTasks);
          }
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 120));

    const index = inMemoryTasks.findIndex(
      (t) => t.id === idOrTaskId || t.taskId.toLowerCase() === idOrTaskId.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Task ${idOrTaskId} not found`);
    }

    const current = inMemoryTasks[index];
    const nowHuman = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newActivities: TaskActivity[] = [...(current.activityHistory || [])];

    // Status change activity
    if (updates.status && updates.status !== current.status) {
      newActivities.push({
        id: `act-${Date.now()}-status`,
        taskId: current.taskId,
        description: `Status updated from ${current.status} to ${updates.status}`,
        type: updates.status === 'Completed' ? 'completed' : 'status_changed',
        updatedBy: 'Admin (Miqdhadh)',
        timestamp: nowHuman,
      });
    }

    // Reassignment activity
    if (updates.assignedEmployeeName && updates.assignedEmployeeName !== current.assignedEmployeeName) {
      newActivities.push({
        id: `act-${Date.now()}-reassign`,
        taskId: current.taskId,
        description: `Reassigned to ${updates.assignedEmployeeName}`,
        type: 'reassigned',
        updatedBy: 'Admin (Miqdhadh)',
        timestamp: nowHuman,
      });
    } else if (updates.assignedEmployeeId === undefined && updates.assignedEmployeeName === '' && current.assignedEmployeeName) {
      newActivities.push({
        id: `act-${Date.now()}-unassign`,
        taskId: current.taskId,
        description: `Removed employee assignment (previously ${current.assignedEmployeeName})`,
        type: 'reassigned',
        updatedBy: 'Admin (Miqdhadh)',
        timestamp: nowHuman,
      });
    }

    // Progress update activity
    if (updates.progress !== undefined && updates.progress !== current.progress) {
      newActivities.push({
        id: `act-${Date.now()}-prog`,
        taskId: current.taskId,
        description: `Progress updated from ${current.progress}% to ${updates.progress}%`,
        type: 'progress_updated',
        updatedBy: 'Admin (Miqdhadh)',
        timestamp: nowHuman,
      });
    }

    const isIndependent = updates.projectId === 'independent' || (!updates.projectId && !current.projectId);

    const updatedTask: Task = {
      ...current,
      ...updates,
      isIndependent: updates.isIndependent !== undefined ? updates.isIndependent : isIndependent,
      projectId: isIndependent ? undefined : (updates.projectId || current.projectId),
      projectName: isIndependent ? undefined : (updates.projectName || current.projectName),
      projectCode: isIndependent ? undefined : (updates.projectCode || current.projectCode),
      updatedAt: new Date().toISOString(),
      activityHistory: newActivities,
    };

    inMemoryTasks[index] = updatedTask;
    saveTasksToStorage(inMemoryTasks);

    return { ...updatedTask };
  },

  /**
   * Quick status patch
   */
  async updateStatus(idOrTaskId: string, status: TaskStatus): Promise<Task> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`/api/tasks/${idOrTaskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    const updates: Partial<Task> = {
      status,
      progress: status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0,
    };

    return this.updateTask(idOrTaskId, updates);
  },

  /**
   * Delete a task
   */
  async deleteTask(idOrTaskId: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`/api/tasks/${idOrTaskId}`, {
        method: 'DELETE',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        inMemoryTasks = inMemoryTasks.filter(
          (t) => t.id !== idOrTaskId && t.taskId.toLowerCase() !== idOrTaskId.toLowerCase()
        );
        saveTasksToStorage(inMemoryTasks);
        return true;
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 100));

    inMemoryTasks = inMemoryTasks.filter(
      (t) => t.id !== idOrTaskId && t.taskId.toLowerCase() !== idOrTaskId.toLowerCase()
    );
    saveTasksToStorage(inMemoryTasks);
    return true;
  },

  /**
   * Fetch activity timeline
   */
  async getTaskActivity(idOrTaskId: string): Promise<TaskActivity[]> {
    const task = await this.getTaskById(idOrTaskId);
    return task?.activityHistory || [];
  },
};

