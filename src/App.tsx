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

/**
 * ProtectedRoute Component
 * Requires valid exofo_auth flag in localStorage to access management dashboard.
 * If not authenticated, seamlessly routes to the Exofo login screen.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = localStorage.getItem('exofo_auth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
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

          {/* 1. Home Dashboard Page (Protected) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* 2. All Projects Listing Page */}
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />

          {/* 2b. Create Project Page */}
          <Route 
            path="/projects/create" 
            element={
              <ProtectedRoute>
                <CreateProjectPage />
              </ProtectedRoute>
            } 
          />

          {/* 3. Project Dedicated Sections Hub */}
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <ProjectSectionsPage />
              </ProtectedRoute>
            } 
          />

          {/* 4. Individual Section Dedicated Pages */}
          <Route path="/projects/:projectId/details" element={<ProtectedRoute><ProjectDetailsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/features" element={<ProtectedRoute><ProjectFeaturesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/features/create" element={<ProtectedRoute><AddFeaturePage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/features/:featureId" element={<ProtectedRoute><ProjectFeatureDetailsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/employees" element={<ProtectedRoute><ProjectEmployeesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/assign-employees" element={<ProtectedRoute><ProjectAssignEmployeesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/phases" element={<ProtectedRoute><ProjectPhasesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/phases/create" element={<ProtectedRoute><CreatePhasePage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/phases/:phaseId" element={<ProtectedRoute><ProjectPhaseDetailsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/documents" element={<ProtectedRoute><ProjectDocumentsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/credentials" element={<ProtectedRoute><ProjectCredentialsSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/invoices" element={<ProtectedRoute><ProjectInvoicesSectionPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/milestones" element={<ProtectedRoute><ProjectMilestonesSectionPage /></ProtectedRoute>} />

          {/* 5. Task Management Pages */}
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/tasks/create" element={<ProtectedRoute><CreateTaskPage /></ProtectedRoute>} />
          <Route path="/tasks/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/tasks/:taskId/edit" element={<ProtectedRoute><EditTaskPage /></ProtectedRoute>} />

          {/* 6. Employee Management Pages */}
          <Route path="/employees" element={<ProtectedRoute><EmployeeListingPage /></ProtectedRoute>} />
          <Route path="/employees/create" element={<ProtectedRoute><AddEmployeePage /></ProtectedRoute>} />
          <Route path="/employees/:employeeId" element={<ProtectedRoute><EmployeeDetailPage /></ProtectedRoute>} />
          <Route path="/employees/:employeeId/edit" element={<ProtectedRoute><EditEmployeePage /></ProtectedRoute>} />
          <Route path="/employees/:employeeId/assignments" element={<ProtectedRoute><EmployeeAssignmentsPage /></ProtectedRoute>} />

          {/* 7. Project History Pages */}
          <Route path="/project-history" element={<ProtectedRoute><ProjectHistoryPage /></ProtectedRoute>} />
          <Route path="/project-history/:projectId" element={<ProtectedRoute><HistoricalProjectDetailPage /></ProtectedRoute>} />

          {/* 8. Admin Profile Pages */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/profile/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

          {/* Fallback routes */}
          <Route path="/team" element={<ProtectedRoute><EmployeeListingPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><ProjectHistoryPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};
