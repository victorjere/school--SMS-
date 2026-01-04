
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export interface PaymentAccount {
  id: string;
  provider: string; // e.g., 'MTN MoMo', 'Airtel Money', 'ZANACO'
  accountName: string;
  accountNumber: string;
  type: 'MOBILE_MONEY' | 'BANK';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber: string;
  schoolId: string;
  isApproved: boolean;
  password?: string;
  assignmentType?: 'PRIMARY' | 'SECONDARY';
  assignedGrade?: string;
  assignedSubjects?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface RegistrationRequest extends User {
  requestDate: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  parentId: string;
  teacherId?: string;
  gender: 'Male' | 'Female';
  dob: string;
}

export interface FeeStructure {
  id: string;
  grade: string;
  term: 1 | 2 | 3;
  amount: number;
  description: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  method: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CASH' | 'BANK';
  status: 'PAID' | 'PARTIAL' | 'OVERDUE';
  date: string;
  receiptNumber: string;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  subject: string;
  term: number;
  testScore: number;
  examScore: number;
  total: number;
  grade: string;
  teacherId: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  subject: string;
  teacherId: string;
  grade: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  recordedBy: string;
}

export interface SchoolSettings {
  name: string;
  logo: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  currentTerm: 1 | 2 | 3;
  paymentAccounts: PaymentAccount[];
}
