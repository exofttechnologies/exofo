import { Employee, Project, Task } from '../types';
import { getApiUrl } from '../config/api';

export interface EmployeeFilterParams {
  search?: string;
  designation?: string;
  status?: string;
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

export interface EmployeeProfileData {
  employee: Employee;
  workSummary: {
    assignedProjects: number;
    activeTasks: number;
    completedTasks: number;
  };
}

export interface EmployeeSelfProfileUpdatePayload {
  name: string;
  phone: string;
  address?: string;
  avatar?: string;
}

export interface EmployeeChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const employeeService = {
  /**
   * Fetch all employees from MongoDB
   */
  async getEmployees(filters?: EmployeeFilterParams): Promise<Employee[]> {
    const query = new URLSearchParams();
    if (filters?.search) query.append('search', filters.search);
    if (filters?.designation && filters.designation !== 'All') query.append('designation', filters.designation);
    if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters?.department && filters.department !== 'All') query.append('department', filters.department);

    const res = await fetch(getApiUrl(`/api/employees?${query.toString()}`));
    if (!res.ok) {
      throw new Error('Failed to fetch employees');
    }
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch a single employee by ID or Employee ID code from MongoDB
   */
  async getEmployeeById(idOrEmpId: string): Promise<Employee | null> {
    const res = await fetch(getApiUrl(`/api/employees/${encodeURIComponent(idOrEmpId)}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch employee');
    const json = await res.json();
    return json.data || null;
  },

  /**
   * Create a new employee in MongoDB
   */
  async createEmployee(
    data: Omit<Employee, 'id' | 'initials'> & { temporaryPassword?: string }
  ): Promise<Employee> {
    const payload = {
      ...data,
      password: data.temporaryPassword || '123456',
    };
    const res = await fetch(getApiUrl('/api/employees'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create employee');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Update existing employee in MongoDB
   */
  async updateEmployee(idOrEmpId: string, updates: Partial<Employee>): Promise<Employee> {
    const res = await fetch(getApiUrl(`/api/employees/${encodeURIComponent(idOrEmpId)}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update employee');
    }

    const json = await res.json();
    return json.data;
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
   * Get all assignments (projects & tasks) for an employee from MongoDB
   */
  async getEmployeeAssignments(idOrEmpId: string): Promise<EmployeeAssignmentsData> {
    const employee = await this.getEmployeeById(idOrEmpId);
    if (!employee) throw new Error('Employee not found');

    // Projects assigned to this employee
    const projRes = await fetch(getApiUrl(`/api/employees/${encodeURIComponent(idOrEmpId)}/projects`));
    const projJson = await projRes.json().catch(() => ({ data: { projects: [] } }));
    const assignedProjects = projJson?.data?.projects || [];

    // Tasks assigned to this employee
    const taskRes = await fetch(getApiUrl(`/api/tasks?assignedEmployeeId=${encodeURIComponent(employee.employeeId || employee.id)}`));
    const taskJson = await taskRes.json().catch(() => ({ data: [] }));
    const assignedTasks = taskJson.data || [];

    return {
      employee,
      assignedProjects,
      assignedTasks,
    };
  },

  /**
   * Fetch complete personalized dashboard data for an employee from MongoDB
   */
  async getEmployeeDashboard(idOrEmpIdOrEmail?: string): Promise<EmployeeDashboardData> {
    let target = idOrEmpIdOrEmail;
    if (!target) {
      target = localStorage.getItem('exofo_employee_code') || localStorage.getItem('exofo_employee_id') || localStorage.getItem('exofo_user_email') || 'EMP001';
    }

    const res = await fetch(getApiUrl(`/api/employees/${encodeURIComponent(target)}/dashboard`));
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to load employee dashboard');
    }

    const json = await res.json();
    return {
      ...json.data,
      unreadNotifications: json.data.employee?.unreadNotifications ?? 2,
    };
  },

  /**
   * Resolve authenticated employee profile
   */
  async resolveEmployeeProfile(idOrEmpIdOrEmail: string): Promise<Employee> {
    const emp = await this.getEmployeeById(idOrEmpIdOrEmail);
    if (!emp) {
      throw new Error('Employee profile not found');
    }
    return emp;
  },

  /**
   * Fetch authenticated employee's full profile and live work summary counts from MongoDB
   */
  async getEmployeeProfile(idOrEmpIdOrEmail: string): Promise<EmployeeProfileData> {
    const res = await fetch(getApiUrl(`/api/employees/${encodeURIComponent(idOrEmpIdOrEmail)}/profile`));
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch employee profile');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Update permitted self-service profile fields in MongoDB
   */
  async updateEmployeeSelfProfile(
    idOrEmpIdOrEmail: string,
    payload: EmployeeSelfProfileUpdatePayload
  ): Promise<Employee> {
    const res = await fetch(getApiUrl(`/api/employees/${encodeURIComponent(idOrEmpIdOrEmail)}/profile`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Unable to update profile');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Change employee password in MongoDB
   */
  async changeEmployeePassword(
    idOrEmpIdOrEmail: string,
    payload: EmployeeChangePasswordPayload
  ): Promise<{ success: boolean; message: string }> {
    const { currentPassword, newPassword, confirmNewPassword } = payload;
    if (newPassword !== confirmNewPassword) {
      throw new Error('New password and confirmation do not match.');
    }

    const res = await fetch(getApiUrl(`/api/employees/${encodeURIComponent(idOrEmpIdOrEmail)}/change-password`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Password update failed.');
    }

    return { success: true, message: json.message || 'Password updated successfully.' };
  },

  /**
   * Verify password directly
   */
  async verifyEmployeeLoginPassword(idOrEmpId: string, plainPassword: string): Promise<boolean> {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: idOrEmpId, password: plainPassword, role: 'employee' }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
