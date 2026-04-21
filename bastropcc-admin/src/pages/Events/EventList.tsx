import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { apiClient } from '../../api/client';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

export default function EventList() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/events') as any;
      if (res.success) setEvents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (e: any) {
      alert(e?.error || 'Failed to delete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'past': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-secondary">Events</h1>
          <p className="mt-2 text-sm text-gray-700">Manage upcoming meetings, rallies, and community events.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/events/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Link>
        </div>
      </div>

      <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Event</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6 max-w-sm">
                    <div className="font-medium text-gray-900 truncate">{event.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 capitalize">{event.type} • {event.county} {event.is_featured ? '• Featured' : ''}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                    {event.date} at {event.time}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                    {event.location ? (
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 shrink-0 text-gray-400" /> <span className="truncate">{event.location}</span></span>
                    ) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex justify-end space-x-3">
                    <Link to={`/events/${event.id}`} className="text-secondary hover:text-primary transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(event.id, event.title)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
