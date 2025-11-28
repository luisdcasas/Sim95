'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

import QuestionEditor from '../../../_components/QuestionEditor';
import ScoringRulesEditor from '../../../_components/ScoringRulesEditor';

import type { AssessmentDefinition, Question } from '@/types/assessment';

export default function DefinitionEditorPage() {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const params = useParams() as { definitionId: string };
    const definitionId = params.definitionId;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    // -------------------------------------------------------
    // 🔥 Load definition on page load
    // -------------------------------------------------------
    useEffect(() => {
        const loadDefinition = async () => {
            if (!definitionId || definitionId === 'new') {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('assessment_definitions')
                .select('*')
                .eq('id', definitionId)
                .single();

            if (error) {
                console.error('Failed to load definition:', error);
            } else {
                setDefinition({
                    ...data,
                    questions: data.questions ?? [],
                    scoringRules: data.scoring_rules ?? {
                        subsystems: [],
                        hiddenVariables: [],
                        reportTemplates: [],
                    },
                });
            }

            setLoading(false);
        };

        loadDefinition();
    }, [definitionId, supabase]);

    // -------------------------------------------------------
    // 🔥 Save to Supabase (create or update)
    // -------------------------------------------------------
    const handleSave = async () => {
        setSaving(true);
        console.log({ definition })
        const payload = {
            id: definitionId !== 'new' ? definitionId : undefined,
            name: definition.name,
            version: definition.version,
            description: definition.description,
            questions: definition.questions,
            scoring_rules: definition.scoringRules,
        };

        const { data, error } = await supabase
            .from('assessment_definitions')
            .upsert(payload)
            .select('*')
            .single();

        setSaving(false);

        if (error) {
            console.error(error);
            alert('Failed to save definition — check console');
            return;
        }

        router.push('/admin/definitions');
    };

    // -------------------------------------------------------
    // 🔧 Question handlers
    // -------------------------------------------------------
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

    if (loading) {
        return (
            <div className="text-center py-20 text-white text-xl">
                Loading definition…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/definitions')}
                            className="text-white hover:text-purple-300">
                            <ArrowLeft size={24} />
                        </button>

                        <div>
                            <h1 className="text-xl text-white">
                                {definitionId === 'new' ? 'Create New Assessment' : 'Edit Assessment'}
                            </h1>
                            <p className="text-purple-300 text-sm">
                                {definition.name || 'Untitled Assessment'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    >
                        <Save size={18} />
                        {saving ? 'Saving…' : 'Save Definition'}
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-black/20 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex gap-6">
                    {['basic', 'questions', 'scoring'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-4 border-b-2 transition-colors ${activeTab === tab
                                ? 'border-purple-500 text-white'
                                : 'border-transparent text-white/60 hover:text-white/80'
                                }`}
                        >
                            {tab === 'basic' && 'Basic Info'}
                            {tab === 'questions' && `Questions (${definition.questions?.length || 0})`}
                            {tab === 'scoring' && 'Scoring Rules'}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* BASIC TAB */}
                {activeTab === 'basic' && (
                    <BasicInfoTab definition={definition} setDefinition={setDefinition} />
                )}

                {/* QUESTIONS TAB */}
                {activeTab === 'questions' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl text-white">Questions</h2>
                            <button
                                onClick={handleAddQuestion}
                                className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg text-white"
                            >
                                <Plus size={18} /> Add Question
                            </button>
                        </div>

                        {(definition.questions || []).map((question, index) => (
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
                )}

                {/* SCORING TAB */}
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

// -----------------------------------------------------------
// 🔧 Extracted Basic Info Tab (cleaner code)
// -----------------------------------------------------------
function BasicInfoTab({
    definition,
    setDefinition,
}: {
    definition: any;
    setDefinition: (def: any) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="bg-white/10 p-8 rounded-xl border border-white/20">
                <h2 className="text-xl text-white mb-6">Assessment Information</h2>

                <div className="space-y-4">
                    <Field label="Assessment Name" value={definition.name}
                        onChange={(v: string) => setDefinition({ ...definition, name: v })} />

                    <Field label="Version" value={definition.version}
                        onChange={(v: string) => setDefinition({ ...definition, version: v })} />

                    <Textarea label="Description" value={definition.description}
                        onChange={(v: string) => setDefinition({ ...definition, description: v })} />
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------
// ⭐ Reusable Inputs
// -----------------------------------------------------------
const Field = ({ label, value, onChange }: any) => (
    <div>
        <label className="block text-white/80 mb-2">{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
        />
    </div>
);

const Textarea = ({ label, value, onChange }: any) => (
    <div>
        <label className="block text-white/80 mb-2">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[120px]"
        />
    </div>
);
