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
    date: '',
    time: '',
    location: '',
    org: '',
    event_url: '',
    description: '',
    type: 'political',
    county: 'bastrop',
    status: 'active',
    is_featured: false
  });

  useEffect(() => {
    if (isNew) return;
    const fetchEvent = async () => {
      try {
        const res = await apiClient.get(`/events/${id}`) as any;
        if (res.success) {
          setFormData({
            title: res.data.title || '',
            date: res.data.date || '',
            time: res.data.time || '',
            location: res.data.location || '',
            org: res.data.org || '',
            event_url: res.data.event_url || '',
            description: res.data.description || '',
            type: res.data.type || 'political',
            county: res.data.county || 'bastrop',
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

    // Validate
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      setError('Title, Date, Time, and Location are required.');
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date *</label>
              <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time *</label>
              <input type="text" id="time" name="time" placeholder="e.g. 6:00 PM" required value={formData.time} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location *</label>
              <input type="text" id="location" name="location" required value={formData.location} onChange={handleChange} placeholder="Full address or venue name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="org" className="block text-sm font-medium text-gray-700">Hosting Organization</label>
              <input type="text" id="org" name="org" value={formData.org} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="event_url" className="block text-sm font-medium text-gray-700">Event URL / Link</label>
              <input type="url" id="event_url" name="event_url" value={formData.event_url} onChange={handleChange} placeholder="https://" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Additional Details</label>
              <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Category: Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2 bg-white">
                <option value="political">Political</option>
                <option value="community">Community</option>
              </select>
            </div>

            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700">Category: County / Org</label>
              <select id="county" name="county" value={formData.county} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2 bg-white">
                <option value="bastrop">Bastrop County</option>
                <option value="hays">Hays County</option>
                <option value="fayette">Fayette County</option>
                <option value="travis">Travis County</option>
                <option value="williamson">Williamson County</option>
                <option value="fredericksburg">Fredericksburg Tea Party</option>
                <option value="statewide">Statewide / RPT</option>
                <option value="burleson">Burleson County</option>
                <option value="cacrc">CACRC</option>
                <option value="wtp">We The People LT</option>
                <option value="gawtp">Grassroots America</option>
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
