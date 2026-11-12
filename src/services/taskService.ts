import { Employee, Project, Task, TaskActivity, TaskAttachment, TaskPriority, TaskStatus } from '../types';
import { employeeService } from './employeeService';
import { projectService } from './projectService';

export interface EmployeeTaskFilterParams {
  status?: string;
  priority?: string;
  project?: string;
  dueDate?: string;
  search?: string;
}

export interface EmployeeTasksSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface EmployeeTasksResponse {
  employee: Employee;
  summary: EmployeeTasksSummary;
  tasks: Task[];
}

export interface EmployeeTaskDetailResponse {
  employee: Employee;
  task: Task;
  relatedProject: Project | null;
}

export interface EmployeeTaskProgressPayload {
  status: TaskStatus;
  progress: number;
  comment?: string;
  attachment?: TaskAttachment;
}

export const taskService = {
  /**
   * Fetch all tasks from MongoDB
   */
  async getTasks(filters?: {
    assignedEmployeeId?: string;
    employee?: string;
    status?: string;
    priority?: string;
    search?: string;
    project?: string;
    projectId?: string;
    dueDate?: string;
  }): Promise<Task[]> {
    const query = new URLSearchParams();
    const emp = filters?.assignedEmployeeId || (filters?.employee !== 'All' ? filters?.employee : undefined);
    if (emp) query.append('assignedEmployeeId', emp);
    if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters?.priority && filters.priority !== 'All') query.append('priority', filters.priority);
    if (filters?.search && filters.search.trim()) query.append('search', filters.search.trim());
    const proj = filters?.projectId || (filters?.project !== 'All' ? filters?.project : undefined);
    if (proj) query.append('projectId', proj);

    const qs = query.toString();
    const res = await fetch(`/api/tasks${qs ? `?${qs}` : ''}`);
    if (!res.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch single task by ID from MongoDB
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch task');
    const json = await res.json();
    return json.data || null;
  },

  /**
   * Helper alias for employee task details (supports 1 or 2 arguments)
   */
  async getEmployeeTaskById(
    arg1: string,
    arg2?: string
  ): Promise<EmployeeTaskDetailResponse> {
    const taskId = arg2 || arg1;
    const employeeIdOrEmail = arg2 ? arg1 : (localStorage.getItem('exofo_employee_id') || 'EMP001');
    return this.getEmployeeTaskDetail(taskId, employeeIdOrEmail);
  },

  /**
   * Create task in MongoDB
   */
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create task');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Update task in MongoDB
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update task');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Update task status shortcut
   */
  async updateStatus(taskId: string, status: TaskStatus): Promise<Task> {
    return this.updateTask(taskId, { status });
  },

  /**
   * Delete task in MongoDB
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  /**
   * Determine if a task is overdue
   */
  isOverdue(dueDate?: string, status?: string): boolean {
    if (!dueDate || status === 'Completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  },

  /**
   * Get employee tasks response from MongoDB
   */
  async getEmployeeTasks(
    employeeIdOrEmail: string,
    filters?: EmployeeTaskFilterParams
  ): Promise<EmployeeTasksResponse> {
    const employee = await employeeService.resolveEmployeeProfile(employeeIdOrEmail);
    const empId = employee.employeeId || employee.id;

    const allTasks = await this.getTasks({
      assignedEmployeeId: empId,
      status: filters?.status,
      priority: filters?.priority,
      search: filters?.search,
      projectId: filters?.project !== 'All' ? filters?.project : undefined,
    });

    const summary: EmployeeTasksSummary = {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === 'Pending').length,
      inProgress: allTasks.filter((t) => t.status === 'In Progress').length,
      completed: allTasks.filter((t) => t.status === 'Completed').length,
    };

    return {
      employee,
      summary,
      tasks: allTasks,
    };
  },

  /**
   * Get employee task detail
   */
  async getEmployeeTaskDetail(
    taskId: string,
    employeeIdOrEmail: string
  ): Promise<EmployeeTaskDetailResponse> {
    const employee = await employeeService.resolveEmployeeProfile(employeeIdOrEmail);
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    let relatedProject: Project | null = null;
    if (task.projectId || task.projectCode) {
      relatedProject = await projectService.getProjectById(task.projectId || task.projectCode || '');
    }

    return {
      employee,
      task,
      relatedProject,
    };
  },

  /**
   * Update employee task progress
   */
  async updateEmployeeTaskProgress(
    taskId: string,
    employeeIdOrEmail: string,
    payload: EmployeeTaskProgressPayload
  ): Promise<Task> {
    const employee = await employeeService.resolveEmployeeProfile(employeeIdOrEmail);
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const activity: TaskActivity = {
      id: `act-${Date.now()}`,
      taskId: task.id || task.taskId,
      description: payload.comment || `Progress updated to ${payload.progress}% (${payload.status})`,
      type: payload.progress === 100 ? 'completed' : 'progress_updated',
      updatedBy: employee.name,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...(task.activityHistory || []), activity];
    const updatedAttachments = payload.attachment
      ? [...(task.attachments || []), payload.attachment]
      : task.attachments;

    return this.updateTask(taskId, {
      status: payload.status,
      progress: payload.progress,
      progressNotes: payload.comment || task.progressNotes,
      activityHistory: updatedHistory,
      attachments: updatedAttachments,
    });
  },
};
