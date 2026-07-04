'use client';

import VerdictBanner from './VerdictBanner';
import TrustScore from './TrustScore';
import DeepReport from './DeepReport';
import FeedbackForm from './FeedbackForm';

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VerdictBanner
        label={result.label}
        riskScore={result.risk_score}
        verdictText={result.verdict_text}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <TrustScore score={result.trust_score} signals={result.trust_signals} />

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-2">Scan Details</h3>
            <div className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
              <p><span className="font-medium text-gray-800 dark:text-gray-200">Target:</span> {result.domain}</p>
              <p><span className="font-medium text-gray-800 dark:text-gray-200">Date:</span> {new Date(result.created_at).toLocaleDateString()}</p>
              <p><span className="font-medium text-gray-800 dark:text-gray-200">Reachability:</span> {result.reachability}</p>
            </div>
          </div>

          <FeedbackForm analysisId={result.id || result.analysisId} />
        </div>

        <div className="md:col-span-2">
          <DeepReport result={result} />
        </div>
      </div>
    </div>
  );
}
