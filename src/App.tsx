import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectPage } from './pages/projects/CreateProjectPage';
import { ProjectSectionsPage } from './pages/ProjectSectionsPage';

// Section Dedicated Pages
import { ProjectDetailsSectionPage } from './pages/sections/ProjectDetailsSectionPage';
import { ProjectFeaturesSectionPage } from './pages/sections/ProjectFeaturesSectionPage';
import { AddFeaturePage } from './pages/sections/AddFeaturePage';
import { ProjectFeatureDetailsSectionPage } from './pages/sections/ProjectFeatureDetailsSectionPage';
import { ProjectEmployeesSectionPage } from './pages/sections/ProjectEmployeesSectionPage';
import { ProjectAssignEmployeesSectionPage } from './pages/sections/ProjectAssignEmployeesSectionPage';
import { ProjectPhasesSectionPage } from './pages/sections/ProjectPhasesSectionPage';
import { CreatePhasePage } from './pages/sections/CreatePhasePage';
import { ProjectPhaseDetailsSectionPage } from './pages/sections/ProjectPhaseDetailsSectionPage';
import { ProjectDocumentsSectionPage } from './pages/sections/ProjectDocumentsSectionPage';
import { ProjectCredentialsSectionPage } from './pages/sections/ProjectCredentialsSectionPage';
import { ProjectInvoicesSectionPage } from './pages/sections/ProjectInvoicesSectionPage';
import { ProjectMilestonesSectionPage } from './pages/sections/ProjectMilestonesSectionPage';

// Task Management Pages
import { TasksPage } from './pages/TasksPage';
import { CreateTaskPage } from './pages/tasks/CreateTaskPage';
import { TaskDetailPage } from './pages/tasks/TaskDetailPage';
import { EditTaskPage } from './pages/tasks/EditTaskPage';

// Employee Management Pages
import { EmployeeListingPage } from './pages/employees/EmployeeListingPage';
import { AddEmployeePage } from './pages/employees/AddEmployeePage';
import { EmployeeDetailPage } from './pages/employees/EmployeeDetailPage';
import { EditEmployeePage } from './pages/employees/EditEmployeePage';
import { EmployeeAssignmentsPage } from './pages/employees/EmployeeAssignmentsPage';

// Project History Pages
import { ProjectHistoryPage } from './pages/history/ProjectHistoryPage';
import { HistoricalProjectDetailPage } from './pages/history/HistoricalProjectDetailPage';

// Admin Profile Pages
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { ChangePasswordPage } from './pages/profile/ChangePasswordPage';

// Employee Module Pages
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { EmployeeProjectsPage } from './pages/employee/EmployeeProjectsPage';
import { EmployeeProjectDetailsRoutePage } from './pages/employee/EmployeeProjectDetailsRoutePage';
import { EmployeeProjectDetailsEditPage } from './pages/employee/EmployeeProjectDetailsEditPage';
import { EmployeeTasksPage } from './pages/employee/EmployeeTasksPage';
import { EmployeeTaskDetailPage } from './pages/employee/EmployeeTaskDetailPage';
import { EmployeeTaskUpdatePage } from './pages/employee/EmployeeTaskUpdatePage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';
import { EmployeeProfileEditPage } from './pages/employee/EmployeeProfileEditPage';
import { EmployeeChangePasswordPage } from './pages/employee/EmployeeChangePasswordPage';

/**
 * ProtectedRoute – requires valid exofo_auth.
 * Also enforces role separation:
 *   - admin/superadmin must NOT access /employee/* routes → redirected to /
 *   - employee must NOT access admin routes (/) → redirected to /employee/dashboard
 */
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee';
}> = ({ children, requiredRole }) => {
  const isAuth = localStorage.getItem('exofo_auth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  const role = localStorage.getItem('exofo_user_role') || '';

  if (requiredRole === 'employee') {
    // Only employees may access these routes
    if (role !== 'employee') {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole === 'admin') {
    // Only admins/superadmins may access these routes
    if (role !== 'admin' && role !== 'superadmin') {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

/**
 * RoleBasedHome – the / route redirects employees to their workspace.
 * Admins/superadmins see the main dashboard.
 */
const RoleBasedHome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = localStorage.getItem('exofo_auth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  const role = localStorage.getItem('exofo_user_role') || '';
  if (role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* 1. Home Dashboard Page — role-aware: employees redirect to /employee/dashboard */}
          <Route 
            path="/" 
            element={
              <RoleBasedHome>
                <DashboardPage />
              </RoleBasedHome>
            } 
          />

          {/* 2. All Projects Listing Page */}
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />

          {/* 2b. Create Project Page */}
          <Route 
            path="/projects/create" 
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateProjectPage />
              </ProtectedRoute>
            } 
          />

          {/* 3. Project Dedicated Sections Hub */}
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ProjectSectionsPage />
              </ProtectedRoute>
            } 
          />

          {/* 4. Individual Section Dedicated Pages */}
          <Route path="/projects/:projectId/details" element={<ProtectedRoute requiredRole="admin"><ProjectDetailsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/features" element={<ProtectedRoute requiredRole="admin"><ProjectFeaturesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/features/create" element={<ProtectedRoute requiredRole="admin"><AddFeaturePage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/features/:featureId" element={<ProtectedRoute requiredRole="admin"><ProjectFeatureDetailsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/employees" element={<ProtectedRoute requiredRole="admin"><ProjectEmployeesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/assign-employees" element={<ProtectedRoute requiredRole="admin"><ProjectAssignEmployeesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/phases" element={<ProtectedRoute requiredRole="admin"><ProjectPhasesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/phases/create" element={<ProtectedRoute requiredRole="admin"><CreatePhasePage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/phases/:phaseId" element={<ProtectedRoute requiredRole="admin"><ProjectPhaseDetailsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/documents" element={<ProtectedRoute requiredRole="admin"><ProjectDocumentsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/credentials" element={<ProtectedRoute requiredRole="admin"><ProjectCredentialsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/invoices" element={<ProtectedRoute requiredRole="admin"><ProjectInvoicesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/milestones" element={<ProtectedRoute requiredRole="admin"><ProjectMilestonesSectionPage /></ProtectedRoute>} />

          {/* 5. Task Management Pages */}
          <Route path="/tasks" element={<ProtectedRoute requiredRole="admin"><TasksPage /></ProtectedRoute>} />
          <Route path="/tasks/create" element={<ProtectedRoute requiredRole="admin"><CreateTaskPage /></ProtectedRoute>} />
          <Route path="/tasks/:taskId" element={<ProtectedRoute requiredRole="admin"><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/tasks/:taskId/edit" element={<ProtectedRoute requiredRole="admin"><EditTaskPage /></ProtectedRoute>} />

          {/* 6. Employee Management Pages */}
          <Route path="/employees" element={<ProtectedRoute requiredRole="admin"><EmployeeListingPage /></ProtectedRoute>} />
          <Route path="/employees/create" element={<ProtectedRoute requiredRole="admin"><AddEmployeePage /></ProtectedRoute>} />
          <Route path="/employees/:employeeId" element={<ProtectedRoute requiredRole="admin"><EmployeeDetailPage /></ProtectedRoute>} />
          <Route path="/employees/:employeeId/edit" element={<ProtectedRoute requiredRole="admin"><EditEmployeePage /></ProtectedRoute>} />
          <Route path="/employees/:employeeId/assignments" element={<ProtectedRoute requiredRole="admin"><EmployeeAssignmentsPage /></ProtectedRoute>} />

          {/* 7. Project History Pages */}
          <Route path="/project-history" element={<ProtectedRoute requiredRole="admin"><ProjectHistoryPage /></ProtectedRoute>} />
          <Route path="/project-history/:projectId" element={<ProtectedRoute requiredRole="admin"><HistoricalProjectDetailPage /></ProtectedRoute>} />

          {/* 8. Admin Profile Pages */}
          <Route path="/profile" element={<ProtectedRoute requiredRole="admin"><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute requiredRole="admin"><EditProfilePage /></ProtectedRoute>} />
          <Route path="/profile/change-password" element={<ProtectedRoute requiredRole="admin"><ChangePasswordPage /></ProtectedRoute>} />

          {/* 9. Employee Module — employees only */}
          <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
          <Route 
            path="/employee/dashboard" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/employee/projects" element={<ProtectedRoute requiredRole="employee"><EmployeeProjectsPage /></ProtectedRoute>} />
          <Route path="/employee/projects/:projectId" element={<ProtectedRoute requiredRole="employee"><EmployeeProjectDetailsRoutePage /></ProtectedRoute>} />
          <Route path="/employee/projects/:projectId/details" element={<ProtectedRoute requiredRole="employee"><EmployeeProjectDetailsEditPage /></ProtectedRoute>} />
          <Route path="/employee/tasks" element={<ProtectedRoute requiredRole="employee"><EmployeeTasksPage /></ProtectedRoute>} />
          <Route path="/employee/tasks/:taskId" element={<ProtectedRoute requiredRole="employee"><EmployeeTaskDetailPage /></ProtectedRoute>} />
          <Route path="/employee/tasks/:taskId/update" element={<ProtectedRoute requiredRole="employee"><EmployeeTaskUpdatePage /></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute requiredRole="employee"><EmployeeProfilePage /></ProtectedRoute>} />
          <Route path="/employee/profile/edit" element={<ProtectedRoute requiredRole="employee"><EmployeeProfileEditPage /></ProtectedRoute>} />
          <Route path="/employee/profile/change-password" element={<ProtectedRoute requiredRole="employee"><EmployeeChangePasswordPage /></ProtectedRoute>} />

          {/* Fallback routes — admin only */}
          <Route path="/team" element={<ProtectedRoute requiredRole="admin"><EmployeeListingPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute requiredRole="admin"><ProjectHistoryPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};
