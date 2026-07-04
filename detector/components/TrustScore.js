'use client';

import { CheckCircle2 } from 'lucide-react';

export default function TrustScore({ score, signals }) {
  const maxScore = 10;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  let colorClass = 'bg-red-500';
  if (score >= 4) colorClass = 'bg-yellow-500';
  if (score >= 7) colorClass = 'bg-green-500';

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Trust Indicators</h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span>Trust Score</span>
          <span>{score} / {maxScore}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
          <div
            className={`${colorClass} h-3 rounded-full transition-all duration-1000`}
            style={{ width: `\${percentage}%` }}
          ></div>
        </div>
      </div>

      {signals && signals.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signals.map((signal, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No significant trust indicators found for this website.
        </p>
      )}
    </div>
  );
}
