'use client';

export default function LoadingState() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col items-center justify-center p-12 text-center animate-pulse">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h3 className="text-2xl font-bold mb-2">Analyzing Target</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        Our engine is currently inspecting the URL, resolving DNS, checking TLS certificates, and looking for risk signals. This usually takes 5-15 seconds.
      </p>
    </div>
  );
}
