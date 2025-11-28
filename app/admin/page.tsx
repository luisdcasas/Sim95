'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ArrowLeft, Users, FileText, Activity, Search, Filter, Eye, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const { getAllInstances, definitions } = useAssessment();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const allInstances = getAllInstances();
  
  const filteredInstances = allInstances.filter(instance => {
    const matchesSearch = instance.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalInstances: allInstances.length,
    completed: allInstances.filter(i => i.status === 'completed').length,
    inProgress: allInstances.filter(i => i.status === 'in_progress').length,
    uniqueUsers: new Set(allInstances.map(i => i.userId)).size,
  };

  const handleViewReport = (instanceId: string) => {
    router.push(`/report/${instanceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white hover:text-purple-300 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl text-white">Admin Dashboard</h1>
                <p className="text-purple-300 text-sm">System Management & Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/definitions')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Settings size={18} />
                Definitions
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Assessments</p>
                <p className="text-3xl text-white mt-1">{stats.totalInstances}</p>
              </div>
              <FileText className="text-purple-400" size={32} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Completed</p>
                <p className="text-3xl text-white mt-1">{stats.completed}</p>
              </div>
              <Activity className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">In Progress</p>
                <p className="text-3xl text-white mt-1">{stats.inProgress}</p>
              </div>
              <Activity className="text-yellow-400" size={32} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Unique Users</p>
                <p className="text-3xl text-white mt-1">{stats.uniqueUsers}</p>
              </div>
              <Users className="text-blue-400" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                placeholder="Search by User ID or Instance ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-white/50" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Instances Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-white/70">Instance ID</th>
                  <th className="px-6 py-4 text-left text-white/70">User ID</th>
                  <th className="px-6 py-4 text-left text-white/70">Definition</th>
                  <th className="px-6 py-4 text-left text-white/70">Status</th>
                  <th className="px-6 py-4 text-left text-white/70">Started</th>
                  <th className="px-6 py-4 text-left text-white/70">Score</th>
                  <th className="px-6 py-4 text-left text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInstances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                      No instances found
                    </td>
                  </tr>
                ) : (
                  filteredInstances.map((instance) => {
                    const definition = definitions.find(d => d.id === instance.definitionId);
                    return (
                      <tr key={instance.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white/90 text-sm font-mono">
                          {instance.id.substring(0, 16)}...
                        </td>
                        <td className="px-6 py-4 text-white/90 text-sm font-mono">
                          {instance.userId.substring(0, 16)}...
                        </td>
                        <td className="px-6 py-4 text-white/90 text-sm">
                          {definition?.name || 'Unknown'}
                          <span className="block text-white/50 text-xs">v{instance.version}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              instance.status === 'completed'
                                ? 'bg-green-500/20 text-green-300'
                                : instance.status === 'in_progress'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {instance.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/70 text-sm">
                          {new Date(instance.startedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-white/90">
                          {instance.computedResults?.overallScore || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {instance.status === 'completed' && (
                            <button
                              onClick={() => handleViewReport(instance.id)}
                              className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
