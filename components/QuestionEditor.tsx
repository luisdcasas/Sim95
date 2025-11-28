import { useState } from 'react';
import { Question } from '../types/assessment';
import { ChevronDown, ChevronUp, Copy, Trash2, Plus, X } from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function QuestionEditor({ question, index, onUpdate, onDelete, onDuplicate }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddOption = () => {
    const newOptions = [
      ...(question.options || []),
      { value: `option_${Date.now()}`, label: '', weight: 1 },
    ];
    onUpdate({ ...question, options: newOptions });
  };

  const handleUpdateOption = (optIndex: number, field: 'label' | 'value' | 'weight', value: any) => {
    const newOptions = [...(question.options || [])];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
    onUpdate({ ...question, options: newOptions });
  };

  const handleDeleteOption = (optIndex: number) => {
    const newOptions = [...(question.options || [])];
    newOptions.splice(optIndex, 1);
    onUpdate({ ...question, options: newOptions });
  };

  const handleAddSubsystem = (subsystem: string) => {
    if (!question.subsystems.includes(subsystem)) {
      onUpdate({ ...question, subsystems: [...question.subsystems, subsystem] });
    }
  };

  const handleRemoveSubsystem = (subsystem: string) => {
    onUpdate({ ...question, subsystems: question.subsystems.filter(s => s !== subsystem) });
  };

  const availableSubsystems = [
    'archetype', 'collapse', 'identityAge', 'boundary', 'stability',
    'momentum', 'capacity', 'emotionalPattern', 'environment', 'selfLeadership'
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="text-white line-clamp-1">{question.text || 'Untitled Question'}</p>
            <div className="flex gap-3 text-xs text-white/50 mt-1">
              <span className="capitalize">{question.type}</span>
              <span>•</span>
              <span>{question.section}</span>
              {question.required && (
                <>
                  <span>•</span>
                  <span className="text-red-300">Required</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDuplicate}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 mb-2 text-sm">Section</label>
              <input
                type="text"
                value={question.section}
                onChange={(e) => onUpdate({ ...question, section: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2 text-sm">Question Type</label>
              <select
                value={question.type}
                onChange={(e) => onUpdate({ ...question, type: e.target.value as any })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="scale">Scale</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="text">Text</option>
                <option value="ranking">Ranking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/80 mb-2 text-sm">Question Text *</label>
            <textarea
              value={question.text}
              onChange={(e) => onUpdate({ ...question, text: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              placeholder="Enter your question..."
            />
          </div>

          {/* Scale Options */}
          {question.type === 'scale' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm">Min Value</label>
                <input
                  type="number"
                  value={question.scaleMin}
                  onChange={(e) => onUpdate({ ...question, scaleMin: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Max Value</label>
                <input
                  type="number"
                  value={question.scaleMax}
                  onChange={(e) => onUpdate({ ...question, scaleMax: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Min Label</label>
                <input
                  type="text"
                  value={question.scaleLabels?.min || ''}
                  onChange={(e) => onUpdate({
                    ...question,
                    scaleLabels: { ...question.scaleLabels!, min: e.target.value }
                  })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Max Label</label>
                <input
                  type="text"
                  value={question.scaleLabels?.max || ''}
                  onChange={(e) => onUpdate({
                    ...question,
                    scaleLabels: { ...question.scaleLabels!, max: e.target.value }
                  })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Multiple Choice Options */}
          {question.type === 'multiple_choice' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-white/80 text-sm">Answer Options</label>
                <button
                  onClick={handleAddOption}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                >
                  <Plus size={14} />
                  Add Option
                </button>
              </div>
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => handleUpdateOption(optIndex, 'label', e.target.value)}
                      placeholder="Option label"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      value={option.weight}
                      onChange={(e) => handleUpdateOption(optIndex, 'weight', parseFloat(e.target.value))}
                      placeholder="Weight"
                      className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => handleDeleteOption(optIndex)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subsystems */}
          <div>
            <label className="block text-white/80 mb-2 text-sm">Scoring Subsystems</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {question.subsystems.map((subsystem) => (
                <span
                  key={subsystem}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                >
                  {subsystem}
                  <button
                    onClick={() => handleRemoveSubsystem(subsystem)}
                    className="hover:text-red-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddSubsystem(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Add subsystem...</option>
              {availableSubsystems
                .filter(s => !question.subsystems.includes(s))
                .map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
            </select>
          </div>

          {/* Required Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
              className="w-5 h-5 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor={`required-${question.id}`} className="text-white/80 text-sm cursor-pointer">
              Required question
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
