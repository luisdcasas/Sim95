import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserInstances } = useAssessment();

  const userInstances = user ? getUserInstances(user.id) : [];
  const completedInstances = userInstances.filter(i => i.status === 'completed');

  // Calculate trends
  const getScoreTrend = () => {
    return completedInstances
      .map(instance => ({
        date: new Date(instance.completedAt!),
        score: instance.computedResults?.overallScore || 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getArchetypeDistribution = () => {
    const distribution: Record<string, number> = {};
    completedInstances.forEach(instance => {
      const archetype = instance.computedResults?.archetype.primary;
      if (archetype) {
        distribution[archetype] = (distribution[archetype] || 0) + 1;
      }
    });
    return distribution;
  };

  const getSubsystemAverages = () => {
    if (completedInstances.length === 0) return {};

    const totals: Record<string, number> = {
      boundary: 0,
      stability: 0,
      capacity: 0,
      momentum: 0,
      selfLeadership: 0,
    };

    completedInstances.forEach(instance => {
      const results = instance.computedResults;
      if (results) {
        totals.boundary += results.boundary.score;
        totals.stability += results.stability.index;
        totals.capacity += results.capacity.overall;
        totals.momentum += results.momentum.velocity * 10;
        totals.selfLeadership += results.selfLeadership.level * 10;
      }
    });

    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] / completedInstances.length);
    });

    return totals;
  };

  const scoreTrend = getScoreTrend();
  const archetypeDistribution = getArchetypeDistribution();
  const subsystemAverages = getSubsystemAverages();

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
                onClick={() => navigate('/dashboard')}
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
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Take Assessment
            </button>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
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

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70">Primary Archetype</p>
                  <PieChart className="text-yellow-400" size={20} />
                </div>
                <p className="text-xl text-white mb-1">
                  {Object.entries(archetypeDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </p>
                <p className="text-sm text-white/50">Most common</p>
              </div>
            </div>

            {/* Score Trend */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
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

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>

                  {/* Data points */}
                  {scoreTrend.map((point, i) => {
                    const x = (i / (scoreTrend.length - 1)) * 800;
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
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-white/50 text-sm">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-white/50 text-xs mt-4">
                  {scoreTrend.map((point, i) => (
                    <span key={i}>{point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Subsystem Breakdown */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl text-white mb-6">Subsystem Averages</h2>
              <div className="space-y-4">
                {Object.entries(subsystemAverages).map(([subsystem, score]) => (
                  <div key={subsystem}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white capitalize">{subsystem.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-white/90">{score}/100</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Archetype Distribution */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl text-white mb-6">Archetype Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(archetypeDistribution).map(([archetype, count]) => (
                  <div key={archetype} className="bg-white/5 rounded-lg p-4 text-center">
                    <p className="text-2xl text-white mb-1">{count}</p>
                    <p className="text-white/70 text-sm">{archetype}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
