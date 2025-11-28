'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ArrowLeft, Plus, Edit, Copy, Trash2, Download, Upload } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AssessmentDefinitionsPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { definitions, refreshDefinitions } = useAssessment();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    refreshDefinitions();
  }, [refreshDefinitions])

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

  const definition = definitions.find(d => d.id === selectedDefinition);

  const handleDuplicate = async (id: string) => {
    if (isProcessing) return;
    const original = definitions.find(d => d.id === id);
    if (!original) return;

    try {
      setIsProcessing(true);
      const { error } = await supabase.from('assessment_definitions').insert({
        name: `${original.name} (Copy)`,
        version: '1.0.0',
        description: original.description,
        questions: original.questions,
        scoring_rules: original.scoringRules,
      });

      if (error) {
        throw error;
      }

      await refreshDefinitions();
    } catch (error) {
      console.error('Failed to duplicate definition', error);
      alert('Unable to duplicate definition. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const { error } = await supabase.from('assessment_definitions').delete().eq('id', id);
      if (error) {
        throw error;
      }
      setShowDeleteConfirm(null);
      setSelectedDefinition(null);
      await refreshDefinitions();
    } catch (error) {
      console.error('Failed to delete definition', error);
      alert('Unable to delete definition. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = (id: string) => {
    const def = definitions.find(d => d.id === id);
    if (!def) return;

    const dataStr = JSON.stringify(def, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${def.name.replace(/\s+/g, '_')}_v${def.version}.json`;
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const payload = {
          name: imported.name || 'Imported Definition',
          version: imported.version || '1.0.0',
          description: imported.description || '',
          questions: imported.questions || [],
          scoring_rules: imported.scoringRules || imported.scoring_rules || {},
        };

        (async () => {
          try {
            setIsProcessing(true);
            const { error } = await supabase.from('assessment_definitions').insert(payload);
            if (error) {
              throw error;
            }
            await refreshDefinitions();
          } catch (err) {
            console.error('Failed to import definition', err);
            alert('Failed to import definition. Please check the file format.');
          } finally {
            setIsProcessing(false);
          }
        })();
      } catch (error) {
        alert('Failed to import definition. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-white hover:text-purple-300 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl text-white">Assessment Definitions</h1>
                <p className="text-purple-300 text-sm">Manage question sets & scoring rules</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer">
                <Upload size={18} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => router.push('/admin/definitions/edit/new')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
                New Definition
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Definitions List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl text-white mb-4">Definitions ({definitions.length})</h2>
            <div className="space-y-4">
              {definitions.map((def) => (
                <div
                  key={def.id}
                  onClick={() => setSelectedDefinition(def.id)}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border cursor-pointer transition-all ${selectedDefinition === def.id
                    ? 'border-purple-400 bg-white/20'
                    : 'border-white/20 hover:border-white/40'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white mb-1">{def.name}</h3>
                      <p className="text-white/60 text-sm line-clamp-2">{def.description}</p>
                    </div>
                    <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs">
                      v{def.version}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-white/50 mb-4">
                    <span>{def.questions.length} Q's</span>
                    <span>{def.scoringRules.subsystems.length} Subsystems</span>
                    <span>{def.scoringRules.hiddenVariables.length} Hidden</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/definitions/edit/${def.id}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors"
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(def.id);
                      }}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Definition Details */}
          <div className="lg:col-span-2">
            {definition ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl text-white mb-2">{definition.name}</h2>
                      <p className="text-white/90 mb-4">{definition.description}</p>
                      <div className="flex gap-4 text-white/80 text-sm">
                        <span>Version: {definition.version}</span>
                        <span>•</span>
                        <span>Created: {new Date(definition.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/definitions/edit/${definition.id}`)}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleExport(definition.id)}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        title="Export"
                      >
                        <Download size={20} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(definition.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {showDeleteConfirm === definition.id && (
                  <div className="bg-red-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-400/50">
                    <h3 className="text-xl text-white mb-2">Confirm Deletion</h3>
                    <p className="text-white/90 mb-4">
                      Are you sure you want to delete "{definition.name}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(definition.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl text-white mb-4">Overview</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/70 text-sm">Questions</p>
                      <p className="text-2xl text-white">{definition.questions.length}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/70 text-sm">Subsystems</p>
                      <p className="text-2xl text-white">{definition.scoringRules.subsystems.length}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/70 text-sm">Hidden Variables</p>
                      <p className="text-2xl text-white">{definition.scoringRules.hiddenVariables.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                <h3 className="text-xl text-white/70 mb-2">Select a Definition</h3>
                <p className="text-white/50">Choose a definition from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
