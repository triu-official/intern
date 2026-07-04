'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, ChevronDown, ChevronUp } from 'lucide-react';

export default function TerminalLogs({ logs, isAnalyzing }) {
  const [expanded, setExpanded] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, expanded]);

  const copyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.step}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'warn': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  if (logs.length === 0 && !isAnalyzing) return null;

  return (
    <div className="w-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-gray-800 shadow-2xl font-mono text-sm my-6 transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-gray-800 select-none">
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal size={16} />
          <span className="font-semibold text-xs tracking-wider">LIVE_INSPECTION_TERMINAL</span>
          {isAnalyzing && (
            <span className="flex h-2 w-2 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copyLogs} className="text-gray-500 hover:text-gray-300 transition-colors" title="Copy Logs">
            <Copy size={14} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-300 transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div ref={scrollRef} className="p-4 h-64 overflow-y-auto space-y-1.5 custom-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 text-gray-300 break-all leading-tight">
              <span className="text-gray-600 shrink-0">
                {new Date(log.timestamp).toISOString().substring(11, 23)}
              </span>
              <span className={`font-bold w-20 shrink-0 ${getLevelColor(log.level)}`}>
                {log.step}
              </span>
              <span className="text-gray-200">
                {log.message}
                {log.data && (
                  <span className="text-gray-500 ml-2 block sm:inline">
                    {JSON.stringify(log.data)}
                  </span>
                )}
              </span>
            </div>
          ))}
          {isAnalyzing && (
            <div className="text-gray-500 animate-pulse mt-2">_</div>
          )}
        </div>
      )}
    </div>
  );
}
