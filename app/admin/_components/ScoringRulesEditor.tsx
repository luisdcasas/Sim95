'use client';

import { useState } from 'react';
import { ScoringRules, Question, ScoringSubsystem, HiddenVariable, CalculationRule } from '../../../types/assessment';
import { Plus, Trash2, ChevronDown, ChevronUp, Code } from 'lucide-react';

interface ScoringRulesEditorProps {
  scoringRules: ScoringRules;
  questions: Question[];
  onChange: (rules: ScoringRules) => void;
}

export default function ScoringRulesEditor({ scoringRules, questions, onChange }: ScoringRulesEditorProps) {
  const [activeSection, setActiveSection] = useState<'subsystems' | 'hidden' | 'templates'>('subsystems');
  const [expandedSubsystem, setExpandedSubsystem] = useState<string | null>(null);

  const handleAddSubsystem = () => {
    const newSubsystem: ScoringSubsystem = {
      id: `subsystem_${Date.now()}`,
      name: 'New Subsystem',
      description: '',
      calculation: [],
      outputs: [],
    };

    onChange({
      ...scoringRules,
      subsystems: [...scoringRules.subsystems, newSubsystem],
    });
  };

  const handleUpdateSubsystem = (index: number, updated: ScoringSubsystem) => {
    const subsystems = [...scoringRules.subsystems];
    subsystems[index] = updated;
    onChange({ ...scoringRules, subsystems });
  };

  const handleDeleteSubsystem = (index: number) => {
    const subsystems = [...scoringRules.subsystems];
    subsystems.splice(index, 1);
    onChange({ ...scoringRules, subsystems });
  };

  const handleAddCalculation = (subsystemIndex: number) => {
    const subsystems = [...scoringRules.subsystems];
    const newCalculation: CalculationRule = {
      id: `calc_${Date.now()}`,
      type: 'average',
      inputs: [],
      output: '',
    };

    subsystems[subsystemIndex].calculation.push(newCalculation);
    onChange({ ...scoringRules, subsystems });
  };

  const handleAddHiddenVariable = () => {
    const newVariable: HiddenVariable = {
      id: `hidden_${Date.now()}`,
      name: 'New Hidden Variable',
      description: '',
      calculation: {
        id: `calc_${Date.now()}`,
        type: 'average',
        inputs: [],
        output: '',
      },
    };

    onChange({
      ...scoringRules,
      hiddenVariables: [...scoringRules.hiddenVariables, newVariable],
    });
  };

  const handleDeleteHiddenVariable = (index: number) => {
    const hiddenVariables = [...scoringRules.hiddenVariables];
    hiddenVariables.splice(index, 1);
    onChange({ ...scoringRules, hiddenVariables });
  };

  const handleAddReportTemplate = () => {
    onChange({
      ...scoringRules,
      reportTemplates: [
        ...scoringRules.reportTemplates,
        {
          section: 'new_section',
          title: 'New Section',
          content: '',
          variableMapping: {},
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-4 border-b border-white/20 pb-2">
        <button
          onClick={() => setActiveSection('subsystems')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeSection === 'subsystems'
              ? 'bg-purple-600 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Subsystems ({scoringRules.subsystems.length})
        </button>
        <button
          onClick={() => setActiveSection('hidden')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeSection === 'hidden'
              ? 'bg-purple-600 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Hidden Variables ({scoringRules.hiddenVariables.length})
        </button>
        <button
          onClick={() => setActiveSection('templates')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeSection === 'templates'
              ? 'bg-purple-600 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Report Templates ({scoringRules.reportTemplates.length})
        </button>
      </div>

      {/* Subsystems Section */}
      {activeSection === 'subsystems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl text-white">Scoring Subsystems</h3>
            <button
              onClick={handleAddSubsystem}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Subsystem
            </button>
          </div>

          {scoringRules.subsystems.map((subsystem, index) => (
            <div key={subsystem.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <div className="p-4 bg-white/5 flex items-center justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    value={subsystem.name}
                    onChange={(e) => handleUpdateSubsystem(index, { ...subsystem, name: e.target.value })}
                    className="bg-transparent text-white text-lg mb-1 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                  />
                  <p className="text-white/60 text-sm">{subsystem.calculation.length} calculation rules</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteSubsystem(index)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setExpandedSubsystem(expandedSubsystem === subsystem.id ? null : subsystem.id)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    {expandedSubsystem === subsystem.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expandedSubsystem === subsystem.id && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Description</label>
                    <textarea
                      value={subsystem.description}
                      onChange={(e) => handleUpdateSubsystem(index, { ...subsystem, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Outputs (comma-separated)</label>
                    <input
                      type="text"
                      value={subsystem.outputs.join(', ')}
                      onChange={(e) => handleUpdateSubsystem(index, {
                        ...subsystem,
                        outputs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., primary, secondary, scores"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-white/80 text-sm">Calculation Rules</label>
                      <button
                        onClick={() => handleAddCalculation(index)}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                      >
                        <Plus size={14} />
                        Add Rule
                      </button>
                    </div>

                    <div className="space-y-3">
                      {subsystem.calculation.map((calc, calcIndex) => (
                        <div key={calc.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-white/70 text-xs mb-1">Type</label>
                              <select
                                value={calc.type}
                                onChange={(e) => {
                                  const calcs = [...subsystem.calculation];
                                  calcs[calcIndex] = { ...calc, type: e.target.value as any };
                                  handleUpdateSubsystem(index, { ...subsystem, calculation: calcs });
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="sum">Sum</option>
                                <option value="average">Average</option>
                                <option value="weighted">Weighted</option>
                                <option value="conditional">Conditional</option>
                                <option value="mapping">Mapping</option>
                                <option value="threshold">Threshold</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-white/70 text-xs mb-1">Output Variable</label>
                              <input
                                type="text"
                                value={calc.output}
                                onChange={(e) => {
                                  const calcs = [...subsystem.calculation];
                                  calcs[calcIndex] = { ...calc, output: e.target.value };
                                  handleUpdateSubsystem(index, { ...subsystem, calculation: calcs });
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="output_name"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-white/70 text-xs mb-1">Input Question IDs (comma-separated)</label>
                            <input
                              type="text"
                              value={calc.inputs.join(', ')}
                              onChange={(e) => {
                                const calcs = [...subsystem.calculation];
                                calcs[calcIndex] = {
                                  ...calc,
                                  inputs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                };
                                handleUpdateSubsystem(index, { ...subsystem, calculation: calcs });
                              }}
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="q1, q2, q3"
                            />
                          </div>

                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => {
                                const calcs = [...subsystem.calculation];
                                calcs.splice(calcIndex, 1);
                                handleUpdateSubsystem(index, { ...subsystem, calculation: calcs });
                              }}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {scoringRules.subsystems.length === 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <Code className="mx-auto text-white/30 mb-4" size={48} />
              <h3 className="text-xl text-white/70 mb-2">No subsystems defined</h3>
              <p className="text-white/50 mb-6">Add scoring subsystems to calculate assessment results</p>
              <button
                onClick={handleAddSubsystem}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus size={20} />
                Add First Subsystem
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden Variables Section */}
      {activeSection === 'hidden' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl text-white">Hidden Variables</h3>
            <button
              onClick={handleAddHiddenVariable}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Variable
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoringRules.hiddenVariables.map((variable, index) => (
              <div key={variable.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => {
                        const vars = [...scoringRules.hiddenVariables];
                        vars[index] = { ...variable, name: e.target.value };
                        onChange({ ...scoringRules, hiddenVariables: vars });
                      }}
                      className="bg-transparent text-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 w-full"
                    />
                    <textarea
                      value={variable.description}
                      onChange={(e) => {
                        const vars = [...scoringRules.hiddenVariables];
                        vars[index] = { ...variable, description: e.target.value };
                        onChange({ ...scoringRules, hiddenVariables: vars });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={2}
                      placeholder="Description..."
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteHiddenVariable(index)}
                    className="ml-2 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="text-xs text-white/50 bg-white/5 rounded p-2">
                  <p>Calculation: {variable.calculation.type}</p>
                  <p>Inputs: {variable.calculation.inputs.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Templates Section */}
      {activeSection === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl text-white">Report Templates</h3>
            <button
              onClick={handleAddReportTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Template
            </button>
          </div>

          <div className="space-y-4">
            {scoringRules.reportTemplates.map((template, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Section ID</label>
                    <input
                      type="text"
                      value={template.section}
                      onChange={(e) => {
                        const templates = [...scoringRules.reportTemplates];
                        templates[index] = { ...template, section: e.target.value };
                        onChange({ ...scoringRules, reportTemplates: templates });
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Title</label>
                    <input
                      type="text"
                      value={template.title}
                      onChange={(e) => {
                        const templates = [...scoringRules.reportTemplates];
                        templates[index] = { ...template, title: e.target.value };
                        onChange({ ...scoringRules, reportTemplates: templates });
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-white/80 mb-2 text-sm">Content Template</label>
                  <textarea
                    value={template.content}
                    onChange={(e) => {
                      const templates = [...scoringRules.reportTemplates];
                      templates[index] = { ...template, content: e.target.value };
                      onChange({ ...scoringRules, reportTemplates: templates });
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="Use {{variable_name}} for dynamic content"
                  />
                </div>

                <button
                  onClick={() => {
                    const templates = [...scoringRules.reportTemplates];
                    templates.splice(index, 1);
                    onChange({ ...scoringRules, reportTemplates: templates });
                  }}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm transition-colors"
                >
                  Remove Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
