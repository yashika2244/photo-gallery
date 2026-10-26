import React from 'react';
import { Gallery } from './components/Gallery';

/**
 * App Component
 * 
 * Top-level application shell providing:
 * - Semantic layout structure (header, main container, footer)
 * - Navigation brand bar with subtle styling
 * - Gallery mounting without direct API fetch logic
 */
export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Inline SVG Camera/Gallery Brand Icon */}
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Celebrare
              </span>
              <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                Gallery
              </span>
            </div>
          </div>

          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            Picsum Photos API &bull; 30 Curated Shots
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Gallery />
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>
            Celebrare Frontend React Internship Assignment &bull; Built with React, Vite &amp; Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
