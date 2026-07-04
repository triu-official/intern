'use client';

import { Clock, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RecentScans({ scans, onSelect }) {
  if (!scans || scans.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 mb-10">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-2">
        <Clock className="text-primary" /> Recent Inspections
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {scans.map((scan) => {
          let Icon = ShieldCheck;
          let colorClass = 'text-green-500 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-900';

          if (scan.label === 'Phishing') {
            Icon = ShieldAlert;
            colorClass = 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900';
          } else if (scan.label === 'Suspicious') {
            Icon = AlertTriangle;
            colorClass = 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-900';
          }

          return (
            <button
              key={scan.id}
              onClick={() => onSelect(scan.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left hover:scale-[1.02] transition-transform ${colorClass}`}
            >
              <Icon size={24} className="shrink-0" />
              <div className="overflow-hidden">
                <p className="font-semibold truncate text-sm text-gray-800 dark:text-gray-200" title={scan.domain}>
                  {scan.domain}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-bold uppercase">{scan.label}</span>
                  <span className="text-xs opacity-70">Score: {scan.risk_score}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
