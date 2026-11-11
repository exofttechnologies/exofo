import { Project, ProjectFeature, ProjectEmployee, ProjectCredential, ProjectInvoice } from '../types';
import { currentProjects, allCompanyEmployees } from '../data/mockData';

// In-memory / persistent mock store (mirrors MongoDB backend schema)
let projectsStore: Project[] = [...currentProjects];

export const projectService = {
  /**
   * Fetch a single project by its ID / ObjectId
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    // Simulate brief network latency (realistic loading states)
    await new Promise((resolve) => setTimeout(resolve, 150));

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
    return { ...updated };
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

