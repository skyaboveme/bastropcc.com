import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-lg font-serif text-secondary lg:hidden">BCC Admin</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <User className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline-block">{user?.name} ({user?.role})</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <Link to="/settings" className="text-gray-500 hover:text-primary transition-colors flex items-center" title="Settings">
          <Settings className="w-5 h-5" />
        </Link>
        <button onClick={handleLogout} className="text-gray-500 hover:text-primary transition-colors flex items-center" title="Log out">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
