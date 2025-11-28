import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../contexts/AssessmentContext';
import { ArrowLeft, Plus, Edit, Eye, Copy, Archive, Download, Upload, Trash2 } from 'lucide-react';

export default function AssessmentDefinitions() {
  const navigate = useNavigate();
  const { definitions } = useAssessment();
  
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const definition = definitions.find(d => d.id === selectedDefinition);

  const handleCreateNew = () => {
    navigate('/admin/definitions/edit/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/definitions/edit/${id}`);
  };

  const handleDuplicate = (id: string) => {
    const original = definitions.find(d => d.id === id);
    if (!original) return;

    const duplicate = {
      ...original,
      id: `def_${Date.now()}`,
      name: `${original.name} (Copy)`,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem('sim95_definitions');
    const allDefs = stored ? JSON.parse(stored) : [];
    allDefs.push(duplicate);
    localStorage.setItem('sim95_definitions', JSON.stringify(allDefs));
    
    // Trigger reload
    window.location.reload();
  };

  const handleDelete = (id: string) => {
    const stored = localStorage.getItem('sim95_definitions');
    const allDefs = stored ? JSON.parse(stored) : [];
    const filtered = allDefs.filter((d: any) => d.id !== id);
    localStorage.setItem('sim95_definitions', JSON.stringify(filtered));
    setShowDeleteConfirm(null);
    setSelectedDefinition(null);
    window.location.reload();
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
        imported.id = `def_${Date.now()}`;
        imported.createdAt = new Date().toISOString();
        imported.updatedAt = new Date().toISOString();

        const stored = localStorage.getItem('sim95_definitions');
        const allDefs = stored ? JSON.parse(stored) : [];
        allDefs.push(imported);
        localStorage.setItem('sim95_definitions', JSON.stringify(allDefs));
        
        window.location.reload();
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
                onClick={() => navigate('/admin')}
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
                onClick={handleCreateNew}
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
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border cursor-pointer transition-all ${
                    selectedDefinition === def.id
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
                        handleEdit(def.id);
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
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                </div>
              ))}
              
              {definitions.length === 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-center">
                  <p className="text-white/70 mb-4">No definitions yet</p>
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Create First Definition
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Definition Details */}
          <div className="lg:col-span-2">
            {definition ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl text-white mb-2">{definition.name}</h2>
                      <p className="text-white/90 mb-4">{definition.description}</p>
                      <div className="flex gap-4 text-white/80 text-sm">
                        <span>Version: {definition.version}</span>
                        <span>•</span>
                        <span>Created: {new Date(definition.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated: {new Date(definition.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(definition.id)}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(definition.id)}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={20} />
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

                {/* Delete Confirmation */}
                {showDeleteConfirm === definition.id && (
                  <div className="bg-red-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-400/50">
                    <h3 className="text-xl text-white mb-2">Confirm Deletion</h3>
                    <p className="text-white/90 mb-4">
                      Are you sure you want to delete "{definition.name}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(definition.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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

                {/* Questions */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl text-white mb-4">Questions ({definition.questions.length})</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {definition.questions.map((question, index) => (
                      <div key={question.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-white/90">{question.text}</p>
                              {question.required && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 text-xs text-white/50">
                              <span className="capitalize">Type: {question.type}</span>
                              <span>•</span>
                              <span>Section: {question.section}</span>
                              {question.subsystems.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Subsystems: {question.subsystems.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scoring Subsystems */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl text-white mb-4">
                    Scoring Subsystems ({definition.scoringRules.subsystems.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {definition.scoringRules.subsystems.map((subsystem) => (
                      <div key={subsystem.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="text-white mb-2">{subsystem.name}</h4>
                        <p className="text-white/70 text-sm mb-3">{subsystem.description}</p>
                        <div className="space-y-1 text-xs text-white/50">
                          <p>Calculation Rules: {subsystem.calculation.length}</p>
                          <p>Outputs: {subsystem.outputs.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hidden Variables */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl text-white mb-4">
                    Hidden Variables ({definition.scoringRules.hiddenVariables.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {definition.scoringRules.hiddenVariables.map((variable) => (
                      <div key={variable.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white text-sm">{variable.name}</h4>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                            Hidden
                          </span>
                        </div>
                        <p className="text-white/70 text-xs">{variable.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Templates */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl text-white mb-4">
                    Report Templates ({definition.scoringRules.reportTemplates.length})
                  </h3>
                  <div className="space-y-3">
                    {definition.scoringRules.reportTemplates.map((template, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">{template.title}</h4>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            {template.section}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm line-clamp-2">{template.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                <Eye className="mx-auto text-white/30 mb-4" size={48} />
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