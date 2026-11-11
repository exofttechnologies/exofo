import { Project } from '../types';
import { currentProjects } from '../data/mockData';

export interface ProjectHistoryFilterParams {
  search?: string;
  status?: string; // 'All' | 'Completed' | 'Archived'
}

export const projectHistoryService = {
  /**
   * Fetch completed and archived historical projects only
   * (Strictly excludes active projects)
   */
  async getHistoricalProjects(filters?: ProjectHistoryFilterParams): Promise<Project[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const query = new URLSearchParams();
      if (filters?.search) query.append('search', filters.search);
      if (filters?.status && filters.status !== 'All') query.append('status', filters.status);

      const res = await fetch(`/api/project-history?${query.toString()}`, { signal: controller.signal });
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

    // Filter ONLY Completed and Archived
    let historical = currentProjects.filter(
      (p) => p.status === 'Completed' || p.status === 'Archived'
    );

    // Status filter
    if (filters?.status && filters.status !== 'All') {
      historical = historical.filter(
        (p) => p.status.toLowerCase() === filters.status!.toLowerCase()
      );
    }

    // Search filter (by project name or client name)
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      historical = historical.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.projectCode.toLowerCase().includes(q) ||
          p.client.name.toLowerCase().includes(q) ||
          (p.client.company && p.client.company.toLowerCase().includes(q))
      );
    }

    return historical;
  },

  /**
   * Fetch single historical project by ID or code
   */
  async getHistoricalProjectById(idOrCode: string): Promise<Project | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`/api/project-history/${idOrCode}`, { signal: controller.signal });
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

    const project = currentProjects.find(
      (p) =>
        (p.status === 'Completed' || p.status === 'Archived') &&
        (p.id === idOrCode || p.projectCode.toLowerCase() === idOrCode.toLowerCase())
    );

    return project ? { ...project } : null;
  },
};

