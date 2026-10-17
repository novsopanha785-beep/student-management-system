export type Gender = 'Male' | 'Female' | 'Other';
export type StudentStatus = 'Active' | 'Inactive';

export interface Student {
  id: number;
  student_id: string;
  full_name: string;
  gender: Gender;
  date_of_birth: string; // YYYY-MM-DD
  email: string;
  phone: string;
  course: string;
  academic_year: number;
  class_name: string;
  address: string;
  enrollment_date: string; // YYYY-MM-DD
  status: StudentStatus;
  created_at?: string;
  updated_at?: string;
}

export type StudentPayload = Omit<Student, 'id' | 'created_at' | 'updated_at'>;

export interface StudentQuery {
  search?: string;
  course?: string;
  class_name?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalCourses: number;
  totalClasses: number;
  recentStudents: Student[];
}

/** One row of the Classes / Courses overview pages. */
export interface SummaryItem {
  name: string;
  total: number;
  active: number;
  inactive: number;
}

/** Returned by GET /api/demo/status. demoMode is false on your own computer. */
export interface DemoStatus {
  demoMode: boolean;
  maxStudents: number | null;
  minStudents: number | null;
  resetEveryHours: number | null;
  nextResetAt: string | null;
}
