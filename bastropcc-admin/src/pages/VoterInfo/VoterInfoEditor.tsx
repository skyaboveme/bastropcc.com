import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import RichTextEditor from '../../components/UI/RichTextEditor';
import { ArrowLeft, Save, CheckCircle, ExternalLink } from 'lucide-react';

export default function VoterInfoEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: 'general',
    status: 'draft',
    sort_order: 0,
    last_verified: '',
    external_source_url: ''
  });

  useEffect(() => {
    if (isNew) return;
    const fetchPage = async () => {
      try {
        const res = await apiClient.get(`/voter-info/${id}`) as any;
        if (res.success) {
          const rawDate = res.data.last_verified;
          setFormData({
            title: res.data.title || '',
            slug: res.data.slug || '',
            content: res.data.content || '',
            category: res.data.category || 'general',
            status: res.data.status || 'draft',
            sort_order: res.data.sort_order || 0,
            last_verified: rawDate ? rawDate.substring(0, 10) : '',
            external_source_url: res.data.external_source_url || ''
          });
        }
      } catch (e: any) {
        setError(e?.error || 'Failed to load page');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [id, isNew]);

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: isNew && !prev.slug ? generateSlug(title) : prev.slug
    }));
  };

  const handleSave = async (publish: boolean) => {
    setIsSaving(true);
    setError('');
    
    // We expect last_verified to be YYYY-MM-DD
    // SQLite can parse this format fine in most cases, but passing it as an ISO string is safer if that's what we need. 
    // Usually YYYY-MM-DD works for Date fields.
    const payload = { 
      ...formData, 
      status: publish ? 'published' : 'draft',
      last_verified: formData.last_verified ? new Date(formData.last_verified).toISOString() : null
    };
    
    try {
      if (isNew) {
        const res = await apiClient.post('/voter-info', payload) as any;
        navigate(`/voter-info/${res.data.id}`);
      } else {
        await apiClient.put(`/voter-info/${id}`, payload) as any;
        setFormData(prev => ({ ...prev, status: payload.status }));
      }
    } catch (e: any) {
      setError(e?.error || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading editor...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/voter-info')} className="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Voter Info
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2 text-gray-400" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Publish
          </button>
          {!isNew && formData.status === 'published' && (
            <a
              href={`https://bastropcc.com/voter-info/${formData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-secondary bg-white hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Page Title</label>
            <input type="text" id="title" value={formData.title} onChange={handleTitleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-lg border p-2" />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">URL Slug</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                bastropcc.com/voter-info/
              </span>
              <input type="text" id="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-gray-300 border p-2 focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Polling Locations, Deadlines, Propositions" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

          <div>
            <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">Display Order</label>
            <input type="number" id="sort_order" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

          <div>
            <label htmlFor="last_verified" className="block text-sm font-medium text-gray-700">Last Verified Date (For compliance/trust)</label>
            <input type="date" id="last_verified" value={formData.last_verified} onChange={(e) => setFormData({...formData, last_verified: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

          <div>
            <label htmlFor="external_source_url" className="block text-sm font-medium text-gray-700">External Source Reference URL (Optional)</label>
            <input type="url" id="external_source_url" value={formData.external_source_url} onChange={(e) => setFormData({...formData, external_source_url: e.target.value})} placeholder="https://www.sos.state.tx.us/..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
          </div>

        </div>

        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Page Content</label>
          <RichTextEditor 
            content={formData.content} 
            onChange={(html) => setFormData({ ...formData, content: html })} 
          />
        </div>

      </div>
    </div>
  );
}
