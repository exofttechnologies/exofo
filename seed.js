require('dotenv').config();
const mongoose = require('mongoose');

const Admin = require('./src/models/Admin');
const Employee = require('./src/models/Employee');
const Task = require('./src/models/Task');
const Project = require('./src/models/Project');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // ── ADMIN ──────────────────────────────────────────────────
    let admin = await Admin.findOne({ email: 'admin@exofo.internal' });
    if (admin) {
      console.log('Updating Admin...');
      admin.name = 'admin';
      admin.password = 'admin';
      admin.designation = 'Administrator';
      admin.company = 'Exofo';
      await admin.save();
    } else {
      admin = await Admin.create({
        name: 'admin',
        email: 'admin@exofo.internal',
        password: 'admin',
        designation: 'Administrator',
        company: 'Exofo',
        role: 'admin',
      });
    }
    console.log('✅ Admin ready: admin@exofo.internal / admin');

    // ── EMPLOYEE ───────────────────────────────────────────────
    let emp = await Employee.findOne({ employeeId: 'EMP001' });
    if (emp) {
      console.log('Updating Employee EMP001...');
      emp.name = 'emp1';
      emp.password = '123456';
      emp.email = 'emp1@exofo.internal';
      emp.designation = 'Frontend Developer';
      emp.department = 'Engineering';
      emp.accountStatus = 'Active';
      await emp.save();
    } else {
      emp = await Employee.create({
        employeeId: 'EMP001',
        name: 'emp1',
        email: 'emp1@exofo.internal',
        password: '123456',
        designation: 'Frontend Developer',
        department: 'Engineering',
        joiningDate: new Date().toISOString().split('T')[0],
        accountStatus: 'Active',
      });
    }
    console.log('✅ Employee ready: EMP001 / 123456');

    // ── PROJECTS ───────────────────────────────────────────────
    const existingProjects = await Project.countDocuments();
    if (existingProjects === 0) {
      console.log('Seeding initial projects assigned to emp1...');
      await Project.create([
        {
          projectCode: 'PRJ001',
          name: 'Exofo Enterprise Dashboard',
          description: 'Core web portal and management dashboard for company operations.',
          category: 'Web App',
          status: 'In Progress',
          priority: 'High',
          progress: 65,
          iconName: 'Layout',
          startDate: '2026-01-10',
          expectedCompletionDate: '2026-12-30',
          client: {
            name: 'Exofo Technologies Corp',
            email: 'client@exofo.internal',
            company: 'Exofo Tech',
          },
          assignedEmployees: [
            {
              id: emp.employeeId,
              name: emp.name,
              initials: emp.initials || 'E1',
              designation: emp.designation,
              projectRole: 'Lead UI Engineer',
              email: emp.email,
              phone: emp.phone || '',
              currentTaskCount: 2,
            },
          ],
        },
        {
          projectCode: 'PRJ002',
          name: 'Mobile Client Application',
          description: 'iOS and Android native client app for enterprise communications.',
          category: 'Mobile App',
          status: 'In Progress',
          priority: 'Medium',
          progress: 40,
          iconName: 'Smartphone',
          startDate: '2026-02-01',
          expectedCompletionDate: '2026-11-15',
          client: {
            name: 'Global Enterprises Inc',
            email: 'ops@global.internal',
            company: 'Global Enterprises',
          },
          assignedEmployees: [
            {
              id: emp.employeeId,
              name: emp.name,
              initials: emp.initials || 'E1',
              designation: emp.designation,
              projectRole: 'Frontend Developer',
              email: emp.email,
              phone: emp.phone || '',
              currentTaskCount: 1,
            },
          ],
        },
      ]);
      console.log('✅ 2 Projects created and assigned to emp1.');
    } else {
      console.log('Projects already exist in DB.');
    }

    // ── TASKS ──────────────────────────────────────────────────
    const existingTasks = await Task.countDocuments();
    if (existingTasks === 0) {
      console.log('Seeding initial tasks for emp1...');
      await Task.create([
        {
          taskId: 'TSK001',
          taskName: 'Implement Authentication & JWT Flow',
          description: 'Connect frontend login forms with backend API endpoints and manage secure tokens.',
          assignedEmployeeId: emp.employeeId,
          assignedEmployeeName: emp.name,
          assignedEmployeeDesignation: emp.designation,
          assignedEmployeeEmail: emp.email,
          projectCode: 'PRJ001',
          projectName: 'Exofo Enterprise Dashboard',
          priority: 'High',
          status: 'In Progress',
          progress: 75,
          dueDate: '2026-11-20',
          startDate: '2026-11-10',
        },
        {
          taskId: 'TSK002',
          taskName: 'Build Real-Time Analytics Dashboard',
          description: 'Render responsive charts, statistics cards, and real data feeds from MongoDB.',
          assignedEmployeeId: emp.employeeId,
          assignedEmployeeName: emp.name,
          assignedEmployeeDesignation: emp.designation,
          assignedEmployeeEmail: emp.email,
          projectCode: 'PRJ001',
          projectName: 'Exofo Enterprise Dashboard',
          priority: 'Medium',
          status: 'Pending',
          progress: 25,
          dueDate: '2026-11-25',
          startDate: '2026-11-12',
        },
        {
          taskId: 'TSK003',
          taskName: 'Integrate Mobile Responsive Views',
          description: 'Audit mobile phone viewports and ensure touch interactions work smoothly.',
          assignedEmployeeId: emp.employeeId,
          assignedEmployeeName: emp.name,
          assignedEmployeeDesignation: emp.designation,
          assignedEmployeeEmail: emp.email,
          projectCode: 'PRJ002',
          projectName: 'Mobile Client Application',
          priority: 'Low',
          status: 'Completed',
          progress: 100,
          dueDate: '2026-11-11',
          startDate: '2026-11-05',
        },
      ]);
      console.log('✅ 3 Tasks created for emp1.');
    } else {
      console.log('Tasks already exist in DB.');
    }

    console.log('\n🎉 Real Database seeding complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
