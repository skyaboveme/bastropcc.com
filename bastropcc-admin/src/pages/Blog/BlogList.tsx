import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

export default function BlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/blog') as any;
      if (res.success) setPosts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/blog/${id}`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (e: any) {
      alert(e?.error || 'Failed to delete');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" /> Draft
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-secondary">Blog Posts</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your website's news and updates.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/blog/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
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
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Author</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {post.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{post.author_name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex justify-end space-x-3">
                    <Link to={`/blog/${post.id}`} className="text-secondary hover:text-primary transition-colors">
                      <Edit2 className="w-5 h-5" />
                      <span className="sr-only">Edit {post.title}</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(post.id, post.title)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-5 h-5" />
                        <span className="sr-only">Delete {post.title}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No blog posts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
