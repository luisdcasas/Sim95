'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ArrowLeft, Download, FileJson } from 'lucide-react';
import ReportContent from '@/components/ReportContent';

export default function ReportPage() {
  const params = useParams();
  const instanceId = params.instanceId as string;
  const router = useRouter();
  const { getInstanceById, definitions } = useAssessment();

  const instance = getInstanceById(instanceId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
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

      <ReportContent instance={instance} results={results} />
    </div>
  );
}
