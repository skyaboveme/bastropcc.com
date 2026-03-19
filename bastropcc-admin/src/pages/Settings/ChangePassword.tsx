import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsSaving(false);
      return;
    }

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long');
      setIsSaving(false);
      return;
    }

    try {
      const res = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      }) as any;

      if (res.success) {
        setSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err?.error || err?.message || 'Server error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-secondary flex items-center">
            <SettingsIcon className="w-6 h-6 mr-2" /> Settings
          </h1>
          <p className="mt-2 text-sm text-gray-700">Manage your profile and security credentials.</p>
        </div>
      </div>

      <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden p-6 mt-6">
        <h2 className="text-lg font-bold font-serif text-gray-900 border-b border-gray-200 pb-4 mb-6">Change Password for {user?.email}</h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input 
              type="password" 
              required 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input 
              type="password" 
              required 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" 
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 10 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2" 
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
