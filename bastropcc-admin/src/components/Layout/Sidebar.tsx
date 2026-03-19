import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Link as LinkIcon, 
  Vote, 
  Users 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/blog', icon: FileText, label: 'Blog Posts' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/links', icon: LinkIcon, label: 'Links' },
    { to: '/voter-info', icon: Vote, label: 'Voter Info' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/users', icon: Users, label: 'Users' });
  }

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-text min-h-screen flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-secondary-dark">
        <h1 className="text-xl font-serif font-bold tracking-wider">BastropCC Admin</h1>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-md transition-colors ${
                isActive ? 'bg-sidebar-active text-white font-medium' : 'hover:bg-secondary-dark text-gray-200'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
