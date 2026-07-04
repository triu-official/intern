'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Info, AlertOctagon, Code, Globe, Lock, FileText, Search } from 'lucide-react';

function Section({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3 font-semibold text-gray-800 dark:text-gray-200">
          <Icon size={18} className="text-primary" />
          {title}
        </div>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {open && (
        <div className="p-4 bg-card text-sm text-gray-700 dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
}

export default function DeepReport({ result }) {
  if (!result) return null;

  const fs = result.features_summary || {};
  const dp = result.deep_analysis || {};

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Search className="text-primary" /> Deep Analysis Report
      </h3>

      {fs.ai && (
        <div className="mb-6 p-5 rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30">
          <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
            ✨ AI Assessment Summary
          </h4>
          <p className="text-indigo-900 dark:text-indigo-200 mb-4">{fs.ai.ai_summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {fs.ai.ai_red_flags?.length > 0 && (
              <div>
                <strong className="text-red-700 dark:text-red-400 block mb-1">Red Flags noted by AI:</strong>
                <ul className="list-disc pl-5 text-red-600 dark:text-red-300">
                  {fs.ai.ai_red_flags.map((rf, i) => <li key={i}>{rf}</li>)}
                </ul>
              </div>
            )}
            {fs.ai.ai_trust_indicators?.length > 0 && (
              <div>
                <strong className="text-green-700 dark:text-green-400 block mb-1">Trust Indicators noted by AI:</strong>
                <ul className="list-disc pl-5 text-green-600 dark:text-green-300">
                  {fs.ai.ai_trust_indicators.map((ti, i) => <li key={i}>{ti}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {result.reasons && result.reasons.length > 0 && (
        <Section title="Risk Signals & Warnings" icon={AlertOctagon}>
          <ul className="list-disc pl-5 space-y-2 text-red-600 dark:text-red-400">
            {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Section>
      )}

      <Section title="Domain & URL Structure" icon={Globe}>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-semibold text-gray-500">Domain:</span> {result.domain}</div>
          <div><span className="font-semibold text-gray-500">Length:</span> {fs.url?.urlLength || 'N/A'} chars</div>
          <div><span className="font-semibold text-gray-500">Subdomains:</span> {fs.url?.subdomainCount || 0}</div>
          <div><span className="font-semibold text-gray-500">IP Hostname:</span> {fs.url?.isIpHostname ? 'Yes' : 'No'}</div>
          <div><span className="font-semibold text-gray-500">Shortener:</span> {fs.url?.isShortener ? 'Yes' : 'No'}</div>
          <div><span className="font-semibold text-gray-500">Punycode:</span> {fs.url?.isPunycode ? 'Yes' : 'No'}</div>
        </div>
      </Section>

      <Section title="Registration & WHOIS" icon={Info}>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-semibold text-gray-500">Age:</span> {fs.whois?.ageDays ? `\${fs.whois.ageDays} days` : 'Unknown'}</div>
          <div className="col-span-2"><span className="font-semibold text-gray-500">Registrar:</span> {fs.whois?.registrar || 'Unknown'}</div>
        </div>
      </Section>

      <Section title="Connection & Security (TLS/DNS)" icon={Lock}>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-semibold text-gray-500">TLS Valid:</span> {fs.tls ? (fs.tls.valid ? 'Yes' : 'No') : 'N/A'}</div>
          <div className="col-span-2"><span className="font-semibold text-gray-500">TLS Issuer:</span> {fs.tls?.issuer || 'N/A'}</div>
          <div><span className="font-semibold text-gray-500">IPv4 Records:</span> {fs.dns?.ipv4?.length || 0}</div>
          <div><span className="font-semibold text-gray-500">Email Security:</span> {(fs.dns?.hasSpf || fs.dns?.hasDmarc) ? 'Present' : 'Missing'}</div>
          <div><span className="font-semibold text-gray-500">Status Code:</span> {result.status_code || 'N/A'}</div>
        </div>
        {result.redirect_chain && result.redirect_chain.length > 0 && (
          <div className="mt-4">
            <span className="font-semibold text-gray-500 block mb-2">Redirect Chain:</span>
            <ul className="text-xs space-y-1 font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded">
              {result.redirect_chain.map((rc, i) => (
                <li key={i}>{rc.status} &rarr; {rc.to}</li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Page Content & Structure" icon={FileText}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2"><span className="font-semibold text-gray-500">Title:</span> {dp.pageInfo?.title || 'N/A'}</div>
          <div className="col-span-2"><span className="font-semibold text-gray-500">Inferred Offering:</span> {dp.pageInfo?.inferredOfferings || 'N/A'}</div>
          <div><span className="font-semibold text-gray-500">Forms:</span> {fs.content?.formCount || 0}</div>
          <div><span className="font-semibold text-gray-500">Password Field:</span> {fs.content?.hasPasswordForm ? 'Yes' : 'No'}</div>
          <div><span className="font-semibold text-gray-500">External Forms:</span> {fs.content?.hasExternalFormAction ? 'Yes' : 'No'}</div>
          <div><span className="font-semibold text-gray-500">iFrames:</span> {fs.content?.iframeCount || 0}</div>
          <div><span className="font-semibold text-gray-500">External Links:</span> {fs.content?.externalLinks || 0}</div>
          <div><span className="font-semibold text-gray-500">Dead Links:</span> {fs.content?.deadLinks || 0}</div>
        </div>
      </Section>

      <Section title="Raw Data Summary" icon={Code}>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap">
          {JSON.stringify({
            id: result.id,
            url: result.normalized_url,
            reachability: result.reachability,
            error: result.error_type
          }, null, 2)}
        </pre>
      </Section>
    </div>
  );
}
