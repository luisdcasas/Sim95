'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { Plus, FileText, Calendar, LogOut, Shield, TrendingUp, User, BarChart } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, isAdmin, loading } = useAuth();
  const { definitions, getUserInstances, createInstance } = useAssessment();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
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
  const completedInstances = userInstances.filter(i => i.status === 'completed');
  const inProgressInstances = userInstances.filter(i => i.status === 'in_progress');

  const handleStartAssessment = async () => {
    if (definitions.length === 0) {
      
      return
    };
    try {
      const instanceId = await createInstance(definitions[0].id, user.id);
      router.push(`/assessment/${definitions[0].id}?instance=${instanceId}`);
    } catch (error) {
      console.error('Unable to start assessment', error);
    }
  };

  const handleViewReport = (instanceId: string) => {
    router.push(`/report/${instanceId}`);
  };

  const handleContinueAssessment = (definitionId: string, instanceId: string) => {
    router.push(`/assessment/${definitionId}?instance=${instanceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-white">SIM95</h1>
              <p className="text-purple-300 text-sm">Sovereign Identity Matrix™</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white">{user.name}</p>
                <p className="text-purple-300 text-sm">{user.email}</p>
              </div>
              <button
                onClick={() => router.push('/analytics')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <BarChart size={18} />
                Analytics
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <User size={18} />
                Profile
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Shield size={18} />
                  Admin
                </button>
              )}
              <button
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70">Total Assessments</p>
                <p className="text-3xl text-white mt-1">{userInstances.length}</p>
              </div>
              <FileText className="text-purple-400" size={32} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70">Completed</p>
                <p className="text-3xl text-white mt-1">{completedInstances.length}</p>
              </div>
              <TrendingUp className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70">In Progress</p>
                <p className="text-3xl text-white mt-1">{inProgressInstances.length}</p>
              </div>
              <Calendar className="text-yellow-400" size={32} />
            </div>
          </div>
        </div>

        {/* Start New Assessment */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl text-white mb-2">Ready for Your Assessment?</h2>
              <p className="text-white/90 mb-4">
                Discover your sovereign identity through our comprehensive 95-question diagnostic engine.
              </p>
              <p className="text-white/80 text-sm">
                Time to complete: ~20-30 minutes
              </p>
            </div>
            <button
              onClick={handleStartAssessment}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-colors"
            >
              <Plus size={20} />
              Start Assessment
            </button>
          </div>
        </div>

        {/* In Progress Assessments */}
        {inProgressInstances.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl text-white mb-6">Continue Your Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgressInstances.map((instance) => {
                const definition = definitions.find(d => d.id === instance.definitionId);
                return (
                  <div
                    key={instance.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white mb-1">{definition?.name || 'SIM95 Assessment'}</h3>
                        <p className="text-white/60 text-sm">Started: {new Date(instance.startedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                        In Progress
                      </span>
                    </div>
                    <button
                      onClick={() => handleContinueAssessment(instance.definitionId, instance.id)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Continue Assessment
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Assessments */}
        {completedInstances.length > 0 && (
          <div>
            <h2 className="text-2xl text-white mb-6">Your Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedInstances.map((instance) => {
                const definition = definitions.find(d => d.id === instance.definitionId);
                return (
                  <div
                    key={instance.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white mb-1">{definition?.name || 'SIM95 Assessment'}</h3>
                        <p className="text-white/60 text-sm">Completed: {new Date(instance.completedAt!).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        Complete
                      </span>
                    </div>
                    {instance.computedResults && (
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Primary Archetype</span>
                          <span className="text-purple-300">{instance.computedResults.archetype.primary}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Overall Score</span>
                          <span className="text-purple-300">{instance.computedResults.overallScore}/100</span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => handleViewReport(instance.id)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      View Full Report
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completedInstances.length === 0 && inProgressInstances.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-white/30 mb-4" size={64} />
            <h3 className="text-xl text-white/70 mb-2">No assessments yet</h3>
            <p className="text-white/50">Start your first assessment to unlock your sovereign identity insights.</p>
          </div>
        )}
      </main>
    </div>
  );
}
