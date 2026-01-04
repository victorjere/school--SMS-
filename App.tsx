
import React, { useState, useEffect } from 'react';
import { User, UserRole, SchoolSettings } from './types';
import { firebaseService } from './services/firebaseService';
import Layout from './components/Layout';

// View Imports
import AdminDashboard from './views/Admin/AdminDashboard';
import StudentManagement from './views/Admin/StudentManagement';
import TeacherManagement from './views/Admin/TeacherManagement';
import FeeManagement from './views/Admin/FeeManagement';
import TimetableBuilder from './views/Admin/TimetableBuilder';
import CommunicationCenter from './views/Admin/CommunicationCenter';
import SchoolSettingsView from './views/Admin/SchoolSettingsView';
import UserApprovals from './views/Admin/UserApprovals';
import TeacherDashboard from './views/Teacher/TeacherDashboard';
import ParentDashboard from './views/Parent/ParentDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SchoolSettings>(firebaseService.getSettings());
  const [activeView, setActiveView] = useState('dashboard');
  
  // Auth Toggle
  const [isLoginView, setIsLoginView] = useState(true);

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.ADMIN);
  
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.TEACHER
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsProcessing(true);
    try {
      const loggedInUser = await firebaseService.login(loginEmail, loginPassword, loginRole);
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        setAuthError("No account found with this email.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegSuccess(null);
    setIsProcessing(true);
    try {
      await firebaseService.register({
        name: regData.name,
        email: regData.email,
        phoneNumber: regData.phone,
        password: regData.password,
        role: regData.role,
        schoolId: 'school-1'
      });
      
      if (regData.role === UserRole.ADMIN) {
        setRegSuccess("Admin account created! You can now log in with your password.");
        setIsLoginView(true);
        setLoginRole(UserRole.ADMIN);
      } else {
        setRegSuccess("Request submitted! Your school admin must verify your name before access is granted.");
        setIsLoginView(true);
        setLoginRole(regData.role);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setActiveView('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 right-20 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-md w-full z-10">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
                  <i className="fas fa-school text-blue-600 text-3xl"></i>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">SchoolUp</h1>
                <p className="text-slate-500 font-medium">Zambian Education Portal</p>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-600 font-bold">
                  <i className="fas fa-exclamation-circle"></i> {authError}
                </div>
              )}
              
              {regSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-600 font-bold">
                  <i className="fas fa-check-circle"></i> {regSuccess}
                </div>
              )}

              {isLoginView ? (
                <div className="space-y-6">
                  {/* Role Switcher */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {[UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT].map((role) => (
                      <button
                        key={role}
                        onClick={() => setLoginRole(role)}
                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          loginRole === role 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {loginRole} Email
                      </label>
                      <input
                        type="email" required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={`e.g. ${loginRole.toLowerCase()}@schoolup.zm`}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"} required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit" disabled={isProcessing}
                      className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98] ${
                        loginRole === UserRole.ADMIN ? 'bg-slate-900 hover:bg-slate-800' :
                        loginRole === UserRole.TEACHER ? 'bg-indigo-600 hover:bg-indigo-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : `Log In as ${loginRole}`}
                    </button>
                    <p className="text-center text-xs text-slate-500">
                      Don't have an account? <button type="button" onClick={() => setIsLoginView(false)} className="text-blue-600 font-bold hover:underline">Register Here</button>
                    </p>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Role</label>
                       <select 
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                         value={regData.role}
                         onChange={e => setRegData({...regData, role: e.target.value as UserRole})}
                       >
                         <option value={UserRole.TEACHER}>Teacher</option>
                         <option value={UserRole.PARENT}>Parent</option>
                         <option value={UserRole.ADMIN}>Admin (Max 2)</option>
                       </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name (As per school records)</label>
                      <input
                        type="text" required
                        value={regData.name}
                        onChange={(e) => setRegData({...regData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <input
                        type="email" required
                        value={regData.email}
                        onChange={(e) => setRegData({...regData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                      <input
                        type="tel" required
                        value={regData.phone}
                        onChange={(e) => setRegData({...regData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"} required
                          value={regData.password}
                          onChange={(e) => setRegData({...regData, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit" disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                  >
                    {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : "Request Account"}
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    Already have an account? <button type="button" onClick={() => setIsLoginView(true)} className="text-blue-600 font-bold hover:underline">Log In</button>
                  </p>
                </form>
              )}
            </div>
          </div>
          
          {/* Quick Help / Demo */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Approved Names for Verification Demo</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Mary Mulenga</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Kelvin Banda</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">John Phiri</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (user.role === UserRole.ADMIN) {
      switch (activeView) {
        case 'dashboard': return <AdminDashboard />;
        case 'students': return <StudentManagement />;
        case 'teachers': return <TeacherManagement />;
        case 'fees': return <FeeManagement />;
        case 'timetable': return <TimetableBuilder />;
        case 'communications': return <CommunicationCenter />;
        case 'settings': return <SchoolSettingsView settings={settings} onUpdate={setSettings} />;
        case 'approvals': return <UserApprovals />;
        default: return <AdminDashboard />;
      }
    }
    if (user.role === UserRole.TEACHER) {
      return <TeacherDashboard user={user} />;
    }
    if (user.role === UserRole.PARENT) {
      return <ParentDashboard user={user} />;
    }
    return <div>Role View Not Implemented</div>;
  };

  return (
    <Layout 
      user={user} 
      settings={settings} 
      onLogout={handleLogout} 
      activeView={activeView} 
      setActiveView={setActiveView}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
