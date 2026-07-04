'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export default function FeedbackForm({ analysisId }) {
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [note, setNote] = useState('');

  const handleFeedback = async (feedbackType) => {
    setStatus('submitting');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, feedback: feedbackType, note })
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
        <p className="text-green-700 dark:text-green-400 font-medium">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <MessageSquare size={18} /> Was this result accurate?
      </h3>

      <div className="mb-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional: Why did you choose this?"
          className="w-full bg-transparent border border-border rounded-lg p-3 text-sm focus:border-primary outline-none resize-none h-20"
          disabled={status === 'submitting'}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleFeedback('satisfied')}
          disabled={status === 'submitting'}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/40 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 py-2 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-green-200 dark:hover:border-green-800"
        >
          <ThumbsUp size={16} /> Accurate
        </button>
        <button
          onClick={() => handleFeedback('not_satisfied')}
          disabled={status === 'submitting'}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-2 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-200 dark:hover:border-red-800"
        >
          <ThumbsDown size={16} /> Inaccurate
        </button>
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-xs mt-3 text-center">Failed to submit feedback. Try again.</p>
      )}
    </div>
  );
}
