# Exofo – Company Management System

A modern, premium, fully responsive web application for **Exofo – Company Management System**, built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Lucide React Icons**, and **React Router DOM**.

The design implements a blue glassmorphism theme with modular skeuomorphic cards, clean typography, and responsive layouts across mobile, tablet, and desktop viewports.

---

## 🧭 Page Architecture & Routes

### 1. Home Dashboard (`/`)
- Responsive Home Dashboard featuring the **layered folder tabs** (*Documents, Tasks, Team*), centerpiece electric blue **Projects Card**, **2x2 Statistics Grid**, and **Current Projects** list.

### 2. All Projects Listing (`/projects`)
- Filterable and searchable enterprise project catalog (*All, In Progress, Completed, On Hold*).
- Clicking any project card navigates directly to that project's dedicated **Project Sections Page** (`/projects/:projectId`).

### 3. Project Dedicated Sections Hub (`/projects/:projectId`)
When clicking any project from the Projects page, the application opens a dedicated management hub displaying **9 clickable glassmorphism section cards** in a responsive grid (1-col on mobile, 2-col on tablet, 3-col on desktop):

| Section Card | Route | Description |
| :--- | :--- | :--- |
| **Project Details** | `/projects/:projectId/details` | View and edit project specs, dates, priority, and client contact details. |
| **Project Features** | `/projects/:projectId/features` | Functional deliverables list, SRS file references, priority tags, and add/delete actions. |
| **Feature Details** | `/projects/:projectId/features/:featureId` | Detailed acceptance criteria, requirements checklist, and feature status updates. |
| **Assigned Employees** | `/projects/:projectId/employees` | Roster of engineers allocated to this project, designations, contact info, and task loads. |
| **Assign Employees** | `/projects/:projectId/assign-employees` | Talent directory search with multi-select assignment to add/remove project squad members. |
| **Project Phases** | `/projects/:projectId/phases` | Phase roadmap, order sequence, milestone step counts, and completion percentage bars. |
| **Phase Details** | `/projects/:projectId/phases/:phaseId` | Step-by-step deliverable tasks, employee assignment, due dates, and completion toggles. |
| **Project Documents** | `/projects/:projectId/documents` | Categorized repository (*SRS Documents, Design Files, Development Files, Client Documents, General Documents*) with file uploads and downloads. |
| **Password Vault** | `/projects/:projectId/credentials` | Secure credential repository for platform logins, URLs, and API keys with masked password reveal toggles. |
| **Invoices & Bills** | `/projects/:projectId/invoices` | Milestone invoicing records, payment status badges (*Paid, Pending, Overdue*), and PDF receipts. |
| **Milestones & Roadmap** | `/projects/:projectId/milestones` | Delivery deadlines, sprints, and interactive completion checklist. |

---

### 4. Task Management Module (`/tasks`)

The dedicated **Task Management section** built with responsive blue glassmorphism, full MongoDB backend schema, and seamless client state:

| Page | Route | Description |
| :--- | :--- | :--- |
| **Task Listing** | `/tasks` | Manage and monitor ongoing tasks. 4 summary cards (*Total Running, Pending, In Progress, Completed*), live search, multi-criteria filters (*Priority, Employee, Project, Due Date*), responsive task cards, and floating add button. |
| **Create Task** | `/tasks/create` | Form to create standalone tasks or associate tasks with projects/employees. Only Task Name is required; supports independent operational tasks. |
| **Task Details** | `/tasks/:taskId` | Detailed view including Task Information, Assigned Employee card with contact info, Related Project card with navigation to project sections, Progress bar, Activity History vertical timeline, and Admin quick actions (*Change Status, Change Priority, Reassign, Delete with modal*). |
| **Edit Task** | `/tasks/:taskId/edit` | Pre-populated form to update task name, description, priority, status, dates, progress percentage, or reassign talent. |

#### Backend Architecture & MongoDB Schema:
- **Express Server**: `server/index.js`
- **Mongoose Models**:
  - `server/models/Task.js` (`taskId`, `taskName`, `description`, `assignedEmployee`, `projectId`, `priority`, `status`, `progress`, `startDate`, `dueDate`, `createdBy`)
  - `server/models/TaskActivity.js` (`taskId`, `description`, `type`, `updatedBy`, `timestamp`)
- **API Endpoints**:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `GET /api/tasks/:taskId`
  - `PUT /api/tasks/:taskId`
  - `DELETE /api/tasks/:taskId`
  - `PATCH /api/tasks/:taskId/status`
  - `GET /api/tasks/:taskId/activity`
- **Dual-Mode Task Service**: `src/services/taskService.ts` automatically calls `/api/tasks` if the backend is connected and smoothly falls back to a persistent local store with initial demo tasks (*TSK001, TSK002, TSK003, TSK004*) when running standalone.

---

### 5. Profile Menu Section (10 Dedicated Pages)

Triggered from any Admin Profile icon or avatar across the application (`ProfileDrawer.tsx`):

#### A. Employee Management
| Page | Route | Description |
| :--- | :--- | :--- |
| **1. Employee Listing** | `/employees` | Responsive card directory of company personnel with search by name/ID, filters by designation/status, and quick action shortcuts. |
| **2. Add Employee** | `/employees/create` | Clean registration form with uniqueness validation for email and employee ID, department picker, and credentials setup. |
| **3. Employee Details** | `/employees/:employeeId` | Full employee dossier, profile avatar, contact channels, assigned projects count, and account activation/deactivation modal. |
| **4. Edit Employee** | `/employees/:employeeId/edit` | Pre-populated form to update employee details, designation, department, and account status with duplicate protection. |
| **5. Employee Assignments** | `/employees/:employeeId/assignments` | Dual-section breakdown of all assigned projects and active sprint tasks owned by the employee. |

#### B. Project History
| Page | Route | Description |
| :--- | :--- | :--- |
| **6. Project History** | `/project-history` | Directory of completed and archived projects (strictly excluding active projects) with search and status filters. |
| **7. Historical Project Details** | `/project-history/:projectId` | Read-only compliance dossier showing client specs, deliverable features, phases, archived documents, and settled invoices. |

#### C. Admin Profile
| Page | Route | Description |
| :--- | :--- | :--- |
| **8. Admin Profile** | `/profile` | Super administrator account details, corporate email, phone, designation, and security overview. |
| **9. Edit Profile** | `/profile/edit` | Update admin full name, email, phone number, and designation with uniqueness checks. |
| **10. Change Password** | `/profile/change-password` | Form to securely update admin password with current password verification and confirmation matching. |

#### Backend Architecture & MongoDB Schema:
- **Mongoose Models**:
  - `server/models/Employee.js` (`employeeId`, `name`, `email`, `phone`, `designation`, `department`, `joiningDate`, `accountStatus`, `passwordHash`)
- **Express Routes**:
  - `server/routes/employeeRoutes.js` (`/api/employees`, `/api/employees/:id`, `/api/employees/:id/status`)
  - `server/routes/historyRoutes.js` (`/api/project-history`, `/api/project-history/:id`)
  - `server/routes/profileRoutes.js` (`/api/profile`, `/api/profile/change-password`)
- **Dual-Mode Client Services**:
  - `src/services/employeeService.ts`
  - `src/services/projectHistoryService.ts`
  - `src/services/adminProfileService.ts`

---

## 🎨 Design System

- **Glassmorphism**: `backdrop-blur-xl`, `bg-white/80`, subtle borders `rgba(255, 255, 255, 0.85)`, and soft diffuse blue drop-shadows.
- **Color Palette**:
  - **Primary Blue**: `#1261E8`
  - **Deep Blue**: `#0645B5`
  - **Light Blue**: `#DCEBFF`
  - **Background**: `#F5F8FF`
  - **Primary Text**: `#111827`
  - **Secondary Text**: `#64748B`
  - **Border**: `rgba(255, 255, 255, 0.65)`
- **Typography**: Plus Jakarta Sans for clean geometric modern legibility.

---

## 🚀 Running the Project

```bash
cd /Users/muhammedrafiok/Desktop/exofo
npm run dev
```
Open **`http://localhost:5173`** in your browser.

To verify the production build:
```bash
npm run build
npm run preview
```
# exofo


# Backend already added