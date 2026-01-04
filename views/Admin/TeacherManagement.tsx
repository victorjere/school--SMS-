
import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { User, UserRole } from '../../types';
import { ZAMBIAN_GRADES, SUBJECTS } from '../../constants';

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>(firebaseService.getTeachers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    assignmentType: 'PRIMARY' as 'PRIMARY' | 'SECONDARY',
    assignedGrade: ZAMBIAN_GRADES[0],
    assignedSubjects: [] as string[]
  });

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTeacher: User = {
      id: `teacher-${Date.now()}`,
      name: enrollForm.name,
      email: enrollForm.email,
      phoneNumber: enrollForm.phoneNumber,
      role: UserRole.TEACHER,
      schoolId: 'school-1',
      isApproved: true, // Manually added teachers are pre-approved
      assignmentType: enrollForm.assignmentType,
      assignedGrade: enrollForm.assignmentType === 'PRIMARY' ? enrollForm.assignedGrade : undefined,
      assignedSubjects: enrollForm.assignmentType === 'SECONDARY' ? enrollForm.assignedSubjects : undefined
    };

    firebaseService.addTeacher(newTeacher);
    setTeachers(firebaseService.getTeachers());
    setIsModalOpen(false);
    setEnrollForm({
      name: '', email: '', phoneNumber: '', 
      assignmentType: 'PRIMARY', 
      assignedGrade: ZAMBIAN_GRADES[0], 
      assignedSubjects: []
    });
    alert(`Teacher ${newTeacher.name} successfully enrolled.`);
  };

  const toggleSubject = (subject: string) => {
    setEnrollForm(prev => ({
      ...prev,
      assignedSubjects: prev.assignedSubjects.includes(subject)
        ? prev.assignedSubjects.filter(s => s !== subject)
        : [...prev.assignedSubjects, subject]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Directory</h2>
          <p className="text-gray-500 text-sm">Manage teaching staff and academic allocations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Enroll Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Allocation</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map(teacher => (
              <tr key={teacher.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{teacher.name}</p>
                      <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${teacher.assignmentType === 'PRIMARY' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                        {teacher.assignmentType || 'Staff'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                  <p className="text-xs text-gray-400">{teacher.phoneNumber}</p>
                </td>
                <td className="px-6 py-4">
                  {teacher.assignmentType === 'PRIMARY' ? (
                    <span className="text-sm font-medium text-gray-700">Class Teacher: {teacher.assignedGrade}</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {teacher.assignedSubjects?.map(s => (
                        <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                      )) || <span className="text-xs text-gray-400 italic">None assigned</span>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-blue-600 p-2 transition"><i className="fas fa-edit"></i></button>
                  <button className="text-gray-400 hover:text-red-600 p-2 transition"><i className="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Enroll New Staff Member</h3>
                <p className="text-slate-400 text-xs mt-1">Add a new teacher to the system and allocate their workload.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleEnroll} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Mrs. Chilufya Mwale"
                    value={enrollForm.name}
                    onChange={e => setEnrollForm({...enrollForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" required
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="teacher@schoolup.zm"
                    value={enrollForm.email}
                    onChange={e => setEnrollForm({...enrollForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" required
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+260..."
                    value={enrollForm.phoneNumber}
                    onChange={e => setEnrollForm({...enrollForm, phoneNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">School Level / Assignment</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setEnrollForm({...enrollForm, assignmentType: 'PRIMARY'})}
                      className={`py-3 rounded-xl border-2 font-bold transition ${enrollForm.assignmentType === 'PRIMARY' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-100 text-gray-400'}`}
                    >
                      Primary
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEnrollForm({...enrollForm, assignmentType: 'SECONDARY'})}
                      className={`py-3 rounded-xl border-2 font-bold transition ${enrollForm.assignmentType === 'SECONDARY' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-400'}`}
                    >
                      Secondary
                    </button>
                  </div>
                </div>

                {enrollForm.assignmentType === 'PRIMARY' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned Grade</label>
                    <select 
                      className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                      value={enrollForm.assignedGrade}
                      onChange={e => setEnrollForm({...enrollForm, assignedGrade: e.target.value})}
                    >
                      {ZAMBIAN_GRADES.slice(0, 7).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Allocated Subjects</label>
                    <div className="h-40 overflow-y-auto border rounded-xl p-3 space-y-2 bg-gray-50">
                      {SUBJECTS.map(sub => (
                        <label key={sub} className="flex items-center gap-3 cursor-pointer hover:bg-white p-1 rounded transition">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded text-blue-600"
                            checked={enrollForm.assignedSubjects.includes(sub)}
                            onChange={() => toggleSubject(sub)}
                          />
                          <span className="text-sm font-medium text-gray-700">{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
                >
                  Complete Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;