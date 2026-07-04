'use client';

import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function VerdictBanner({ label, riskScore, verdictText }) {
  let bgColor = 'bg-gray-100 dark:bg-gray-800';
  let textColor = 'text-gray-800 dark:text-gray-100';
  let borderColor = 'border-gray-200 dark:border-gray-700';
  let Icon = ShieldCheck;
  let iconColor = 'text-gray-500';

  if (label === 'Safe') {
    bgColor = 'bg-green-50 dark:bg-green-900/20';
    textColor = 'text-green-800 dark:text-green-300';
    borderColor = 'border-green-200 dark:border-green-800';
    Icon = ShieldCheck;
    iconColor = 'text-green-600 dark:text-green-400';
  } else if (label === 'Suspicious') {
    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
    textColor = 'text-yellow-800 dark:text-yellow-300';
    borderColor = 'border-yellow-200 dark:border-yellow-800';
    Icon = AlertTriangle;
    iconColor = 'text-yellow-600 dark:text-yellow-400';
  } else if (label === 'Phishing') {
    bgColor = 'bg-red-50 dark:bg-red-900/20';
    textColor = 'text-red-800 dark:text-red-300';
    borderColor = 'border-red-200 dark:border-red-800';
    Icon = ShieldAlert;
    iconColor = 'text-red-600 dark:text-red-400';
  }

  return (
    <div className={`p-6 rounded-2xl border ${bgColor} ${borderColor} mb-6 shadow-sm`}>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className={`p-4 rounded-full bg-white dark:bg-black/20 shadow-sm ${iconColor}`}>
          <Icon size={48} strokeWidth={1.5} />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-2">
            <h2 className={`text-3xl font-bold uppercase tracking-wider ${textColor}`}>
              {label}
            </h2>
            <span className="text-sm font-medium opacity-70">
              Risk Score: {riskScore} / 100
            </span>
          </div>
          <p className="text-lg opacity-90 font-medium">
            {verdictText}
          </p>
        </div>
      </div>
    </div>
  );
}
