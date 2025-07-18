import React from "react";

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white bg-opacity-80">
    <div className="flex flex-col items-center">
      <img
        src="/logo.svg"
        alt="Loading..."
        className="w-24 h-24 animate-spin-slow mb-4"
        style={{ animation: 'spin 2s linear infinite' }}
      />
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin 2s linear infinite; }
      `}</style>
    </div>
  </div>
);

export default LoadingOverlay; 