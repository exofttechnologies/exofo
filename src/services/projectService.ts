import { Project, ProjectFeature, ProjectEmployee, ProjectCredential, ProjectInvoice, Employee } from '../types';
import { currentProjects, allCompanyEmployees } from '../data/mockData';
import { employeeService } from './employeeService';

const PROJECTS_STORAGE_KEY = 'exofo_projects';

function loadProjectsStore(): Project[] {
  try {
    const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return [...currentProjects];
}

// In-memory / persistent mock store (mirrors MongoDB backend schema)
let projectsStore: Project[] = loadProjectsStore();

function saveProjectsStore(list: Project[]) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

export interface EmployeeProjectsSummary {
  total: number;
  inProgress: number;
  completed: number;
  notStarted: number;
  onHold: number;
}

export interface EmployeeProjectsResponse {
  employee: Employee;
  summary: EmployeeProjectsSummary;
  projects: Project[];
}

export interface EmployeeProjectFilterParams {
  search?: string;
  status?: string;
}

export const projectService = {
  /**
   * Retrieve only projects assigned to the authenticated employee
   * Enforces employee access control on backend when available, with strict local assignment fallback
   */
  async getEmployeeProjects(
    employeeIdOrEmail: string,
    filters?: EmployeeProjectFilterParams
  ): Promise<EmployeeProjectsResponse> {
    if (!employeeIdOrEmail || !employeeIdOrEmail.trim()) {
      throw new Error('Authenticated employee ID is required.');
    }

    // Resolve employee record (supports id, EMP009, or email)
    let employee = await employeeService.getEmployeeById(employeeIdOrEmail);
    if (!employee) {
      const all = await employeeService.getEmployees();
      employee =
        all.find(
          (e) =>
            e.email.toLowerCase() === employeeIdOrEmail.toLowerCase() ||
            e.name.toLowerCase() === employeeIdOrEmail.toLowerCase()
        ) || null;
    }

    if (!employee) {
      throw new Error('Authenticated employee profile not found.');
    }

    if (employee.accountStatus === 'Inactive') {
      throw new Error('Your employee account is inactive. Please contact your administrator.');
    }

    // Attempt live backend request with employee authorization header
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 750);

      const query = new URLSearchParams();
      if (filters?.status && filters.status !== 'All') {
        query.append('status', filters.status);
      }
      if (filters?.search && filters.search.trim()) {
        query.append('search', filters.search.trim());
      }

      const qs = query.toString();
      const url = `/api/employees/${encodeURIComponent(employee.employeeId || employee.id)}/projects${qs ? `?${qs}` : ''}`;

      const res = await fetch(url, {
        headers: {
          'x-employee-id': employee.employeeId || employee.id,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'You are not authorized to access these projects.');
      }

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          const normalizedProjects: Project[] = (json.data.projects || []).map((p: any) => ({
            ...p,
            id: p.id || p._id || p.projectCode,
          }));
          return {
            employee: { ...employee, ...json.data.employee },
            summary: json.data.summary,
            projects: normalizedProjects,
          };
        }
      }
    } catch (err: any) {
      // Re-throw explicit authorization rejections
      if (err?.message && err.message.toLowerCase().includes('authorized')) {
        throw err;
      }
      // Otherwise offline / local fallback below
    }

    // Local persistence fallback when backend API is unavailable
    await new Promise((resolve) => setTimeout(resolve, 180));
    projectsStore = loadProjectsStore();

    const assignedAll = projectsStore.filter(
      (p) =>
        p.status !== 'Archived' &&
        (p.assignedEmployees.some(
          (e) =>
            e.id === employee!.id ||
            (e.email && employee!.email && e.email.toLowerCase() === employee!.email.toLowerCase()) ||
            e.name.toLowerCase() === employee!.name.toLowerCase()
        ) ||
          (employee!.assignedProjects &&
            employee!.assignedProjects.some(
              (ap) =>
                ap.toLowerCase() === p.name.toLowerCase() ||
                ap === p.id ||
                ap.toLowerCase() === p.projectCode.toLowerCase()
            )))
    );

    const summary: EmployeeProjectsSummary = {
      total: assignedAll.length,
      inProgress: assignedAll.filter((p) => p.status === 'In Progress').length,
      completed: assignedAll.filter((p) => p.status === 'Completed').length,
      notStarted: assignedAll.filter((p) => p.status === 'Not Started').length,
      onHold: assignedAll.filter((p) => p.status === 'On Hold').length,
    };

    let filtered = [...assignedAll];

    if (filters?.status && filters.status !== 'All') {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.projectCode.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.client?.name && p.client.name.toLowerCase().includes(q)) ||
          (p.client?.company && p.client.company.toLowerCase().includes(q))
      );
    }

    return {
      employee,
      summary,
      projects: filtered,
    };
  },

  /**
   * Fetch a single project by its ID / ObjectId
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    // Simulate brief network latency (realistic loading states)
    await new Promise((resolve) => setTimeout(resolve, 150));
    projectsStore = loadProjectsStore();

    // Try matching by id (e.g. proj-1) or projectCode (e.g. PRJ001)
    const project = projectsStore.find(
      (p) => p.id === projectId || p.projectCode.toLowerCase() === projectId.toLowerCase()
    );

    return project ? { ...project } : null;
  },

  /**
   * Update core project details
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    projectsStore = loadProjectsStore();

    const index = projectsStore.findIndex(
      (p) => p.id === projectId || p.projectCode.toLowerCase() === projectId.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Project ${projectId} not found`);
    }

    const updated = {
      ...projectsStore[index],
      ...updates,
    };

    projectsStore[index] = updated;
    saveProjectsStore(projectsStore);
    return { ...updated };
  },

  /**
   * Employee-scoped project details update (verifies assignment before updating)
   */
  async updateEmployeeProjectDetails(
    employeeIdentifier: string,
    projectId: string,
    updates: Pick<
      Partial<Project>,
      'name' | 'description' | 'category' | 'status' | 'priority' | 'progress' | 'startDate' | 'expectedCompletionDate' | 'client'
    >
  ): Promise<Project> {
    const scope = await this.getEmployeeProjects(employeeIdentifier);
    const assigned = scope.projects.find(
      (p) => p.id === projectId || p.projectCode.toLowerCase() === projectId.toLowerCase()
    );

    if (!assigned) {
      throw new Error('Project not found or not assigned to your employee account.');
    }

    const requesterHeader = scope.employee.employeeId || scope.employee.id;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch(
        `/api/employees/${encodeURIComponent(requesterHeader)}/projects/${encodeURIComponent(assigned.projectCode || assigned.id)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-employee-id': requesterHeader,
          },
          body: JSON.stringify(updates),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403 || res.status === 404) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Not authorized to update this project.');
      }

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          const updatedServer: Project = {
            ...assigned,
            ...json.data,
            id: json.data.id || json.data._id || assigned.id,
          };
          await this.updateProject(assigned.id, updatedServer);
          return updatedServer;
        }
      }
    } catch (err: any) {
      if (err?.message && !err.message.toLowerCase().includes('fetch') && err.name !== 'AbortError') {
        throw err;
      }
    }

    return this.updateProject(assigned.id, updates);
  },

  /**
   * Features Management
   */
  async addFeature(projectId: string, feature: Omit<ProjectFeature, 'id'>): Promise<ProjectFeature> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newFeature: ProjectFeature = {
      ...feature,
      id: `feat-${Date.now()}`,
      lastUpdated: 'Just now',
    };

    const updatedFeatures = [newFeature, ...project.features];
    await this.updateProject(projectId, { features: updatedFeatures });
    return newFeature;
  },

  async deleteFeature(projectId: string, featureId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updatedFeatures = project.features.filter((f) => f.id !== featureId);
    await this.updateProject(projectId, { features: updatedFeatures });
  },

  /**
   * Employees Assignment
   */
  async assignEmployees(projectId: string, employeeIds: string[]): Promise<ProjectEmployee[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newlyAssigned = allCompanyEmployees.filter((emp) => employeeIds.includes(emp.id));
    
    // Combine existing and newly assigned without duplicates
    const existingIds = new Set(project.assignedEmployees.map((e) => e.id));
    const merged = [
      ...project.assignedEmployees,
      ...newlyAssigned.filter((e) => !existingIds.has(e.id)),
    ];

    await this.updateProject(projectId, { assignedEmployees: merged });
    return merged;
  },

  async removeEmployee(projectId: string, employeeId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updated = project.assignedEmployees.filter((e) => e.id !== employeeId);
    await this.updateProject(projectId, { assignedEmployees: updated });
  },

  /**
   * Credentials (Password Vault)
   */
  async addCredential(projectId: string, cred: Omit<ProjectCredential, 'id'>): Promise<ProjectCredential> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newCred: ProjectCredential = {
      ...cred,
      id: `cred-${Date.now()}`,
      lastUpdated: 'Today',
    };

    const updated = [newCred, ...project.credentials];
    await this.updateProject(projectId, { credentials: updated });
    return newCred;
  },

  async deleteCredential(projectId: string, credId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updated = project.credentials.filter((c) => c.id !== credId);
    await this.updateProject(projectId, { credentials: updated });
  },

  /**
   * Invoices Management
   */
  async addInvoice(projectId: string, inv: Omit<ProjectInvoice, 'id'>): Promise<ProjectInvoice> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newInvoice: ProjectInvoice = {
      ...inv,
      id: `inv-${Date.now()}`,
    };

    const updated = [newInvoice, ...project.invoices];
    await this.updateProject(projectId, { invoices: updated });
    return newInvoice;
  },
};

