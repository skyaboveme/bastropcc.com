import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Save, ArrowLeft } from 'lucide-react';

export default function EventEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    location_url: '',
    event_url: '',
    category: 'general',
    status: 'active',
    is_featured: false
  });

  useEffect(() => {
    if (isNew) return;
    const fetchEvent = async () => {
      try {
        const res = await apiClient.get(`/events/${id}`) as any;
        if (res.success) {
          // Format ISO dates from API for the datetime-local input fields (YYYY-MM-DDThh:mm)
          const formatForInput = (isoStr: string) => isoStr ? isoStr.substring(0, 16) : '';
          
          setFormData({
            title: res.data.title || '',
            description: res.data.description || '',
            start_datetime: formatForInput(res.data.start_datetime),
            end_datetime: formatForInput(res.data.end_datetime),
            location: res.data.location || '',
            location_url: res.data.location_url || '',
            event_url: res.data.event_url || '',
            category: res.data.category || 'general',
            status: res.data.status || 'active',
            is_featured: !!res.data.is_featured
          });
        }
      } catch (e: any) {
        setError(e?.error || 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    // Convert local datetime to ISO for backend (D1 stores UTC, but we assume local inputs)
    // Actually the standard <input type="datetime-local"> creates a local string. 
    // Sending it as YYYY-MM-DDTHH:mm is fine, the worker will store it and the frontend parses it.
    
    // Validate
    if (!formData.start_datetime) {
      setError('Start date and time are required');
      setIsSaving(false);
      return;
    }
    
    try {
      if (isNew) {
        await apiClient.post('/events', formData);
      } else {
        await apiClient.put(`/events/${id}`, formData);
      }
      navigate('/events');
    } catch (e: any) {
      setError(e?.error || 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading editor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/events')} className="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title *</label>
              <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div>
              <label htmlFor="start_datetime" className="block text-sm font-medium text-gray-700">Start Date & Time *</label>
              <input type="datetime-local" id="start_datetime" name="start_datetime" required value={formData.start_datetime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div>
              <label htmlFor="end_datetime" className="block text-sm font-medium text-gray-700">End Date & Time</label>
              <input type="datetime-local" id="end_datetime" name="end_datetime" value={formData.end_datetime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
              <p className="mt-1 text-xs text-gray-500">Supports markdown formatting (asterisks for bold, etc). Will be rendered correctly on the front end.</p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location Name / Address</label>
              <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bastrop City Hall" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div>
              <label htmlFor="location_url" className="block text-sm font-medium text-gray-700">Location Map URL</label>
              <input type="url" id="location_url" name="location_url" value={formData.location_url} onChange={handleChange} placeholder="https://maps.google.com/..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="event_url" className="block text-sm font-medium text-gray-700">External Event URL (Tickets, RSVP, etc.)</label>
              <input type="url" id="event_url" name="event_url" value={formData.event_url} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2 bg-white">
                <option value="general">General</option>
                <option value="meeting">Meeting</option>
                <option value="election">Election</option>
                <option value="rally">Rally</option>
                <option value="forum">Forum</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="community">Community</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2 bg-white">
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-4">
              <div className="flex items-center">
                <input id="is_featured" name="is_featured" type="checkbox" checked={formData.is_featured} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                  Featured Event (Highlights on the public home page)
                </label>
              </div>
            </div>

          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
