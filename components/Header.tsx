
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  currentView: string;
  onNavigate: (view: any) => void;
}

const Header: React.FC<Props> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  const navLinkClass = (viewName: string) => `
    px-4 py-2 rounded-lg text-sm font-medium transition-colors 
    ${currentView === viewName 
      ? 'bg-brand-50 text-brand-700' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
  `;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('NEW')}>
            <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">SM</div>
            <span className="font-bold text-xl text-slate-800 tracking-tight hidden md:block">SOW Muncher</span>
          </div>
          <nav className="flex gap-1">
            <button onClick={() => onNavigate('NEW')} className={navLinkClass('NEW')}>New Analysis</button>
            <button onClick={() => onNavigate('REPO')} className={navLinkClass('REPO')}>Repository</button>
            <button onClick={() => onNavigate('BUILDER')} className={navLinkClass('BUILDER')}>SOW Builder</button>
            {user?.role === 'ADMIN' && <button onClick={() => onNavigate('ADMIN')} className={navLinkClass('ADMIN')}>Admin</button>}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2 hidden sm:flex"><span className="text-sm font-semibold">{user?.name}</span><span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{user?.role}</span></div>
          <img src={user?.avatarUrl} alt={user?.name} className="h-9 w-9 rounded-full border shadow-sm" />
          <button onClick={logout} className="text-slate-400 hover:text-slate-600" title="Sign Out"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
        </div>
      </div>
    </header>
  );
};

export default Header;
