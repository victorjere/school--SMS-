
import React, { useState, useEffect } from 'react';
import { User, UserRole, SchoolSettings } from '../types';
import { firebaseService } from '../services/firebaseService';

interface LayoutProps {
  user: User;
  settings: SchoolSettings;
  onLogout: () => void;
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

const Layout: React.FC<LayoutProps> = ({ user, settings, onLogout, children, activeView, setActiveView }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user.role === UserRole.ADMIN) {
      setPendingCount(firebaseService.getPendingUsers().length);
    }
  }, [activeView, user.role]);

  const navLinks: NavItem[] = ((): NavItem[] => {
    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
          { id: 'approvals', label: 'Verify Users', icon: 'fa-user-check', badge: pendingCount },
          { id: 'students', label: 'Students', icon: 'fa-user-graduate' },
          { id: 'teachers', label: 'Staff Directory', icon: 'fa-chalkboard-teacher' },
          { id: 'fees', label: 'Fees & Finance', icon: 'fa-money-bill-wave' },
          { id: 'timetable', label: 'Timetable', icon: 'fa-calendar-alt' },
          { id: 'communications', label: 'Communications', icon: 'fa-bullhorn' },
          { id: 'settings', label: 'School Settings', icon: 'fa-cog' },
        ];
      case UserRole.TEACHER:
        return [
          { id: 'dashboard', label: 'Teacher Portal', icon: 'fa-chalkboard-teacher' },
          { id: 'attendance', label: 'Attendance', icon: 'fa-clipboard-check' },
          { id: 'grading', label: 'Enter Grades', icon: 'fa-pen-nib' },
        ];
      case UserRole.PARENT:
        return [
          { id: 'dashboard', label: 'Children Overview', icon: 'fa-child' },
          { id: 'payments', label: 'Fee Payments', icon: 'fa-wallet' },
          { id: 'results', label: 'Academic Results', icon: 'fa-file-invoice' },
        ];
      default: return [];
    }
  })();

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={settings.logo} className="w-10 h-10 rounded-lg object-cover" alt="Logo" />
            <div>
              <h1 className="font-bold text-lg leading-tight">SchoolUp</h1>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Zambia</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeView === link.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fas ${link.icon} w-5 text-center`}></i>
                <span className="font-bold text-sm">{link.label}</span>
              </div>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{settings.name}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Term {settings.currentTerm} Academic Year</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.role}</p>
             </div>
             <div className="h-10 w-10 bg-slate-100 text-slate-600 flex items-center justify-center rounded-2xl font-black border-2 border-white shadow-sm ring-1 ring-gray-100">
               {user.name.charAt(0)}
             </div>
          </div>
        </header>

        {/* Dynamic Content Area (Internal Scrolling) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-gray-50/50 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Layout;
