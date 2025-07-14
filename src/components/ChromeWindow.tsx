import React from "react";

export default function ChromeWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 bg-white/90 backdrop-blur-md overflow-hidden">
      {/* Chrome top bar */}
      <div className="flex items-center gap-2 h-8 sm:h-10 px-3 sm:px-4 bg-gray-100 border-b border-gray-200">
        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400" />
        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400" />
        <span className="ml-3 sm:ml-4 text-gray-400 text-xs">documet</span>
      </div>
      <div className="bg-black flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
        {children}
      </div>
    </div>
  );
} 