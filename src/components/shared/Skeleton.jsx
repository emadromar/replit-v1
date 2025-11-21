import React from 'react';

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Setup Guide Skeleton */}
      <Skeleton className="h-24 w-full" />
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Skeleton className="h-48 w-full" />
         <Skeleton className="h-48 w-full" />
      </div>

      {/* Analytics Skeleton */}
      <Skeleton className="h-64 w-full" />
    </div>
  );
}