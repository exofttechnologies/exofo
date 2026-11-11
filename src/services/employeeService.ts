import { Employee, Project, Task } from '../types';
import { initialEmployees, currentProjects } from '../data/mockData';
import { taskService } from './taskService';

const STORAGE_KEY = 'exofo_employees_data';

function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    // Ignore error
  }
  return [...initialEmployees];
}

function saveEmployees(list: Employee[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // Ignore error
  }
}

let inMemoryEmployees: Employee[] = loadEmployees();

export interface EmployeeFilterParams {
  search?: string;
  designation?: string;
  status?: string; // 'All' | 'Active' | 'Inactive'
  department?: string;
}

export interface EmployeeAssignmentsData {
  employee: Employee;
  assignedProjects: Project[];
  assignedTasks: Task[];
}

export interface EmployeeDashboardData {
  employee: Employee;
  counts: {
    myTasks: number;
    myProjects: number;
    inProgress: number;
    completed: number;
    pending: number;
  };
  assignedProjects: Project[];
  todayTasks: Task[];
  assignedTasks: Task[];
  unreadNotifications: number;
}

export const employeeService = {
  /**
   * Fetch all employees with optional filters
   */
  async getEmployees(filters?: EmployeeFilterParams): Promise<Employee[]> {
    // Attempt live API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const query = new URLSearchParams();
      if (filters?.search) query.append('search', filters.search);
      if (filters?.designation && filters.designation !== 'All') query.append('designation', filters.designation);
      if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
      if (filters?.department && filters.department !== 'All') query.append('department', filters.department);

      const res = await fetch(`/api/employees?${query.toString()}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 80));

    let result = [...inMemoryEmployees];

    // Search filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    // Designation filter
    if (filters?.designation && filters.designation !== 'All') {
      result = result.filter(
        (e) => e.designation.toLowerCase() === filters.designation!.toLowerCase()
      );
    }

    // Status filter
    if (filters?.status && filters.status !== 'All') {
      result = result.filter(
        (e) => e.accountStatus.toLowerCase() === filters.status!.toLowerCase()
      );
    }

    // Department filter
    if (filters?.department && filters.department !== 'All') {
      result = result.filter(
        (e) => e.department.toLowerCase() === filters.department!.toLowerCase()
      );
    }

    return result;
  },

  /**
   * Fetch a single employee by ID or Employee ID code
   */
  async getEmployeeById(idOrEmpId: string): Promise<Employee | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`/api/employees/${idOrEmpId}`, { signal: controller.signal });
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

    await new Promise((r) => setTimeout(r, 60));

    const emp = inMemoryEmployees.find(
      (e) =>
        e.id === idOrEmpId ||
        e.employeeId.toLowerCase() === idOrEmpId.toLowerCase()
    );

    return emp ? { ...emp } : null;
  },

  /**
   * Create a new employee
   */
  async createEmployee(
    data: Omit<Employee, 'id' | 'initials'> & { temporaryPassword?: string }
  ): Promise<Employee> {
    // Check for duplicate email
    const duplicateEmail = inMemoryEmployees.find(
      (e) => e.email.toLowerCase().trim() === data.email.toLowerCase().trim()
    );
    if (duplicateEmail) {
      throw new Error(`An employee with email "${data.email}" already exists.`);
    }

    // Check for duplicate employee ID if provided
    if (data.employeeId) {
      const duplicateId = inMemoryEmployees.find(
        (e) => e.employeeId.toLowerCase().trim() === data.employeeId.toLowerCase().trim()
      );
      if (duplicateId) {
        throw new Error(`Employee ID "${data.employeeId}" is already taken.`);
      }
    }

    // Auto-generate employee ID if not specified
    let empId = data.employeeId;
    if (!empId) {
      const maxNum = inMemoryEmployees.reduce((max, e) => {
        const m = e.employeeId.match(/EMP(\d+)/i);
        if (m) {
          const num = parseInt(m[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      empId = `EMP${(maxNum + 1).toString().padStart(3, '0')}`;
    }

    // Compute initials
    const parts = data.name.trim().split(/\s+/);
    const initials = (
      parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : data.name.substring(0, 2)
    ).toUpperCase();

    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      employeeId: empId,
      initials,
      accountStatus: data.accountStatus || 'Active',
      currentTaskCount: 0,
      assignedProjects: data.assignedProjects || [],
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          inMemoryEmployees = [json.data, ...inMemoryEmployees];
          saveEmployees(inMemoryEmployees);
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 120));

    inMemoryEmployees = [newEmp, ...inMemoryEmployees];
    saveEmployees(inMemoryEmployees);
    return { ...newEmp };
  },

  /**
   * Update existing employee
   */
  async updateEmployee(idOrEmpId: string, updates: Partial<Employee>): Promise<Employee> {
    const index = inMemoryEmployees.findIndex(
      (e) => e.id === idOrEmpId || e.employeeId.toLowerCase() === idOrEmpId.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Employee ${idOrEmpId} not found.`);
    }

    const current = inMemoryEmployees[index];

    // Check duplicate email
    if (updates.email && updates.email.toLowerCase().trim() !== current.email.toLowerCase().trim()) {
      const duplicate = inMemoryEmployees.find(
        (e) => e.id !== current.id && e.email.toLowerCase().trim() === updates.email!.toLowerCase().trim()
      );
      if (duplicate) {
        throw new Error(`Email "${updates.email}" is already used by another employee.`);
      }
    }

    // Check duplicate employee ID
    if (updates.employeeId && updates.employeeId.toLowerCase().trim() !== current.employeeId.toLowerCase().trim()) {
      const duplicate = inMemoryEmployees.find(
        (e) => e.id !== current.id && e.employeeId.toLowerCase().trim() === updates.employeeId!.toLowerCase().trim()
      );
      if (duplicate) {
        throw new Error(`Employee ID "${updates.employeeId}" is already taken.`);
      }
    }

    let initials = current.initials;
    if (updates.name && updates.name !== current.name) {
      const parts = updates.name.trim().split(/\s+/);
      initials = (
        parts.length >= 2
          ? parts[0][0] + parts[parts.length - 1][0]
          : updates.name.substring(0, 2)
      ).toUpperCase();
    }

    const updated: Employee = {
      ...current,
      ...updates,
      initials,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`/api/employees/${idOrEmpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          inMemoryEmployees[index] = json.data;
          saveEmployees(inMemoryEmployees);
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 100));

    inMemoryEmployees[index] = updated;
    saveEmployees(inMemoryEmployees);
    return { ...updated };
  },

  /**
   * Activate / Deactivate employee account
   */
  async toggleAccountStatus(idOrEmpId: string): Promise<Employee> {
    const emp = await this.getEmployeeById(idOrEmpId);
    if (!emp) throw new Error('Employee not found');

    const newStatus = emp.accountStatus === 'Active' ? 'Inactive' : 'Active';
    return this.updateEmployee(idOrEmpId, { accountStatus: newStatus });
  },

  /**
   * Get all assignments (projects & tasks) for an employee
   */
  async getEmployeeAssignments(idOrEmpId: string): Promise<EmployeeAssignmentsData> {
    const employee = await this.getEmployeeById(idOrEmpId);
    if (!employee) throw new Error('Employee not found');

    // 1. Projects where employee is assigned
    const assignedProjects = currentProjects.filter(
      (p) =>
        p.assignedEmployees.some(
          (e) =>
            e.id === employee.id ||
            e.name.toLowerCase() === employee.name.toLowerCase()
        ) ||
        (employee.assignedProjects &&
          employee.assignedProjects.some(
            (ap) => ap.toLowerCase() === p.name.toLowerCase() || ap === p.id || ap === p.projectCode
          ))
    );

    // 2. Tasks assigned to this employee
    const allTasks = await taskService.getTasks();
    const assignedTasks = allTasks.filter(
      (t) =>
        t.assignedEmployeeId === employee.id ||
        t.assignedEmployeeName?.toLowerCase() === employee.name.toLowerCase()
    );

    return {
      employee,
      assignedProjects,
      assignedTasks,
    };
  },

  /**
   * Fetch complete personalized dashboard data for an employee
   * Connects to backend API /api/employees/:id/dashboard with seamless fallback
   */
  async getEmployeeDashboard(idOrEmpIdOrEmail?: string): Promise<EmployeeDashboardData> {
    // 1. Resolve employee
    let employee: Employee | null = null;
    if (idOrEmpIdOrEmail) {
      employee = await this.getEmployeeById(idOrEmpIdOrEmail);
      if (!employee) {
        // try finding by email
        const all = await this.getEmployees();
        employee = all.find((e) => e.email.toLowerCase() === idOrEmpIdOrEmail.toLowerCase()) || null;
      }
    }

    if (!employee) {
      // Default to first active employee (e.g. Sarah Chen or Ahmed)
      const all = await this.getEmployees();
      employee = all.find((e) => e.name.toLowerCase() === 'ahmed') || all[0];
    }

    if (!employee) {
      throw new Error('Employee profile could not be resolved');
    }

    // 2. Attempt Live MongoDB API call
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 700);
      const res = await fetch(`/api/employees/${employee.employeeId || employee.id}/dashboard`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Merge with assigned projects
          const assignments = await this.getEmployeeAssignments(employee.id);
          return {
            employee: { ...employee, ...json.data.employee },
            counts: {
              ...json.data.counts,
              myProjects: assignments.assignedProjects.length,
            },
            assignedProjects: assignments.assignedProjects,
            todayTasks: json.data.todayTasks || assignments.assignedTasks.slice(0, 5),
            assignedTasks: json.data.assignedTasks || assignments.assignedTasks,
            unreadNotifications: json.data.employee.unreadNotifications ?? 2,
          };
        }
      }
    } catch (e) {
      // Backend unavailable / offline, fallback to localized database records
    }

    // 3. Dynamic Local Database Calculation
    let projectsList = currentProjects;
    try {
      const savedProjects = localStorage.getItem('exofo_projects');
      if (savedProjects) projectsList = JSON.parse(savedProjects);
    } catch (e) {
      // ignore
    }

    // Get projects assigned to this employee
    const assignedProjects = projectsList.filter(
      (p) =>
        p.assignedEmployees.some(
          (e) =>
            e.id === employee!.id ||
            e.name.toLowerCase() === employee!.name.toLowerCase()
        ) ||
        (employee!.assignedProjects &&
          employee!.assignedProjects.some(
            (ap) => ap.toLowerCase() === p.name.toLowerCase() || ap === p.id || ap === p.projectCode
          ))
    );

    // If Ahmed or Sarah and projects list is empty, supply matching sample projects
    let finalProjects = assignedProjects;
    if (finalProjects.length === 0) {
      finalProjects = projectsList.filter((p) => p.name === 'Dhabhi Cart' || p.name === 'TrackED');
    }

    // Get tasks assigned to this employee
    const allTasks = await taskService.getTasks();
    const assignedTasks = allTasks.filter(
      (t) =>
        t.assignedEmployeeId === employee!.id ||
        t.assignedEmployeeName?.toLowerCase() === employee!.name.toLowerCase()
    );

    // If employee has no tasks assigned in mock, map tasks for demo/testing
    let finalTasks = assignedTasks;
    if (finalTasks.length === 0) {
      finalTasks = allTasks.slice(0, 4);
    }

    const myTasksCount = finalTasks.length;
    const inProgressCount = finalTasks.filter((t) => t.status === 'In Progress').length;
    const completedCount = finalTasks.filter((t) => t.status === 'Completed').length;
    const pendingCount = finalTasks.filter((t) => t.status === 'Pending').length;

    // Filter today's tasks (up to 4-5 tasks)
    const todayTasks = finalTasks.slice(0, 4);

    return {
      employee,
      counts: {
        myTasks: myTasksCount,
        myProjects: finalProjects.length,
        inProgress: inProgressCount,
        completed: completedCount,
        pending: pendingCount,
      },
      assignedProjects: finalProjects,
      todayTasks,
      assignedTasks: finalTasks,
      unreadNotifications: 2,
    };
  },
};

