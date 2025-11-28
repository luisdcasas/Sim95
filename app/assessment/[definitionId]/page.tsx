'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import { Question } from '@/types/assessment';

export default function AssessmentTakingPage() {
  const params = useParams();
  const definitionId = params.definitionId as string;
  const searchParams = useSearchParams();
  const instanceId = searchParams.get('instance');
  const router = useRouter();
  const { user } = useAuth();
  const { definitions, getInstanceById, saveAnswers, completeAssessment } = useAssessment();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sections, setSections] = useState<{ section: string; questions: Question[] }[]>([]);

  const definition = definitions.find(d => d.id === definitionId);
  const instance = instanceId ? getInstanceById(instanceId) : null;

  useEffect(() => {
    if (definition) {
      // Group questions by section
      const grouped = definition.questions.reduce((acc, question) => {
        const existing = acc.find(s => s.section === question.section);
        if (existing) {
          existing.questions.push(question);
        } else {
          acc.push({ section: question.section, questions: [question] });
        }
        return acc;
      }, [] as { section: string; questions: Question[] }[]);
      
      setSections(grouped);
    }
  }, [definition]);

  useEffect(() => {
    if (instance) {
      setAnswers(instance.rawAnswers);
    }
  }, [instance]);

  if (!definition || !instance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading assessment...</div>
      </div>
    );
  }

  const currentSection = sections[currentStep];
  const progress = ((currentStep + 1) / sections.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
  };

  const handleSave = async () => {
    if (!instanceId) return;
    try {
      await saveAnswers(instanceId, answers);
    } catch (error) {
      console.error('Unable to save answers', error);
    }
  };

  const handleNext = async () => {
    await handleSave();
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = async () => {
    await handleSave();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!instanceId) return;
    await handleSave();
    try {
      await completeAssessment(instanceId);
      router.push(`/report/${instanceId}`);
    } catch (error) {
      console.error('Unable to complete assessment', error);
    }
  };

  const isCurrentSectionComplete = () => {
    if (!currentSection) return false;
    return currentSection.questions.every(q => 
      !q.required || (answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-white">SIM95 Assessment</h1>
              <p className="text-purple-300 text-sm">{definition.name}</p>
            </div>
            <button
              onClick={async () => {
                await handleSave();
                router.push('/dashboard');
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Section {currentStep + 1} of {sections.length}</span>
            <span className="text-white/70 text-sm">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentSection && (
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl text-white mb-2">{currentSection.section}</h2>
              <p className="text-white/70 mb-8">Please answer all questions honestly. There are no right or wrong answers.</p>

              <div className="space-y-8">
                {currentSection.questions.map((question, index) => (
                  <div key={question.id} className="pb-8 border-b border-white/10 last:border-0 last:pb-0">
                    <div className="flex gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white mb-1">
                          {question.text}
                          {question.required && <span className="text-red-400 ml-1">*</span>}
                        </p>
                      </div>
                    </div>

                    <div className="ml-11">
                      {question.type === 'scale' && (
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            {Array.from({ length: (question.scaleMax || 10) - (question.scaleMin || 1) + 1 }, (_, i) => {
                              const value = (question.scaleMin || 1) + i;
                              return (
                                <button
                                  key={value}
                                  onClick={() => handleAnswer(question.id, value)}
                                  className={`w-12 h-12 rounded-lg transition-all ${
                                    answers[question.id] === value
                                      ? 'bg-purple-600 text-white scale-110'
                                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                                  }`}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                          {question.scaleLabels && (
                            <div className="flex justify-between text-sm text-white/60 mt-2">
                              <span>{question.scaleLabels.min}</span>
                              <span>{question.scaleLabels.max}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleAnswer(question.id, option.value)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                answers[question.id] === option.value
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {question.type === 'text' && (
                        <textarea
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswer(question.id, e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                          placeholder="Type your answer here..."
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <Save size={20} />
            Save Progress
          </button>

          {currentStep < sections.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentSectionComplete()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!isCurrentSectionComplete()}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={20} />
              Complete Assessment
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
