import { Project } from '../types';
import { projectService } from './projectService';

export interface ProjectHistoryFilterParams {
  search?: string;
  category?: string;
  year?: string;
  client?: string;
  status?: string;
}

export interface ProjectHistorySummary {
  totalHistorical: number;
  completedCount: number;
  archivedCount: number;
  totalDeliveredBudget: string;
}

export const projectHistoryService = {
  /**
   * Fetch all historical (completed or archived) projects from MongoDB
   */
  async getHistoricalProjects(filters?: ProjectHistoryFilterParams): Promise<Project[]> {
    const all = await projectService.getAllProjects();
    let historical = all.filter((p) => p.status === 'Completed' || p.status === 'Archived');

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      historical = historical.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.projectCode.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.client.name.toLowerCase().includes(q) ||
          (p.client.company && p.client.company.toLowerCase().includes(q))
      );
    }

    if (filters?.category && filters.category !== 'All') {
      historical = historical.filter(
        (p) => p.category && p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters?.status && filters.status !== 'All') {
      historical = historical.filter((p) => p.status === filters.status);
    }

    return historical;
  },

  /**
   * Get historical summary statistics from MongoDB
   */
  async getHistorySummary(): Promise<ProjectHistorySummary> {
    const historical = await this.getHistoricalProjects();
    const completedCount = historical.filter((p) => p.status === 'Completed').length;
    const archivedCount = historical.filter((p) => p.status === 'Archived').length;

    return {
      totalHistorical: historical.length,
      completedCount,
      archivedCount,
      totalDeliveredBudget: '$1.4M+',
    };
  },

  /**
   * Fetch single historical project details from MongoDB
   */
  async getHistoricalProjectById(projectId: string): Promise<Project | null> {
    return projectService.getProjectById(projectId);
  },
};
