
import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { DAYS, SUBJECTS, ZAMBIAN_GRADES } from '../../constants';
import { TimetableSlot } from '../../types';

const TimetableBuilder: React.FC = () => {
  const [slots, setSlots] = useState<TimetableSlot[]>(firebaseService.getTimetable());
  const [selectedGrade, setSelectedGrade] = useState(ZAMBIAN_GRADES[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newSlot, setNewSlot] = useState({
    day: DAYS[0] as any,
    time: '08:00',
    subject: SUBJECTS[0],
    teacherId: 'teacher-1',
    grade: ZAMBIAN_GRADES[0]
  });

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slot: TimetableSlot = {
        id: `slot-${Date.now()}`,
        ...newSlot,
        grade: selectedGrade
      };
      firebaseService.addTimetableSlot(slot);
      setSlots(firebaseService.getTimetable());
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Timetable Builder</h2>
          <p className="text-gray-500">Construct and manage class schedules</p>
        </div>
        <div className="flex gap-3">
           <select 
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-white font-medium"
           >
             {ZAMBIAN_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
           </select>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
           >
            Add Period
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-sm font-bold text-gray-700 uppercase">Time</th>
              {DAYS.map(day => (
                <th key={day} className="p-4 text-sm font-bold text-gray-700 uppercase border-l border-gray-100">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time} className="border-b border-gray-50 last:border-0 h-24">
                <td className="p-4 font-bold text-gray-500 bg-gray-50/50">{time}</td>
                {DAYS.map(day => {
                  const slot = slots.find(s => s.grade === selectedGrade && s.day === day && s.time === time);
                  return (
                    <td key={`${day}-${time}`} className="p-2 border-l border-gray-100 min-w-[120px]">
                      {slot ? (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded text-left shadow-sm">
                          <p className="text-xs font-bold text-blue-700 leading-tight">{slot.subject}</p>
                          <p className="text-[10px] text-blue-500 mt-1">Teacher: {slot.teacherId}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Empty</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <h3 className="text-xl font-bold mb-6">Schedule New Period ({selectedGrade})</h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                   <select 
                    className="w-full border rounded-lg p-2.5"
                    value={newSlot.day}
                    onChange={e => setNewSlot({...newSlot, day: e.target.value as any})}
                   >
                     {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                   <select 
                    className="w-full border rounded-lg p-2.5"
                    value={newSlot.time}
                    onChange={e => setNewSlot({...newSlot, time: e.target.value})}
                   >
                     {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                 <select 
                    className="w-full border rounded-lg p-2.5"
                    value={newSlot.subject}
                    onChange={e => setNewSlot({...newSlot, subject: e.target.value})}
                   >
                     {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
               <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Assign Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableBuilder;
