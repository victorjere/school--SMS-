
import { UserRole, User, Student, FeeStructure, SchoolSettings } from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  name: "Lusaka Excellence Private School",
  logo: "https://picsum.photos/200/200?random=1",
  address: "Plot 123 Independence Ave, Lusaka",
  contactEmail: "info@lusakaexcellence.edu.zm",
  contactPhone: "+260 977 123456",
  currentTerm: 1,
  paymentAccounts: [
    { id: 'acc-1', provider: 'MTN MoMo', accountName: 'Lusaka Excellence Ltd', accountNumber: '556677', type: 'MOBILE_MONEY' },
    { id: 'acc-2', provider: 'Airtel Money', accountName: 'Lusaka Excellence Ltd', accountNumber: '112233', type: 'MOBILE_MONEY' },
    { id: 'acc-3', provider: 'ZANACO', accountName: 'Lusaka Excellence Primary', accountNumber: '1234567890123', type: 'BANK' }
  ]
};

export const MOCK_USERS: User[] = [
  { id: 'admin-1', email: 'admin@schoolup.zm', name: 'Dr. Mwamba Chiluba', role: UserRole.ADMIN, phoneNumber: '+260971000001', schoolId: 'school-1', isApproved: true, password: 'password123' },
  { id: 'teacher-1', email: 'mulenga@schoolup.zm', name: 'Mrs. Mary Mulenga', role: UserRole.TEACHER, phoneNumber: '+260971000002', schoolId: 'school-1', isApproved: true, password: 'password123' },
  { id: 'parent-1', email: 'banda@schoolup.zm', name: 'Mr. Kelvin Banda', role: UserRole.PARENT, phoneNumber: '+260971000003', schoolId: 'school-1', isApproved: true, password: 'password123' }
];

export const MOCK_STUDENTS: Student[] = [
  { id: 'std-1', name: 'Chipo Banda', grade: 'Grade 7', parentId: 'parent-1', gender: 'Female', dob: '2012-05-14', teacherId: 'teacher-1' },
  { id: 'std-2', name: 'Tiza Banda', grade: 'Grade 4', parentId: 'parent-1', gender: 'Male', dob: '2015-11-20', teacherId: 'teacher-1' }
];

export const MOCK_FEES: FeeStructure[] = [
  { id: 'fee-1', grade: 'Grade 7', term: 1, amount: 2500, description: 'Tuition + Lab Fees' },
  { id: 'fee-2', grade: 'Grade 4', term: 1, amount: 1800, description: 'Tuition Fees' }
];
