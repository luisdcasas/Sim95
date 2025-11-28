'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ArrowLeft, TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { getUserInstances } = useAssessment();

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

  const getScoreTrend = () => {
    return completedInstances
      .map(instance => ({
        date: new Date(instance.completedAt!),
        score: instance.computedResults?.overallScore || 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const scoreTrend = getScoreTrend();
  const latestScore = completedInstances.length > 0 
    ? completedInstances[completedInstances.length - 1].computedResults?.overallScore || 0
    : 0;

  const scoreChange = scoreTrend.length >= 2
    ? scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score
    : 0;

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
                <h1 className="text-2xl text-white">Analytics & Insights</h1>
                <p className="text-purple-300 text-sm">Track your development over time</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {completedInstances.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <BarChart3 className="mx-auto text-white/30 mb-4" size={64} />
            <h3 className="text-2xl text-white/70 mb-2">No Data Yet</h3>
            <p className="text-white/50 mb-6">Complete assessments to see your analytics and trends</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Take Assessment
            </button>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70">Latest Score</p>
                  <TrendingUp className="text-purple-400" size={20} />
                </div>
                <p className="text-3xl text-white mb-1">{latestScore}</p>
                <p className={`text-sm ${scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {scoreChange >= 0 ? '+' : ''}{scoreChange} from first
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70">Total Assessments</p>
                  <Activity className="text-blue-400" size={20} />
                </div>
                <p className="text-3xl text-white mb-1">{completedInstances.length}</p>
                <p className="text-sm text-white/50">Completed</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70">Avg. Score</p>
                  <BarChart3 className="text-green-400" size={20} />
                </div>
                <p className="text-3xl text-white mb-1">
                  {Math.round(scoreTrend.reduce((sum, s) => sum + s.score, 0) / scoreTrend.length)}
                </p>
                <p className="text-sm text-white/50">Across all assessments</p>
              </div>
            </div>

            {/* Score Trend Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl text-white mb-6">Score Progression</h2>
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <line
                      key={y}
                      x1="0"
                      y1={200 - (y * 2)}
                      x2="800"
                      y2={200 - (y * 2)}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>

                  {/* Trend line */}
                  {scoreTrend.length > 1 && (
                    <polyline
                      points={scoreTrend.map((point, i) => {
                        const x = (i / (scoreTrend.length - 1)) * 800;
                        const y = 200 - (point.score * 2);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                    />
                  )}

                  {/* Data points */}
                  {scoreTrend.map((point, i) => {
                    const x = (i / Math.max(scoreTrend.length - 1, 1)) * 800;
                    const y = 200 - (point.score * 2);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#9333ea"
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-white/50 text-sm -ml-8">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
