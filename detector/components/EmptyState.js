'use client';

import { Shield } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-16 text-center text-gray-500 dark:text-gray-400">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <Shield size={40} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Ready to inspect</h3>
      <p className="max-w-md mx-auto">
        Paste a questionable URL above. We will fetch the site safely and analyze it for phishing indicators, deceptive patterns, and security flaws.
      </p>
    </div>
  );
}
