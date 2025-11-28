import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment } from '../contexts/AssessmentContext';
import { ArrowLeft, Download, Share2, TrendingUp, Target, Brain, Shield, Zap, Heart, Compass, Users, Calendar, FileJson } from 'lucide-react';

export default function ReportView() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { getInstanceById, definitions } = useAssessment();

  const instance = instanceId ? getInstanceById(instanceId) : null;
  const definition = instance ? definitions.find(d => d.id === instance.definitionId) : null;
  const results = instance?.computedResults;

  const handleDownloadJSON = () => {
    if (!instance || !results) return;

    const reportData = {
      assessment: {
        name: definition?.name || 'SIM95',
        version: instance.version,
        completedAt: instance.completedAt,
      },
      results,
      metadata: {
        instanceId: instance.id,
        exportedAt: new Date().toISOString(),
      },
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIM95_Report_${instance.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (!instance || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading report...</div>
      </div>
    );
  }

  const subsystemIcons: Record<string, any> = {
    archetype: Brain,
    collapse: TrendingUp,
    identityAge: Calendar,
    boundary: Shield,
    stability: Target,
    momentum: Zap,
    capacity: Heart,
    emotionalPattern: Heart,
    environment: Compass,
    selfLeadership: Users,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <FileJson size={18} />
                Export JSON
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 mb-12 text-center">
          <h1 className="text-4xl text-white mb-4">Your SIM95 Report</h1>
          <p className="text-white/90 text-lg mb-6">
            Sovereign Identity Matrix™ Assessment Results
          </p>
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-white/80">Completed</p>
              <p className="text-2xl text-white">{new Date(instance.completedAt!).toLocaleDateString()}</p>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div>
              <p className="text-white/80">Overall Score</p>
              <p className="text-2xl text-white">{results.overallScore}/100</p>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div>
              <p className="text-white/80">Version</p>
              <p className="text-2xl text-white">{instance.version}</p>
            </div>
          </div>
        </div>

        {/* Archetype Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl text-white">Identity Archetype</h2>
              <p className="text-white/70">Your core identity pattern</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-xl p-6 border border-purple-400/50">
              <p className="text-purple-300 text-sm mb-2">Primary Archetype</p>
              <p className="text-2xl text-white">{results.archetype.primary}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <p className="text-white/70 text-sm mb-2">Secondary Archetype</p>
              <p className="text-xl text-white">{results.archetype.secondary}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <p className="text-white/70 text-sm mb-2">Shadow Archetype</p>
              <p className="text-xl text-white">{results.archetype.shadow}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <p className="text-white/90 leading-relaxed">{results.archetype.description}</p>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Collapse Pattern */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-purple-400" size={24} />
              <h3 className="text-xl text-white">Collapse Pattern</h3>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">Pattern Type</span>
                <span className="text-purple-300">{results.collapse.pattern}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">Severity</span>
                <span className="text-purple-300">{results.collapse.severity}/10</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">Primary Triggers</p>
              <div className="flex flex-wrap gap-2">
                {results.collapse.triggers.map((trigger, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Identity Age */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-purple-400" size={24} />
              <h3 className="text-xl text-white">Identity Age</h3>
            </div>
            <div className="text-center mb-4">
              <p className="text-5xl text-white mb-2">{results.identityAge.age}</p>
              <p className="text-purple-300">{results.identityAge.stage}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">Development Gaps</p>
              <ul className="space-y-1">
                {results.identityAge.gaps.map((gap, i) => (
                  <li key={i} className="text-white/80 text-sm">• {gap}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Boundary Style */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-purple-400" size={24} />
              <h3 className="text-xl text-white">Boundary System</h3>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">Style</span>
                <span className="text-purple-300">{results.boundary.style}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Score</span>
                <span className="text-purple-300">{results.boundary.score}/100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 rounded-lg p-3">
                <p className="text-green-300 text-sm mb-2">Strengths</p>
                <ul className="space-y-1">
                  {results.boundary.strengths.map((s, i) => (
                    <li key={i} className="text-white/80 text-xs">• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-3">
                <p className="text-yellow-300 text-sm mb-2">Weaknesses</p>
                <ul className="space-y-1">
                  {results.boundary.weaknesses.map((w, i) => (
                    <li key={i} className="text-white/80 text-xs">• {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stability Index */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-purple-400" size={24} />
              <h3 className="text-xl text-white">Stability Index</h3>
            </div>
            <div className="text-center mb-4">
              <p className="text-5xl text-white mb-2">{results.stability.index}</p>
              <p className="text-purple-300">{results.stability.category}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(results.stability.factors).map(([factor, score]) => (
                <div key={factor}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm capitalize">{factor}</span>
                    <span className="text-white/90 text-sm">{score}/10</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Subsystems */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Momentum */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-yellow-400" size={20} />
              <h3 className="text-lg text-white">Momentum</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70 text-sm">Type</span>
                <span className="text-purple-300 text-sm">{results.momentum.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70 text-sm">Velocity</span>
                <span className="text-purple-300 text-sm">{results.momentum.velocity}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70 text-sm">Direction</span>
                <span className="text-purple-300 text-sm">{results.momentum.direction}</span>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="text-red-400" size={20} />
              <h3 className="text-lg text-white">Capacity</h3>
            </div>
            <div className="text-center mb-3">
              <p className="text-3xl text-white">{results.capacity.overall}/100</p>
            </div>
            <div className="text-white/70 text-sm">
              <p className="mb-1">Constraints: {results.capacity.constraints.length}</p>
              <p>Growth Areas: {results.capacity.expansion.length}</p>
            </div>
          </div>

          {/* Self-Leadership */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-blue-400" size={20} />
              <h3 className="text-lg text-white">Self-Leadership</h3>
            </div>
            <div className="text-center mb-3">
              <p className="text-3xl text-white">Level {results.selfLeadership.level}</p>
            </div>
            <div className="text-white/70 text-sm">
              <p>Top Competencies:</p>
              <ul className="mt-1 space-y-1">
                {Object.entries(results.selfLeadership.competencies)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([comp, score]) => (
                    <li key={comp} className="text-xs capitalize">• {comp}: {score}/10</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 90-Day Plan */}
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/50">
          <h2 className="text-2xl text-white mb-6">Your 90-Day Identity Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Month 1 */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  1
                </div>
                <div>
                  <h3 className="text-white">Month 1</h3>
                  <p className="text-white/70 text-sm">{results.ninetyDayPlan.month1.focus}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm mb-2">Actions</p>
                  <ul className="space-y-1">
                    {results.ninetyDayPlan.month1.actions.map((action, i) => (
                      <li key={i} className="text-white/90 text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Metrics</p>
                  <ul className="space-y-1">
                    {results.ninetyDayPlan.month1.metrics.map((metric, i) => (
                      <li key={i} className="text-white/90 text-sm">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Month 2 */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  2
                </div>
                <div>
                  <h3 className="text-white">Month 2</h3>
                  <p className="text-white/70 text-sm">{results.ninetyDayPlan.month2.focus}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm mb-2">Actions</p>
                  <ul className="space-y-1">
                    {results.ninetyDayPlan.month2.actions.map((action, i) => (
                      <li key={i} className="text-white/90 text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Metrics</p>
                  <ul className="space-y-1">
                    {results.ninetyDayPlan.month2.metrics.map((metric, i) => (
                      <li key={i} className="text-white/90 text-sm">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Month 3 */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  3
                </div>
                <div>
                  <h3 className="text-white">Month 3</h3>
                  <p className="text-white/70 text-sm">{results.ninetyDayPlan.month3.focus}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm mb-2">Actions</p>
                  <ul className="space-y-1">
                    {results.ninetyDayPlan.month3.actions.map((action, i) => (
                      <li key={i} className="text-white/90 text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Metrics</p>
                  <ul className="space-y-1">
                    {results.ninetyDayPlan.month3.metrics.map((metric, i) => (
                      <li key={i} className="text-white/90 text-sm">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}