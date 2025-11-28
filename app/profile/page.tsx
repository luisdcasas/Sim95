"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ArrowLeft, User, Mail, Calendar, Shield, Download, Trash2, Settings } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function UserProfilePage() {
  const router = useRouter();
  const { user, logout, loading, refreshUser } = useAuth();
  const { getUserInstances } = useAssessment();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const userInstances = getUserInstances(user.id);
  const completedCount = userInstances.filter(i => i.status === 'completed').length;

  const handleSaveProfile = async () => {
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: name,
      });

      if (email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) {
          throw error;
        }
      }

      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Unable to update profile. Please try again.');
    }
  };

  const handleExportData = () => {
    const data = {
      user,
      instances: userInstances,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIM95_UserData_${user.id}.json`;
    link.click();
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white hover:text-purple-300 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl text-white">Profile Settings</h1>
                <p className="text-purple-300 text-sm">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl text-white">{user.name}</h2>
                <p className="text-purple-300">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user.role === 'admin' && (
                    <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm flex items-center gap-1">
                      <Shield size={14} />
                      Admin
                    </span>
                  )}
                  <span className="px-3 py-1 bg-green-600/30 text-green-300 rounded-full text-sm">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Settings size={18} />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Member Since</p>
                <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Assessments Taken</p>
                <p className="text-white">{userInstances.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Completed</p>
                <p className="text-white">{completedCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Assessment History */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h3 className="text-xl text-white mb-6">Assessment History</h3>
          <div className="space-y-4">
            {userInstances.map((instance) => (
              <div key={instance.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Calendar className="text-purple-400" size={20} />
                    <div>
                      <p className="text-white">SIM95 Assessment</p>
                      <p className="text-white/60 text-sm">
                        {new Date(instance.startedAt).toLocaleDateString()}
                        {instance.completedAt && ` - Completed ${new Date(instance.completedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        instance.status === 'completed'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {instance.status}
                    </span>
                    {instance.status === 'completed' && (
                      <button
                        onClick={() => router.push(`/report/${instance.id}`)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                      >
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl text-white mb-6">Data & Privacy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white mb-1">Export Your Data</p>
                <p className="text-white/60 text-sm">Download all your assessment data and results</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div>
                <p className="text-white mb-1">Delete Account</p>
                <p className="text-white/60 text-sm">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
