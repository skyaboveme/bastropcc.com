import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Key, Users } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'editor' });
  const [newTempPassword, setNewTempPassword] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/users') as any;
      if (res.success) setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to completely deactivate the user ${email}?`)) return;
    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (e: any) {
      alert(e?.error || 'Failed to deactivate user');
    }
  };

  const handleResetPassword = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${email}? They will be forcefully logged out.`)) return;
    try {
      const res = await apiClient.post(`/users/${id}/reset-password`) as any;
      if (res.success && res.tempPassword) {
        alert(`Password has been reset. \n\nTemporary Password: ${res.tempPassword}\n\nPlease provide this to the user securely.`);
      }
    } catch (e: any) {
      alert(e?.error || 'Failed to reset password');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/users', newUser) as any;
      if (res.success) {
        setNewTempPassword(res.tempPassword);
        fetchUsers();
      }
    } catch (e: any) {
      alert(e?.error || 'Failed to create user');
    }
  };

  if (currentUser?.role !== 'admin') {
    return <div className="p-6 text-center text-red-500 font-bold">Unauthorized. Admins only.</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-secondary flex items-center">
            <Users className="w-6 h-6 mr-2" /> User Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">Manage editors and administrators for the CMS.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setNewUser({ name: '', email: '', role: 'editor' });
              setNewTempPassword('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Login</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-gray-500">{u.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{u.role}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {u.is_active ? 
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span> : 
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Inactive</span>
                    }
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {u.last_login ? format(new Date(u.last_login), 'MMM d, yyyy h:mm a') : 'Never'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex justify-end space-x-3 mt-2">
                    {u.id !== currentUser.id && u.is_active ? (
                      <>
                        <button onClick={() => handleResetPassword(u.id, u.email)} className="text-secondary hover:text-primary transition-colors flex items-center pr-2" title="Force Password Reset">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeactivate(u.id, u.email)} className="text-red-500 hover:text-red-700 transition-colors flex items-center" title="Deactivate User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : u.id === currentUser.id ? (
                      <span className="text-gray-400 text-xs italic">You</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold font-serif mb-4 text-secondary">Add New User</h2>
            
            {!newTempPassword ? (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Format</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2 bg-white">
                    <option value="editor">Editor (Limited capabilities)</option>
                    <option value="admin">Admin (Full Control)</option>
                  </select>
                </div>
                
                <div className="mt-5 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">Create User</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="bg-green-50 text-green-800 p-4 rounded-md">
                  <p className="font-bold">User created successfully!</p>
                  <p className="text-sm mt-2">Please copy the temporary password below and provide it securely to the user. It will not be shown again.</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <span className="font-mono text-xl font-bold tracking-wider">{newTempPassword}</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark">Done</button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
