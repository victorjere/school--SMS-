
import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { Student } from '../../types';
import { ZAMBIAN_GRADES } from '../../constants';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(firebaseService.getStudents());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    grade: ZAMBIAN_GRADES[0],
    gender: 'Male' as const,
    dob: '',
    parentId: 'parent-1'
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const student: Student = {
      id: `std-${Date.now()}`,
      ...newStudent
    };
    firebaseService.addStudent(student);
    setStudents(firebaseService.getStudents());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Directory</h2>
          <p className="text-gray-500">Manage digital records for all enrolled students</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Birth Date</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{student.grade}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${student.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {student.gender}
                   </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{student.dob}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i className="fas fa-edit"></i></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <h3 className="text-xl font-bold mb-6">Enroll New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full border rounded-lg p-2.5"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select 
                    className="w-full border rounded-lg p-2.5"
                    value={newStudent.grade}
                    onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
                  >
                    {ZAMBIAN_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select 
                    className="w-full border rounded-lg p-2.5"
                    value={newStudent.gender}
                    onChange={e => setNewStudent({...newStudent, gender: e.target.value as 'Male' | 'Female'})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input 
                  type="date" required 
                  className="w-full border rounded-lg p-2.5"
                  value={newStudent.dob}
                  onChange={e => setNewStudent({...newStudent, dob: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
