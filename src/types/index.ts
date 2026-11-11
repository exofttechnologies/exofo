export interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  company?: string;
}

export interface ProjectFeature {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  srsDocName?: string;
  status: 'Planned' | 'In Development' | 'Testing' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  lastUpdated?: string;
}

export interface ProjectEmployee {
  id: string;
  name: string;
  initials: string;
  designation: string;
  projectRole: string;
  email: string;
  phone: string;
  currentTaskCount: number;
  avatar?: string;
  assignedDate?: string;
}

export interface PhaseStep {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  completed: boolean;
  notes?: string;
  dueDate?: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  completionPercentage: number;
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed';
  steps: PhaseStep[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  category: 'SRS Documents' | 'Design Files' | 'Development Files' | 'Client Documents' | 'General Documents';
  size: string;
  uploadDate: string;
  uploadedBy: string;
  fileType: string;
  url?: string;
}

export interface ProjectCredential {
  id: string;
  platform: string;
  url: string;
  username: string;
  password: string;
  notes: string;
  lastUpdated: string;
  category?: string;
}

export interface ProjectInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  date: string;
  dueDate: string;
  amount: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  fileSize: string;
  clientName: string;
}

export interface Project {
  id: string;
  projectCode: string; // e.g. PRJ001
  name: string;
  description: string;
  category?: string;
  status: 'In Progress' | 'Completed' | 'On Hold' | 'Archived';
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  iconName: 'Monitor' | 'GraduationCap' | 'Smartphone' | 'Database' | 'Layout';
  startDate: string;
  expectedCompletionDate: string;
  client: ClientInfo;
  features: ProjectFeature[];
  assignedEmployees: ProjectEmployee[];
  phases: ProjectPhase[];
  documents: ProjectDocument[];
  credentials: ProjectCredential[];
  invoices: ProjectInvoice[];
  budget?: string;
  spent?: string;
  timeline?: string;
  teamSize?: number;
  teamMembers?: { name: string; initials: string; role: string }[];
  milestones?: { id: string; title: string; completed: boolean; date: string }[];
}

export interface StatisticCardData {
  id: string;
  title: string;
  value: number;
  iconName: 'ClipboardCheck' | 'Calendar' | 'Users' | 'CheckCircle2';
  trend?: string;
}

export interface FolderTab {
  id: string;
  title: string;
  iconName: 'FileText' | 'ListTodo' | 'Users' | 'Folder';
  color?: string;
  count?: number;
}

export type NavTab = 'home' | 'projects' | 'tasks' | 'profile';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface TaskActivity {
  id: string;
  taskId: string;
  description: string;
  type: 'created' | 'assigned' | 'started' | 'progress_updated' | 'status_changed' | 'completed' | 'reassigned' | 'edited';
  updatedBy: string;
  timestamp: string;
}

export interface Task {
  id: string;
  taskId: string; // e.g. TSK001
  taskName: string;
  description: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedEmployeeAvatar?: string;
  assignedEmployeeDesignation?: string;
  assignedEmployeeEmail?: string;
  assignedEmployeePhone?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  isIndependent: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0 to 100
  startDate?: string;
  dueDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  progressNotes?: string;
  activityHistory?: TaskActivity[];
}

export type EmployeeAccountStatus = 'Active' | 'Inactive';

export interface Employee {
  id: string; // Internal id / Mongo _id
  employeeId: string; // e.g. EMP001
  name: string;
  initials: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: string;
  accountStatus: EmployeeAccountStatus;
  avatar?: string;
  projectRole?: string;
  currentTaskCount?: number;
  assignedProjects?: string[]; // IDs or names
}

export interface AdminProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  designation: string;
  company: string;
  avatar?: string;
  accountCreatedAt: string;
  unreadNotifications: number;
  twoFactorEnabled?: boolean;
}


