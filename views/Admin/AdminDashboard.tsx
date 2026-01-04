
import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { CURRENCY, ZAMBIAN_GRADES } from '../../constants';
import { UserRole, Student, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState(firebaseService.getStudents());
  const [payments, setPayments] = useState(firebaseService.getPayments());
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    grade: ZAMBIAN_GRADES[0],
    gender: 'Male' as 'Male' | 'Female',
    dob: '',
    parentId: ''
  });

  const parents = firebaseService.getUsersByRole(UserRole.PARENT);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Total Students', value: students.length, icon: 'fa-user-graduate', color: 'bg-blue-500' },
    { label: 'Staff', value: 4, icon: 'fa-chalkboard-teacher', color: 'bg-indigo-500' },
    { label: 'Revenue', value: `${CURRENCY} ${totalRevenue.toLocaleString()}`, icon: 'fa-money-bill-wave', color: 'bg-emerald-500' },
    { label: 'Due', value: `${CURRENCY} 12,400`, icon: 'fa-clock', color: 'bg-rose-500' },
  ];

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.parentId) return alert("Link a parent first.");

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      ...enrollForm
    };

    firebaseService.addStudent(newStudent);
    setStudents(firebaseService.getStudents());
    setIsEnrollModalOpen(false);
    setEnrollForm({ name: '', grade: ZAMBIAN_GRADES[0], gender: 'Male', dob: '', parentId: '' });
  };

  const chartData = [
    { name: 'G1-4', revenue: 45000 },
    { name: 'G5-7', revenue: 62000 },
    { name: 'G8-9', revenue: 38000 },
    { name: 'G10-12', revenue: 85000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h2>
          <p className="text-slate-500 text-sm font-medium">Daily school activity & metrics</p>
        </div>
        <button 
          onClick={() => setIsEnrollModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
        >
          <i className="fas fa-plus-circle"></i> Enroll Student
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className={`${stat.color} text-white w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg mb-4`}>
              <i className={`fas ${stat.icon} text-lg md:text-xl`}></i>
            </div>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-lg md:text-2xl font-black text-slate-900 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Revenue Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#6366f1', '#f43f5e'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Latest Receipts</h3>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {payments.slice().reverse().map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-blue-600"><i className="fas fa-receipt"></i></div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{payment.receiptNumber}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{payment.method.replace('_', ' ')}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-emerald-600">{CURRENCY} {payment.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-6 md:p-8 text-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl md:text-2xl font-black tracking-tight">Enroll Student</h3>
                <button onClick={() => setIsEnrollModalOpen(false)} className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full transition flex items-center justify-center">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEnrollStudent} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</h4>
                <div>
                  <input 
                    type="text" required placeholder="Full Name"
                    className="w-full border-slate-200 border-2 rounded-2xl p-4 focus:border-blue-500 outline-none transition font-bold text-slate-900"
                    value={enrollForm.name}
                    onChange={e => setEnrollForm({...enrollForm, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold text-slate-900 outline-none"
                    value={enrollForm.grade}
                    onChange={e => setEnrollForm({...enrollForm, grade: e.target.value})}
                  >
                    {ZAMBIAN_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <select 
                    className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold text-slate-900 outline-none"
                    value={enrollForm.gender}
                    onChange={e => setEnrollForm({...enrollForm, gender: e.target.value as any})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <input 
                  type="date" required 
                  className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold text-slate-900 outline-none"
                  value={enrollForm.dob}
                  onChange={e => setEnrollForm({...enrollForm, dob: e.target.value})}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Parent Linkage</h4>
                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
                  <select 
                    required
                    className="w-full bg-white border-2 border-blue-200 rounded-2xl p-4 font-black text-slate-900 outline-none focus:border-blue-500"
                    value={enrollForm.parentId}
                    onChange={e => setEnrollForm({...enrollForm, parentId: e.target.value})}
                  >
                    <option value="">Select Primary Parent Account</option>
                    {parents.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.phoneNumber}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-blue-600 font-bold mt-3 flex items-center gap-2">
                    <i className="fas fa-info-circle"></i>
                    Parent will gain instant visibility of this record.
                  </p>
                </div>
              </div>
            </form>

            <div className="p-6 md:p-8 bg-slate-50 border-t flex gap-4 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="flex-1 py-4 text-slate-500 font-black text-sm hover:bg-slate-100 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEnrollStudent}
                  className="flex-1 py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/30"
                >
                  Verify & Enroll Student
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
