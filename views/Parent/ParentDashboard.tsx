
import React, { useState, useEffect, useRef } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { User, Student, Payment, UserRole, Message, PaymentAccount } from '../../types';
import { CURRENCY } from '../../constants';

interface ParentDashboardProps {
  user: User;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>(firebaseService.getStudents().filter(s => s.parentId === user.id));
  const [selectedChild, setSelectedChild] = useState<Student | null>(students[0] || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');
  const [notifications, setNotifications] = useState(firebaseService.getPortalNotifications(user));
  const schoolSettings = firebaseService.getSettings();

  // Payment State
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [payAmount, setPayAmount] = useState('');
  const [payPhone, setPayPhone] = useState(user.phoneNumber || '');
  const [selectedProvider, setSelectedProvider] = useState<'MTN MoMo' | 'Airtel Money'>('MTN MoMo');

  // Messaging state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [activeChatTeacher, setActiveChatTeacher] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const teachers = firebaseService.getTeachers();

  useEffect(() => {
    const refreshedStudents = firebaseService.getStudents().filter(s => s.parentId === user.id);
    setStudents(refreshedStudents);
    if (!selectedChild && refreshedStudents.length > 0) {
      setSelectedChild(refreshedStudents[0]);
    }
    setNotifications(firebaseService.getPortalNotifications(user));
  }, [activeTab, user]);

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
    if (!activeChatTeacher || !newMessage.trim()) return;
    await firebaseService.sendMessage(user, activeChatTeacher.id, newMessage);
    setChatMessages(firebaseService.getMessages(user.id));
    setNewMessage('');
  };

  const executeMoMoPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !payAmount || !payPhone) {
      alert("Please fill in all details.");
      return;
    }
    
    setPaymentStep('processing');
    try {
      // In this version, we use the integrated processAirtelPayment (refactored for generic MoMo logic)
      await firebaseService.processAirtelPayment(user, selectedChild.id, parseFloat(payAmount), payPhone);
      setPaymentStep('success');
      // Refresh local students data to show updated balance
      setStudents(firebaseService.getStudents().filter(s => s.parentId === user.id));
    } catch (err) {
      alert("Payment failed. Please try again.");
      setPaymentStep('details');
    }
  };

  const closePayment = () => {
    setIsMoMoModalOpen(false);
    setPaymentStep('details');
    setPayAmount('');
  };

  const schoolAccount = schoolSettings.paymentAccounts.find(acc => acc.provider === selectedProvider) 
    || schoolSettings.paymentAccounts.find(acc => acc.type === 'MOBILE_MONEY');

  const filteredMessages = activeChatTeacher 
    ? chatMessages.filter(m => m.senderId === activeChatTeacher.id || m.receiverId === activeChatTeacher.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 max-w-sm">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Messages
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {notifications.length > 0 && (
            <div className="space-y-3 mb-6">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-right duration-500 ${notif.message.includes('INSTANT LINK') ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                  <div className={`p-3 rounded-xl ${notif.message.includes('INSTANT LINK') ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                    <i className={`fas ${notif.message.includes('INSTANT LINK') ? 'fa-user-link' : 'fa-bullhorn'}`}></i>
                  </div>
                  <div className="flex-1 text-sm font-bold">{notif.message}</div>
                </div>
              ))}
            </div>
          )}

          {students.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {students.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex-shrink-0 px-6 py-4 rounded-xl border-2 transition-all flex items-center gap-3 relative overflow-hidden ${
                    selectedChild?.id === child.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${selectedChild?.id === child.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {child.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 leading-none">{child.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{child.grade}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
             <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">No children linked to this account.</div>
          )}

          {selectedChild && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Financial Overview</h3>
                  <div className="space-y-4">
                    <div className="pt-4 border-t border-gray-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                      <p className={`text-4xl font-black ${((selectedChild.grade === 'Grade 7' ? 2500 : 1800) - firebaseService.getPayments(selectedChild.id).reduce((sum, p) => sum + p.amount, 0)) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {CURRENCY} {((selectedChild.grade === 'Grade 7' ? 2500 : 1800) - firebaseService.getPayments(selectedChild.id).reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                      </p>
                    </div>
                    {((selectedChild.grade === 'Grade 7' ? 2500 : 1800) - firebaseService.getPayments(selectedChild.id).reduce((sum, p) => sum + p.amount, 0)) > 0 && (
                      <button 
                        onClick={() => setIsMoMoModalOpen(true)}
                        className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95"
                      >
                        <i className="fas fa-mobile-alt mr-2"></i> Pay with Mobile Money
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-full">MTN MOMO</span>
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-1.5 rounded-full">AIRTEL MONEY</span>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-full">ZANACO</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[300px] flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-4">
                       <i className="fas fa-file-invoice text-3xl"></i>
                    </div>
                    <p className="text-sm font-bold text-slate-400">Detailed academic reports and attendance logs will appear here once term results are uploaded by teachers.</p>
                 </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-900 text-white flex-shrink-0 flex items-center justify-between">
             <h3 className="font-black text-xs uppercase tracking-widest">Teacher Correspondence</h3>
             <span className="bg-blue-600 px-3 py-1 rounded-full text-[9px] font-black">ACTIVE</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
             <i className="fas fa-comments text-5xl text-slate-100 mb-4"></i>
             <p className="text-sm font-bold max-w-xs">Use this portal to communicate directly with your child's teachers regarding academic progress.</p>
          </div>
        </div>
      )}

      {/* ZAMBIAN MOBILE MONEY GATEWAY MODAL */}
      {isMoMoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[130] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            {paymentStep === 'details' && (
              <div className="flex flex-col h-full">
                <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Zambian MoMo Gateway</h3>
                  <p className="text-slate-500 text-sm mt-1">Direct Secure Payment to {schoolSettings.name}</p>
                </div>
                
                <form onSubmit={executeMoMoPayment} className="p-8 space-y-6">
                  {/* Official Merchant ID Section */}
                  <div className="bg-blue-50 p-5 rounded-[2rem] border-2 border-blue-100">
                     <div className="flex items-start gap-3">
                        <div className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                           <i className="fas fa-shield-alt"></i>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Verified Merchant</p>
                           <p className="font-black text-slate-900 text-lg leading-none mt-0.5">{schoolAccount?.accountName}</p>
                           <p className="text-xs font-bold text-blue-800 mt-2">Merchant ID: <span className="bg-blue-100 px-2 py-0.5 rounded font-black">{schoolAccount?.accountNumber}</span></p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setSelectedProvider('MTN MoMo')}
                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${selectedProvider === 'MTN MoMo' ? 'border-amber-400 bg-amber-50' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      >
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${selectedProvider === 'MTN MoMo' ? 'bg-amber-400' : 'bg-slate-200'}`}>
                            <i className="fas fa-mobile"></i>
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest">MTN MOMO</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSelectedProvider('Airtel Money')}
                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${selectedProvider === 'Airtel Money' ? 'border-rose-500 bg-rose-50' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      >
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${selectedProvider === 'Airtel Money' ? 'bg-rose-500' : 'bg-slate-200'}`}>
                            <i className="fas fa-mobile-alt"></i>
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest">AIRTEL MONEY</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sender Mobile Number</label>
                       <input 
                         type="tel" required
                         className="w-full border-2 border-slate-100 rounded-[1.5rem] p-4 font-black text-slate-900 outline-none focus:border-blue-500 text-lg"
                         value={payPhone}
                         onChange={e => setPayPhone(e.target.value)}
                         placeholder="097..."
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kwacha Amount ({CURRENCY})</label>
                       <input 
                         type="number" required
                         className="w-full border-2 border-slate-100 rounded-[1.5rem] p-4 font-black text-slate-900 text-3xl outline-none focus:border-blue-500"
                         value={payAmount}
                         onChange={e => setPayAmount(e.target.value)}
                         placeholder="0.00"
                       />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={closePayment} 
                      className="flex-1 py-4 text-slate-400 font-black text-sm hover:bg-slate-50 rounded-2xl transition active:scale-95"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit"
                      className={`flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 ${
                        selectedProvider === 'Airtel Money' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-amber-500 shadow-amber-500/30'
                      }`}
                    >
                      PAY {payAmount ? `${CURRENCY} ${payAmount}` : 'NOW'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="p-20 text-center space-y-8">
                 <div className="relative inline-block">
                    <div className="w-28 h-28 border-[10px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <i className="fas fa-mobile-screen text-3xl text-blue-600 animate-pulse"></i>
                    </div>
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-900">Confirm on Handset</h3>
                   <p className="text-slate-500 text-sm mt-4 leading-relaxed max-w-xs mx-auto">
                      A <span className="font-black text-slate-900">USSD Push</span> has been sent to your phone. Please enter your PIN to authorize this school fee payment.
                   </p>
                 </div>
                 <div className="pt-4">
                    <button 
                      onClick={() => setPaymentStep('details')}
                      className="text-[10px] font-black text-rose-500 uppercase tracking-widest"
                    >
                      Transaction Timed Out? Retry
                    </button>
                 </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="p-16 text-center">
                 <div className="w-28 h-28 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 scale-up-center shadow-lg shadow-emerald-100">
                    <i className="fas fa-check text-5xl"></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900">Payment Verified</h3>
                 <p className="text-slate-500 text-sm mt-4">Transaction confirmed. An official receipt has been sent to your portal messages.</p>
                 <div className="bg-slate-50 p-4 rounded-2xl mt-8 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase">System Reference</p>
                    <p className="font-black text-slate-700">{Math.random().toString(36).substring(7).toUpperCase()}</p>
                 </div>
                 <button onClick={closePayment} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm shadow-xl active:scale-95 transition">Return to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
