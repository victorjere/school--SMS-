
import React, { useState, useEffect, useRef } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { User, Student, UserRole, Message } from '../../types';
import { SUBJECTS } from '../../constants';

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [students] = useState<Student[]>(firebaseService.getStudents());
  const [activeTab, setActiveTab] = useState<'attendance' | 'grading' | 'messages'>('attendance');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [notifications] = useState(firebaseService.getPortalNotifications(user));
  
  const [activeChatParent, setActiveChatParent] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const parents = firebaseService.getUsersByRole(UserRole.PARENT);

  useEffect(() => {
    if (activeTab === 'messages') {
      setChatMessages(firebaseService.getMessages(user.id));
    }
  }, [activeTab, user.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatParent || !newMessage.trim()) return;
    await firebaseService.sendMessage(user, activeChatParent.id, newMessage);
    setChatMessages(firebaseService.getMessages(user.id));
    setNewMessage('');
  };

  const filteredMessages = activeChatParent 
    ? chatMessages.filter(m => m.senderId === activeChatParent.id || m.receiverId === activeChatParent.id)
    : [];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-shrink-0">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Welcome, {user.name.split(' ')[0]}</h2>
            <p className="text-xs text-slate-500 font-bold">Faculty Portal</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'attendance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              Attendance
            </button>
            <button 
              onClick={() => setActiveTab('grading')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'grading' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              Grades
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'messages' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              Chat
            </button>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-lg text-white flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Notices</p>
              <p className="text-sm font-bold truncate max-w-[200px] mt-1">{notifications[0]?.message || 'No new notices.'}</p>
           </div>
           <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"><i className="fas fa-bell"></i></div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
              <h3 className="font-black text-slate-900 text-sm">Class Register - {new Date().toLocaleDateString()}</h3>
              <button className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 active:scale-95 transition">SUBMIT</button>
            </div>
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map(std => (
                    <tr key={std.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm whitespace-nowrap">{std.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                           {['P', 'A', 'L'].map(st => (
                             <label key={st} className="cursor-pointer">
                               <input type="radio" name={`att-${std.id}`} className="hidden peer" defaultChecked={st==='P'} />
                               <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] border-2 transition-all ${
                                 st === 'P' ? 'peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-checked:text-white border-slate-100 text-slate-300' :
                                 st === 'A' ? 'peer-checked:bg-rose-500 peer-checked:border-rose-500 peer-checked:text-white border-slate-100 text-slate-300' :
                                 'peer-checked:bg-amber-500 peer-checked:border-amber-500 peer-checked:text-white border-slate-100 text-slate-300'
                               }`}>{st}</div>
                             </label>
                           ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'grading' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
             <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
               <div className="flex gap-2 w-full sm:w-auto">
                 <select 
                   className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                   value={selectedSubject}
                   onChange={e => setSelectedSubject(e.target.value)}
                 >
                   {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
               <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 active:scale-95 transition">SAVE ALL</button>
             </div>
             <div className="overflow-auto flex-1 custom-scrollbar">
               <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map(std => (
                    <tr key={std.id}>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm whitespace-nowrap">{std.name}</td>
                      <td className="px-6 py-4">
                        <input type="number" className="border-2 border-slate-100 rounded-xl w-20 p-2 text-center font-black bg-slate-50 outline-none focus:border-blue-300 text-slate-900" placeholder="0" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className={`md:col-span-1 border-r border-gray-100 flex flex-col h-full ${activeChatParent ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-6 bg-slate-50 border-b border-gray-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">Parents Directory</div>
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                {parents.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setActiveChatParent(p)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition text-left ${activeChatParent?.id === p.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                  >
                    <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-blue-600 border border-slate-100">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate text-sm">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate">{p.phoneNumber}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`md:col-span-2 flex flex-col h-full ${!activeChatParent ? 'hidden md:flex' : 'flex'}`}>
              {activeChatParent ? (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white flex-shrink-0">
                    <button onClick={() => setActiveChatParent(null)} className="md:hidden text-slate-400 p-2"><i className="fas fa-chevron-left"></i></button>
                    <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                      {activeChatParent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{activeChatParent.name}</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Portal Connected</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
                    {filteredMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm ${
                          msg.senderId === user.id 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={`text-[9px] mt-2 font-bold ${msg.senderId === user.id ? 'text-blue-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef}></div>
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex-shrink-0">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium"
                        placeholder="Send updates..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                      />
                      <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white w-12 h-12 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center shadow-lg shadow-blue-600/30"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-200">
                    <i className="fas fa-comments text-3xl"></i>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black">Direct Parent Access</h4>
                    <p className="text-xs font-medium max-w-[200px] mx-auto">Select a parent from the directory to share progress or behavior updates.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
