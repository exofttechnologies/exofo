const express = require('express');
const router = express.Router();

// Mock store for historical projects
let historicalProjects = [
  {
    id: 'proj-4',
    projectCode: 'PRJ004',
    name: 'ExoHRM',
    description: 'Internal Payroll & HR Enterprise Suite',
    category: 'Enterprise Tooling',
    status: 'Completed',
    priority: 'Medium',
    progress: 100,
    startDate: '2026-05-10',
    expectedCompletionDate: '2026-10-01',
    client: {
      name: 'Exofo Executive Operations',
      company: 'Exofo Technologies Corp',
      email: 'operations@exofo.internal',
      phone: '+1 (555) 100-2000',
      address: 'Exofo Global HQ, 500 Silicon Vista, San Francisco, CA',
    },
  },
  {
    id: 'proj-6',
    projectCode: 'PRJ006',
    name: 'Atlas ERP Logistics',
    description: 'Enterprise Resource Planning & Multi-Warehouse Tracking System',
    category: 'Supply Chain & ERP',
    status: 'Archived',
    priority: 'High',
    progress: 100,
    startDate: '2025-02-01',
    expectedCompletionDate: '2025-11-20',
    client: {
      name: 'Helena Lindqvist',
      company: 'Nordic Cargo & Freight AB',
      email: 'h.lindqvist@nordiccargo.se',
      phone: '+46 8 123 4567',
      address: 'Skeppsbron 14, 111 30 Stockholm, Sweden',
    },
  },
];

/**
 * GET /api/project-history
 */
router.get('/', (req, res) => {
  const { search, status } = req.query;
  let result = [...historicalProjects];

  if (status && status !== 'All') {
    result = result.filter((p) => p.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        p.client.name.toLowerCase().includes(q) ||
        p.client.company.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, data: result });
});

/**
 * GET /api/project-history/:projectId
 */
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const project = historicalProjects.find(
    (p) => p.id === projectId || p.projectCode.toLowerCase() === projectId.toLowerCase()
  );

  if (!project) {
    return res.status(404).json({ success: false, message: 'Historical project not found' });
  }

  res.json({ success: true, data: project });
});

module.exports = router;

