import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Save, ArrowLeft } from 'lucide-react';

export default function LinkEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general',
    is_active: true,
    opens_new_tab: true,
    sort_order: 0
  });

  useEffect(() => {
    if (isNew) return;
    const fetchLink = async () => {
      try {
        const res = await apiClient.get('/links') as any;
        if (res.success) {
          const link = res.data.find((l: any) => l.id === id);
          if (link) {
            setFormData({
              title: link.title || '',
              url: link.url || '',
              description: link.description || '',
              category: link.category || 'general',
              is_active: !!link.is_active,
              opens_new_tab: !!link.opens_new_tab,
              sort_order: link.sort_order || 0
            });
          } else {
            setError('Link not found');
          }
        }
      } catch (e: any) {
        setError(e?.error || 'Failed to load link');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLink();
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

    try {
      if (isNew) {
        await apiClient.post('/links', formData);
      } else {
        await apiClient.put(`/links/${id}`, formData);
      }
      navigate('/links');
    } catch (e: any) {
      setError(e?.error || 'Failed to save link');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading editor...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/links')} className="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Links
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Link Title *</label>
            <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Destination URL *</label>
            <input type="url" id="url" name="url" required value={formData.url} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Official, Resource, Affiliate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active (Visible to public)
              </label>
            </div>
            <div className="flex items-center">
              <input id="opens_new_tab" name="opens_new_tab" type="checkbox" checked={formData.opens_new_tab} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="opens_new_tab" className="ml-2 block text-sm text-gray-900">
                Open in new tab target="_blank"
              </label>
            </div>
          </div>

          <div className="pt-5 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
