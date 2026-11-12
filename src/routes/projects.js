const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET /api/projects - list all projects
router.get('/', async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (search && search.trim()) {
      query.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { projectCode: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ];
    }

    const projects = await Project.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, data: projects.map(p => p.toClient()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id - get single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let project = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }
    if (!project) {
      project = await Project.findOne({
        $or: [{ projectCode: id }, { name: new RegExp(`^${id}$`, 'i') }],
      });
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project.toClient() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects - create new project
router.post('/', async (req, res) => {
  try {
    let projectCode = req.body.projectCode;
    if (!projectCode) {
      const count = await Project.countDocuments();
      projectCode = `PRJ${String(count + 1).padStart(3, '0')}`;
    }
    const project = await Project.create({ ...req.body, projectCode });
    res.status(201).json({ success: true, data: project.toClient() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id - update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let project = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }
    if (!project) {
      project = await Project.findOneAndUpdate({ projectCode: id }, req.body, { new: true, runValidators: true });
    }
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project.toClient() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

