
import { MOCK_USERS, MOCK_STUDENTS, MOCK_FEES, INITIAL_SCHOOL_SETTINGS } from './mockData';
import { User, Student, Payment, AcademicRecord, TimetableSlot, AttendanceRecord, UserRole, RegistrationRequest, Message } from '../types';

// Simulated database state
let users = [...MOCK_USERS];
let pendingUsers: RegistrationRequest[] = [];
let students = [...MOCK_STUDENTS];
let fees = [...MOCK_FEES];
let payments: Payment[] = [
  { id: 'pay-1', studentId: 'std-1', amount: 1000, method: 'MTN_MOMO', status: 'PARTIAL', date: '2024-01-15', receiptNumber: 'RCP-001' }
];
let academicRecords: AcademicRecord[] = [];
let timetableSlots: TimetableSlot[] = [];
let attendance: AttendanceRecord[] = [];
let messages: Message[] = [
  { id: 'msg-1', senderId: 'teacher-1', senderName: 'Mrs. Mary Mulenga', receiverId: 'parent-1', content: 'Hello Mr. Banda, Chipo has been doing exceptionally well in Science this week.', timestamp: '2024-03-20T10:00:00Z', isRead: true }
];
let settings = { ...INITIAL_SCHOOL_SETTINGS };

let portalNotifications: any[] = [
  { id: 'notif-1', group: 'All Parents', message: 'Welcome to Term 1! Please ensure all fees are settled by week 4.', date: '2024-01-05', isNew: true },
];

export const firebaseService = {
  // Auth & Registration
  login: async (email: string, password?: string, role?: UserRole): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      if (user.password !== password) throw new Error("Invalid password.");
      if (role && user.role !== role) throw new Error(`Unauthorized: Not a ${role.toLowerCase()}.`);
      if (!user.isApproved) throw new Error("Your account is pending admin approval.");
      return user;
    }
    return null;
  },

  register: async (data: any): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (data.role === UserRole.ADMIN) {
      users.push({ ...data, id: `admin-${Date.now()}`, isApproved: true });
      return;
    }
    pendingUsers.push({ ...data, id: `req-${Date.now()}`, isApproved: false, requestDate: new Date().toISOString().split('T')[0] });
  },

  getPendingUsers: () => [...pendingUsers],

  approveUser: async (requestId: string): Promise<User> => {
    const requestIndex = pendingUsers.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");
    const approvedUser: User = { ...pendingUsers[requestIndex], isApproved: true };
    users.push(approvedUser);
    pendingUsers.splice(requestIndex, 1);
    return approvedUser;
  },

  rejectUser: async (requestId: string): Promise<void> => {
    pendingUsers = pendingUsers.filter(r => r.id !== requestId);
  },

  /**
   * ZAMBIAN MOBILE MONEY API SIMULATION
   * In a production environment, this would call the MTN MoMo API or Airtel Money API
   * using an aggregator like Kazang, Sparco, or Flutterwave.
   */
  initiateMoMoTransaction: async (params: { 
    studentId: string, 
    amount: number, 
    phoneNumber: string, 
    network: 'MTN' | 'AIRTEL',
    merchantId: string 
  }) => {
    // 1. Log initiation (simulating backend POST /v1/momo/collect)
    console.log(`[MoMo Gateway] Initiating ${params.network} collection for ${params.phoneNumber}`);
    
    // 2. Artificial latency for network handshake
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Simulate USSD Push Trigger
    return {
      transactionId: `TXN-${Date.now()}`,
      status: 'PENDING_USER_INPUT',
      externalReference: Math.random().toString(36).substring(7).toUpperCase()
    };
  },

  verifyTransactionStatus: async (transactionId: string) => {
    // Simulate polling for transaction status (Simulating GET /v1/momo/status/{id})
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real app, this returns success once the user enters their PIN
    return { status: 'SUCCESS', verifiedAt: new Date().toISOString() };
  },

  processAirtelPayment: async (parent: User, studentId: string, amount: number, airtelNumber: string) => {
    // This wrapper handles the full flow for the UI
    const init = await firebaseService.initiateMoMoTransaction({
      studentId,
      amount,
      phoneNumber: airtelNumber,
      network: 'AIRTEL',
      merchantId: settings.paymentAccounts.find(a => a.provider === 'Airtel Money')?.accountNumber || 'DEMO'
    });

    const verify = await firebaseService.verifyTransactionStatus(init.transactionId);

    if (verify.status === 'SUCCESS') {
      const receiptNumber = `AIR-${Math.floor(Math.random() * 900000) + 100000}`;
      const newPayment: Payment = {
        id: init.transactionId,
        studentId,
        amount,
        method: 'AIRTEL_MONEY',
        status: 'PAID',
        date: new Date().toISOString().split('T')[0],
        receiptNumber
      };
      payments.push(newPayment);

      const receiptMsg: Message = {
        id: `msg-${Date.now()}`,
        senderId: 'admin-1',
        senderName: 'School Accounts Office',
        receiverId: parent.id,
        content: `CONFIRMED: We have received ${amount} ZMW for student ID: ${studentId} via Airtel Money. Your Receipt Number is ${receiptNumber}. Your balance has been updated.`,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      messages.push(receiptMsg);

      return newPayment;
    }
    throw new Error("Payment verification failed.");
  },

  getMessages: (userId: string) => {
    return messages
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  sendMessage: async (sender: User, receiverId: string, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    messages.push(newMessage);
    return newMessage;
  },

  getUsersByRole: (role: UserRole) => users.filter(u => u.role === role),
  getTeachers: () => users.filter(u => u.role === UserRole.TEACHER),
  addTeacher: (teacher: User) => { users.push(teacher); return teacher; },
  getStudents: () => [...students],
  
  addStudent: (student: Student) => { 
    students.push(student); 
    const parent = users.find(u => u.id === student.parentId);
    if (parent) {
      portalNotifications.push({
        id: `link-notif-${Date.now()}`,
        group: `Parent:${parent.id}`,
        message: `INSTANT LINK: ${student.name} has been enrolled and linked to your account. You can now view their grades, attendance, and pay fees.`,
        date: new Date().toISOString().split('T')[0],
        isNew: true
      });
    }
    return student; 
  },

  getSettings: () => settings,
  updateSettings: (newSettings: any) => { settings = { ...settings, ...newSettings }; return settings; },
  getFees: () => [...fees],
  getPayments: (studentId?: string) => studentId ? payments.filter(p => p.studentId === studentId) : [...payments],
  addPayment: (payment: Payment) => { payments.push(payment); return payment; },
  getAcademicRecords: (studentId?: string) => studentId ? academicRecords.filter(r => r.studentId === studentId) : [...academicRecords],
  getTimetable: () => [...timetableSlots],
  addTimetableSlot: (slot: TimetableSlot) => {
    timetableSlots.push(slot);
    return slot;
  },
  getAttendance: (studentId?: string) => studentId ? attendance.filter(a => a.studentId === studentId) : [...attendance],
  markAttendance: (records: AttendanceRecord[]) => { attendance.push(...records); return records; },
  
  getPortalNotifications: (user?: User) => {
    if (!user) return portalNotifications;
    return portalNotifications.filter(n => {
      if (n.group === 'All Parents' && user.role === UserRole.PARENT) return true;
      if (n.group === `Parent:${user.id}`) return true;
      if (n.group === 'All' || n.group === 'All Staff' && user.role !== UserRole.PARENT) return true;
      return n.group === 'All';
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  sendBulkCommunication: async (group: string, message: string, channels: ('SMS' | 'PORTAL')[]) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const newLog = { id: `log-${Date.now()}`, group, message, date: timestamp, status: 'SENT', channels };
    if (channels.includes('PORTAL')) {
       portalNotifications.push({ id: `notif-${Date.now()}`, group, message, date: timestamp, isNew: true });
    }
    return newLog;
  },
  getCommLogs: () => []
};
