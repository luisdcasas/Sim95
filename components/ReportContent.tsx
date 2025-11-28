'use client';

import { AssessmentInstance, ComputedResults } from '@/types/assessment';
import { TrendingUp, Target, Brain, Shield, Zap, Heart, Compass, Users, Calendar } from 'lucide-react';

interface ReportContentProps {
  instance: AssessmentInstance;
  results: ComputedResults;
}

export default function ReportContent({ instance, results }: ReportContentProps) {
  return (
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

      {/* 90-Day Plan */}
      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/50">
        <h2 className="text-2xl text-white mb-6">Your 90-Day Identity Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[results.ninetyDayPlan.month1, results.ninetyDayPlan.month2, results.ninetyDayPlan.month3].map((month, index) => (
            <div key={index} className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-white">Month {index + 1}</h3>
                  <p className="text-white/70 text-sm">{month.focus}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm mb-2">Actions</p>
                  <ul className="space-y-1">
                    {month.actions.map((action, i) => (
                      <li key={i} className="text-white/90 text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Metrics</p>
                  <ul className="space-y-1">
                    {month.metrics.map((metric, i) => (
                      <li key={i} className="text-white/90 text-sm">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
