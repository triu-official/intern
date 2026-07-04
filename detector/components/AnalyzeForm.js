'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function AnalyzeForm({ onAnalyze, isAnalyzing }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isAnalyzing) {
      onAnalyze(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mt-8 mb-4 relative z-10">
      <div className="relative flex items-center shadow-xl rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 focus-within:border-primary dark:focus-within:border-primary transition-colors overflow-hidden pl-6 pr-2 py-2">
        <Search className="text-gray-400 shrink-0" size={24} />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link, domain, or URL to inspect..."
          className="w-full bg-transparent border-none outline-none px-4 py-3 text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400"
          disabled={isAnalyzing}
          required
        />
        <button
          type="submit"
          disabled={isAnalyzing || !url.trim()}
          className="bg-primary hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-full px-8 py-3 font-semibold transition-colors flex items-center justify-center min-w-[140px]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Analyzing
            </>
          ) : (
            'Inspect'
          )}
        </button>
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
        We will securely analyze the URL, check its reputation, and safely inspect its contents without exposing you to risks.
      </p>
    </form>
  );
}
