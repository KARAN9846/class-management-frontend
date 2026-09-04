export interface Admin {
  id: number;
  userId: number;
  email: string;
  organizationName: string;
  adminCode: string;
  isActive: boolean;
  createdAt: string;

  teacherCount: number;
  studentCount: number;
  classCount: number;
  assignedRoleCount: number;
}