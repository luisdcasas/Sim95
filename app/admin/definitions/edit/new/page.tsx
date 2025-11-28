'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Copy, Eye, Settings } from 'lucide-react';
import { AssessmentDefinition, Question, ScoringSubsystem, HiddenVariable } from '../../../../../types/assessment';
import QuestionEditor from '../../../_components/QuestionEditor';
import ScoringRulesEditor from '../../../_components/ScoringRulesEditor';

export default function DefinitionEditor() {
    const router = useRouter();
    const params = useParams();
    const definitionId = params.definitionId as string;

    const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'scoring'>('basic');
    const [definition, setDefinition] = useState<Partial<AssessmentDefinition>>({
        name: '',
        version: '1.0.0',
        description: '',
        questions: [],
        scoringRules: {
            subsystems: [],
            hiddenVariables: [],
            reportTemplates: [],
        },
    });

    useEffect(() => {
        if (definitionId && definitionId !== 'new') {
            // Load existing definition
            const stored = localStorage.getItem('sim95_definitions');
            if (stored) {
                const definitions = JSON.parse(stored);
                const existing = definitions.find((d: AssessmentDefinition) => d.id === definitionId);
                if (existing) {
                    setDefinition(existing);
                }
            }
        }
    }, [definitionId]);

    const handleSave = () => {
        const stored = localStorage.getItem('sim95_definitions');
        const definitions = stored ? JSON.parse(stored) : [];

        const newDefinition: AssessmentDefinition = {
            ...definition,
            id: definition.id || `def_${Date.now()}`,
            createdAt: definition.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as AssessmentDefinition;

        const existingIndex = definitions.findIndex((d: AssessmentDefinition) => d.id === newDefinition.id);

        if (existingIndex >= 0) {
            definitions[existingIndex] = newDefinition;
        } else {
            definitions.push(newDefinition);
        }

        localStorage.setItem('sim95_definitions', JSON.stringify(definitions));
        router.push('/admin/definitions');
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: `q_${Date.now()}`,
            section: 'New Section',
            text: '',
            type: 'scale',
            scaleMin: 1,
            scaleMax: 10,
            scaleLabels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
            required: true,
            subsystems: [],
        };

        setDefinition({
            ...definition,
            questions: [...(definition.questions || []), newQuestion],
        });
    };

    const handleUpdateQuestion = (index: number, updated: Question) => {
        const questions = [...(definition.questions || [])];
        questions[index] = updated;
        setDefinition({ ...definition, questions });
    };

    const handleDeleteQuestion = (index: number) => {
        const questions = [...(definition.questions || [])];
        questions.splice(index, 1);
        setDefinition({ ...definition, questions });
    };

    const handleDuplicateQuestion = (index: number) => {
        const questions = [...(definition.questions || [])];
        const duplicate = { ...questions[index], id: `q_${Date.now()}` };
        questions.splice(index + 1, 0, duplicate);
        setDefinition({ ...definition, questions });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/admin/definitions')}
                                className="text-white hover:text-purple-300 transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl text-white">
                                    {definitionId === 'new' ? 'Create New Definition' : 'Edit Definition'}
                                </h1>
                                <p className="text-purple-300 text-sm">{definition.name || 'Untitled Assessment'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/admin/definitions')}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                <Save size={18} />
                                Save Definition
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`px-4 py-4 border-b-2 transition-colors ${activeTab === 'basic'
                                ? 'border-purple-500 text-white'
                                : 'border-transparent text-white/60 hover:text-white/80'
                                }`}
                        >
                            Basic Info
                        </button>
                        <button
                            onClick={() => setActiveTab('questions')}
                            className={`px-4 py-4 border-b-2 transition-colors ${activeTab === 'questions'
                                ? 'border-purple-500 text-white'
                                : 'border-transparent text-white/60 hover:text-white/80'
                                }`}
                        >
                            Questions ({definition.questions?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('scoring')}
                            className={`px-4 py-4 border-b-2 transition-colors ${activeTab === 'scoring'
                                ? 'border-purple-500 text-white'
                                : 'border-transparent text-white/60 hover:text-white/80'
                                }`}
                        >
                            Scoring Rules
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                            <h2 className="text-xl text-white mb-6">Assessment Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/80 mb-2">Assessment Name *</label>
                                    <input
                                        type="text"
                                        value={definition.name}
                                        onChange={(e) => setDefinition({ ...definition, name: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., SIM95: Sovereign Identity Matrix"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2">Version *</label>
                                    <input
                                        type="text"
                                        value={definition.version}
                                        onChange={(e) => setDefinition({ ...definition, version: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., 1.0.0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2">Description *</label>
                                    <textarea
                                        value={definition.description}
                                        onChange={(e) => setDefinition({ ...definition, description: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                                        placeholder="Describe what this assessment measures..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/50">
                            <h3 className="text-white mb-2">Next Steps</h3>
                            <p className="text-white/80 mb-4">
                                After completing the basic information, move to the Questions tab to build your assessment.
                            </p>
                            <button
                                onClick={() => setActiveTab('questions')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                Add Questions →
                            </button>
                        </div>
                    </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl text-white">Questions</h2>
                                <p className="text-white/70">Build your assessment question set</p>
                            </div>
                            <button
                                onClick={handleAddQuestion}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                <Plus size={18} />
                                Add Question
                            </button>
                        </div>

                        {definition.questions && definition.questions.length > 0 ? (
                            <div className="space-y-4">
                                {definition.questions.map((question, index) => (
                                    <QuestionEditor
                                        key={question.id}
                                        question={question}
                                        index={index}
                                        onUpdate={(updated) => handleUpdateQuestion(index, updated)}
                                        onDelete={() => handleDeleteQuestion(index)}
                                        onDuplicate={() => handleDuplicateQuestion(index)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                                <h3 className="text-xl text-white/70 mb-2">No questions yet</h3>
                                <p className="text-white/50 mb-6">Add your first question to start building the assessment</p>
                                <button
                                    onClick={handleAddQuestion}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
                                >
                                    <Plus size={20} />
                                    Add First Question
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Scoring Rules Tab */}
                {activeTab === 'scoring' && (
                    <ScoringRulesEditor
                        scoringRules={definition.scoringRules!}
                        questions={definition.questions || []}
                        onChange={(updated) => setDefinition({ ...definition, scoringRules: updated })}
                    />
                )}
            </main>
        </div>
    );
}
