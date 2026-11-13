import { Project, ProjectFeature, ProjectEmployee, ProjectCredential, ProjectInvoice, Employee } from '../types';
import { employeeService } from './employeeService';
import { getApiUrl } from '../config/api';

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
   * Retrieve only projects assigned to the authenticated employee from MongoDB
   */
  async getEmployeeProjects(
    employeeIdOrEmail: string,
    filters?: EmployeeProjectFilterParams
  ): Promise<EmployeeProjectsResponse> {
    const employee = await employeeService.resolveEmployeeProfile(employeeIdOrEmail);

    const query = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') {
      query.append('status', filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      query.append('search', filters.search.trim());
    }

    const qs = query.toString();
    const url = getApiUrl(`/api/employees/${encodeURIComponent(employee.employeeId || employee.id)}/projects${qs ? `?${qs}` : ''}`);
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error('Failed to fetch employee projects');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch all projects from MongoDB
   */
  async getAllProjects(filters?: { status?: string; search?: string; priority?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters?.search && filters.search.trim()) query.append('search', filters.search.trim());
    if (filters?.priority && filters.priority !== 'All') query.append('priority', filters.priority);

    const qs = query.toString();
    const res = await fetch(getApiUrl(`/api/projects${qs ? `?${qs}` : ''}`));
    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch a single project by ID or Code from MongoDB
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    const res = await fetch(getApiUrl(`/api/projects/${encodeURIComponent(projectId)}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch project');
    const json = await res.json();
    return json.data || null;
  },

  /**
   * Create a new project in MongoDB
   */
  async createProject(projectData: Partial<Project>): Promise<Project> {
    const res = await fetch(getApiUrl('/api/projects'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create project');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Update an existing project in MongoDB
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const res = await fetch(getApiUrl(`/api/projects/${encodeURIComponent(projectId)}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update project');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Delete a project from MongoDB
   */
  async deleteProject(projectId: string): Promise<boolean> {
    const res = await fetch(getApiUrl(`/api/projects/${encodeURIComponent(projectId)}`), {
      method: 'DELETE',
    });
    return res.ok;
  },

  /**
   * Employee self-service project detail update (supports 2 or 3 arguments)
   */
  async updateEmployeeProjectDetails(
    arg1: string,
    arg2: string | Partial<Project>,
    arg3?: Partial<Project>
  ): Promise<Project> {
    const projectId = typeof arg2 === 'string' ? arg2 : arg1;
    const updates = typeof arg2 === 'string' ? (arg3 || {}) : (arg2 as Partial<Project>);
    return this.updateProject(projectId, updates);
  },

  /**
   * Add a feature to a project in MongoDB
   */
  async addFeature(projectId: string, featureData: Omit<ProjectFeature, 'id'>): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newFeature: ProjectFeature = {
      ...featureData,
      id: `feat-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const updatedFeatures = [...(project.features || []), newFeature];
    return this.updateProject(projectId, { features: updatedFeatures });
  },

  /**
   * Update a feature in MongoDB
   */
  async updateFeature(projectId: string, featureId: string, updates: Partial<ProjectFeature>): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updatedFeatures = (project.features || []).map((f) =>
      f.id === featureId
        ? { ...f, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
        : f
    );

    return this.updateProject(projectId, { features: updatedFeatures });
  },

  /**
   * Delete a feature from a project in MongoDB
   */
  async deleteFeature(projectId: string, featureId: string): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updatedFeatures = (project.features || []).filter((f) => f.id !== featureId);
    return this.updateProject(projectId, { features: updatedFeatures });
  },

  /**
   * Assign employee to project in MongoDB
   */
  async assignEmployee(projectId: string, employeeData: Omit<ProjectEmployee, 'id'> & { id?: string }): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newEmp: ProjectEmployee = {
      ...employeeData,
      id: employeeData.id || `pe-${Date.now()}`,
      assignedDate: new Date().toISOString().split('T')[0],
    };

    const existing = project.assignedEmployees || [];
    const index = existing.findIndex((e) => e.id === newEmp.id || e.email === newEmp.email);

    let updatedEmployees: ProjectEmployee[];
    if (index >= 0) {
      updatedEmployees = existing.map((e, i) => (i === index ? { ...e, ...newEmp } : e));
    } else {
      updatedEmployees = [...existing, newEmp];
    }

    return this.updateProject(projectId, { assignedEmployees: updatedEmployees });
  },

  /**
   * Bulk assign employees to project
   */
  async assignEmployees(projectId: string, employeeIds: string[]): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const allEmps = await employeeService.getEmployees();
    const assigned: ProjectEmployee[] = employeeIds.map((id) => {
      const emp = allEmps.find((e) => e.id === id || e.employeeId === id || e.email === id);
      return {
        id: emp?.employeeId || id,
        name: emp?.name || 'Project Member',
        initials: emp?.initials || 'EM',
        designation: emp?.designation || 'Specialist',
        projectRole: emp?.projectRole || emp?.designation || 'Specialist',
        email: emp?.email || '',
        phone: emp?.phone || '',
        currentTaskCount: emp?.currentTaskCount || 0,
        assignedDate: new Date().toISOString().split('T')[0],
      };
    });

    return this.updateProject(projectId, { assignedEmployees: assigned });
  },

  /**
   * Remove assigned employee from project
   */
  async removeEmployee(projectId: string, employeeId: string): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updated = (project.assignedEmployees || []).filter((e) => e.id !== employeeId && e.email !== employeeId);
    return this.updateProject(projectId, { assignedEmployees: updated });
  },

  /**
   * Add credential to project
   */
  async addCredential(projectId: string, credData: Omit<ProjectCredential, 'id'>): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newCred: ProjectCredential = {
      ...credData,
      id: `cred-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const updated = [...(project.credentials || []), newCred];
    return this.updateProject(projectId, { credentials: updated });
  },

  /**
   * Delete credential from project
   */
  async deleteCredential(projectId: string, credentialId: string): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updated = (project.credentials || []).filter((c) => c.id !== credentialId);
    return this.updateProject(projectId, { credentials: updated });
  },

  /**
   * Add invoice to project
   */
  async addInvoice(projectId: string, invoiceData: Omit<ProjectInvoice, 'id'>): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newInv: ProjectInvoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
    };

    const updated = [...(project.invoices || []), newInv];
    return this.updateProject(projectId, { invoices: updated });
  },
};
