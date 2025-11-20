import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  MessageSquare, 
  Bell, 
  Search,
  Menu,
  X
} from 'lucide-react';
import AIChat from './AIChat';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:flex-col
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">O</div>
            <span className="ml-3 font-semibold text-white">OrchestrIA</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" active={location.pathname === '/'} />
          <NavItem to="/schedule" icon={<CalendarIcon />} label="Schedule" active={location.pathname === '/schedule'} />
          <NavItem to="/tasks" icon={<CheckSquare />} label="Tasks" active={location.pathname === '/tasks'} />
          <NavItem to="/communications" icon={<MessageSquare />} label="Communications" active={location.pathname === '/communications'} />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center w-full p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  JD
              </div>
              <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white">Jane Doe</p>
                  <p className="text-xs text-slate-500 truncate">jane@example.com</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center md:hidden">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <Menu className="w-6 h-6" />
             </button>
          </div>
          
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Ask OrchestrIA to find a document or task..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="hidden md:flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask Co-Pilot
            </button>
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-500 hover:text-slate-700 cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
        </div>
      </main>

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => (
  <Link to={to} className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
    active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <div className="flex-shrink-0 w-5 h-5">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}` })}
    </div>
    <span className="ml-3 font-medium text-sm">{label}</span>
  </Link>
);

export default Layout;