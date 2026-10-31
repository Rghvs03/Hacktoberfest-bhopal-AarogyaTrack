import React from 'react';

/**
 * High-craft clinical skeleton screens matching the Hallmark design system.
 * Uses gentle pulse animation with clinical teal/slate hues.
 */

export const PatientFileSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      {/* Top Navigation Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-44 bg-slate-200/80 rounded-lg"></div>
        <div className="h-8 w-36 bg-clinical-100/70 rounded-lg"></div>
      </div>

      {/* Patient Header Card Skeleton */}
      <div className="card-clinical p-6 bg-white space-y-5 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-56 bg-slate-200 rounded-md"></div>
              <div className="h-6 w-28 bg-clinical-100/80 rounded border border-clinical-200/60"></div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-4 w-24 bg-slate-200/70 rounded"></div>
              <div className="h-4 w-28 bg-slate-200/70 rounded"></div>
              <div className="h-4 w-32 bg-slate-200/70 rounded"></div>
            </div>
          </div>
          <div className="h-8 w-36 bg-slate-100 rounded-lg"></div>
        </div>

        {/* Baseline History Skeleton */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-4 w-80 max-w-full bg-slate-100 rounded"></div>
        </div>
      </div>

      {/* Tabs Navigation Skeleton */}
      <div className="flex border-b border-slate-200 space-x-6">
        <div className="h-10 w-48 bg-slate-200 rounded-t-lg"></div>
        <div className="h-10 w-44 bg-slate-100 rounded-t-lg"></div>
        <div className="h-10 w-44 bg-slate-100 rounded-t-lg"></div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="card-clinical p-6 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-52 bg-slate-200 rounded"></div>
            <div className="h-3 w-80 max-w-full bg-slate-100 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
            <div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
            <div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
          </div>
        </div>

        {/* Mock Chart / Timeline Placeholder with Shimmering Columns */}
        <div className="h-64 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 flex flex-col justify-end space-y-3">
          <div className="flex items-end justify-between h-44 px-8 gap-6">
            <div className="w-14 bg-slate-200/70 rounded-t h-28"></div>
            <div className="w-14 bg-clinical-200/50 rounded-t h-36"></div>
            <div className="w-14 bg-slate-200/70 rounded-t h-40"></div>
            <div className="w-14 bg-clinical-200/50 rounded-t h-32"></div>
            <div className="w-14 bg-slate-200/70 rounded-t h-44"></div>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded"></div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="h-3 w-40 bg-slate-100 rounded"></div>
          <div className="h-3 w-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const AiSummarySkeleton: React.FC = () => {
  return (
    <div className="card-clinical p-6 bg-white space-y-5 border-l-4 border-l-clinical-600 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-60 bg-slate-200 rounded"></div>
            <div className="h-5 w-36 bg-clinical-100 text-clinical-800 rounded font-semibold text-[10px] px-2 py-0.5"></div>
          </div>
          <div className="h-3 w-56 bg-slate-100 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-28 bg-emerald-100 rounded-lg"></div>
          <div className="h-7 w-20 bg-slate-100 rounded-lg"></div>
        </div>
      </div>

      {/* 1. Overview Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-36 bg-slate-200 rounded font-mono"></div>
        <div className="h-4 w-full bg-slate-100 rounded"></div>
        <div className="h-4 w-11/12 bg-slate-100 rounded"></div>
        <div className="h-4 w-4/5 bg-slate-100 rounded"></div>
      </div>

      {/* 2. Recorded Conditions Skeleton */}
      <div className="space-y-2 pt-2">
        <div className="h-3 w-40 bg-slate-200 rounded font-mono"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-32 bg-slate-100 rounded-full"></div>
          <div className="h-6 w-40 bg-slate-100 rounded-full"></div>
          <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
        </div>
      </div>

      {/* 3. Measurement Trends Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-3 w-48 bg-slate-200 rounded font-mono"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-full bg-slate-100 rounded"></div>
            <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-full bg-slate-100 rounded"></div>
            <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>

      {/* 4. Missing Information Skeleton */}
      <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/60 space-y-2">
        <div className="h-4 w-44 bg-amber-200/70 rounded"></div>
        <div className="h-3 w-full bg-amber-100/60 rounded"></div>
        <div className="h-3 w-2/3 bg-amber-100/60 rounded"></div>
      </div>

      {/* 5. Clinician Review Checklist Skeleton */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="h-4 w-52 bg-slate-200 rounded"></div>
        <div className="h-3 w-full bg-slate-100 rounded"></div>
        <div className="h-3 w-4/5 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-clinical p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
            <div className="h-3 w-32 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Priority Triage Banner */}
      <div className="card-clinical p-5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-44 bg-slate-200 rounded"></div>
          <div className="h-4 w-28 bg-slate-100 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
              <div className="h-3 w-48 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Directory Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="h-5 w-64 bg-slate-200 rounded"></div>
            <div className="h-3 w-72 bg-slate-100 rounded"></div>
          </div>
          <div className="h-9 w-36 bg-clinical-100 rounded-lg"></div>
        </div>

        {/* Filter Pills + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="h-9 w-72 bg-slate-100 rounded-lg"></div>
          <div className="h-9 flex-1 bg-slate-100 rounded-lg"></div>
        </div>

        {/* 6 Patient Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-clinical p-5 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-clinical-50 border border-clinical-100 rounded"></div>
                <div className="h-4 w-20 bg-slate-100 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-36 bg-slate-200 rounded"></div>
                <div className="h-3 w-28 bg-slate-100 rounded"></div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="h-2.5 w-20 bg-slate-200 rounded"></div>
                <div className="h-3.5 w-full bg-slate-100 rounded"></div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
                <div className="h-4 w-28 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

