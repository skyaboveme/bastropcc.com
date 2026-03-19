import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Link as LinkIcon, Users, Edit3, Vote } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    blogCount: 0,
    eventCount: 0,
    linkCount: 0,
    voterInfoCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogRes, eventRes, linkRes, voterInfoRes] = await Promise.all([
          apiClient.get('/blog') as any,
          apiClient.get('/events?upcoming=true') as any,
          apiClient.get('/links?is_active=true') as any,
          apiClient.get('/voter-info') as any
        ]);

        setStats({
          blogCount: blogRes.data?.length || 0,
          eventCount: eventRes.data?.length || 0,
          linkCount: linkRes.data?.length || 0,
          voterInfoCount: voterInfoRes.data?.length || 0
        });
      } catch (e) {
        console.error('Failed to fetch dashboard stats', e);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Blog Posts', value: stats.blogCount, icon: FileText, color: 'bg-blue-500' },
    { name: 'Upcoming Events', value: stats.eventCount, icon: Calendar, color: 'bg-primary' },
    { name: 'Active Links', value: stats.linkCount, icon: LinkIcon, color: 'bg-green-600' },
    { name: 'Voter Info Pages', value: stats.voterInfoCount, icon: Vote, color: 'bg-secondary' },
  ];

  const quickActions = [
    { name: 'New Blog Post', to: '/blog/new', icon: Edit3, color: 'text-blue-600 bg-blue-50' },
    { name: 'New Event', to: '/events/new', icon: Calendar, color: 'text-primary bg-red-50' },
    { name: 'New Link', to: '/links/new', icon: LinkIcon, color: 'text-green-600 bg-green-50' },
    { name: 'New Voter Page', to: '/voter-info/new', icon: Vote, color: 'text-secondary bg-indigo-50' },
  ];

  if (user?.role === 'admin') {
    quickActions.push({ name: 'Add User', to: '/users/new', icon: Users, color: 'text-orange-600 bg-orange-50' });
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between py-2">
        <h1 className="text-2xl font-serif font-bold text-secondary">Overview</h1>
        <p className="mt-2 text-sm text-gray-500 sm:mt-0">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold font-serif text-secondary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.to}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary transition-all group"
            >
              <div className={`shrink-0 rounded-lg p-2 ${action.color}`}>
                <action.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {action.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
