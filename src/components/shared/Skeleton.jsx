// src/components/shared/Skeleton.jsx

import React from 'react';

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Skeleton className="h-48 w-full" />
         <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

// --- NEW: Product Grid Skeleton ---
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Skeleton className="h-44 w-full" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
               <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex gap-2 pt-4">
               <Skeleton className="h-10 flex-1" />
               <Skeleton className="h-10 flex-1" />
               <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}