import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import RichTextEditor from '../../components/UI/RichTextEditor';
import { useAuth } from '../../context/AuthContext';
import { Save, ExternalLink, ArrowLeft, CheckCircle } from 'lucide-react';

export default function BlogEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    status: 'draft',
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isNew) return;
    const fetchPost = async () => {
      try {
        const res = await apiClient.get(`/blog/${id}`) as any;
        if (res.success) {
          setFormData({
            title: res.data.title || '',
            slug: res.data.slug || '',
            excerpt: res.data.excerpt || '',
            content: res.data.content || '',
            featured_image_url: res.data.featured_image_url || '',
            status: res.data.status || 'draft',
            tags: res.data.tags || []
          });
        }
      } catch (e: any) {
        setError(e?.error || 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
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

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSave = async (publish: boolean) => {
    setIsSaving(true);
    setError('');
    
    const payload = { ...formData, status: publish ? 'published' : 'draft' };
    
    try {
      if (isNew) {
        const res = await apiClient.post('/blog', payload) as any;
        navigate(`/blog/${res.data.id}`);
      } else {
        await apiClient.put(`/blog/${id}`, payload) as any;
        setFormData(prev => ({ ...prev, status: payload.status }));
      }
    } catch (e: any) {
      setError(e?.error || 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading editor...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/blog')} className="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Posts
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
            Publish Post
          </button>
          {!isNew && formData.status === 'published' && (
            <a
              href={`https://bastropcc.com/blog/${formData.slug}`}
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
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={handleTitleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-lg border p-2"
            placeholder="Post Title"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              bastropcc.com/blog/
            </span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-gray-300 border p-2 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt (160 characters)</label>
          <textarea
            id="excerpt"
            rows={2}
            maxLength={160}
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">{formData.excerpt.length}/160</p>
        </div>

        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">Featured Image URL</label>
          <input
            type="url"
            id="featuredImage"
            value={formData.featured_image_url}
            onChange={(e) => setFormData({...formData, featured_image_url: e.target.value})}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            {formData.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-secondary/10 text-secondary">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 inline-flex items-center justify-center text-secondary hover:text-primary">
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex-1 min-w-[120px] focus:outline-none sm:text-sm"
              placeholder="Add tag and press Enter"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <RichTextEditor 
            content={formData.content} 
            onChange={(html) => setFormData({ ...formData, content: html })} 
          />
        </div>

      </div>
    </div>
  );
}
