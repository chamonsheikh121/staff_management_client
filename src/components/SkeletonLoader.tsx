import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  type?: 'page' | 'card' | 'list' | 'form' | 'table';
  count?: number;
}

export function SkeletonLoader({ type = 'page', count = 5 }: SkeletonLoaderProps) {
  const skeletonStyle = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .skeleton-loading {
      animation: shimmer 2s infinite;
    }

    /* Light mode skeleton */
    .light .skeleton-loading {
      background: linear-gradient(
        90deg,
        #e5e7eb 0%,
        #f3f4f6 20%,
        #e5e7eb 40%,
        #e5e7eb 100%
      );
      background-size: 1000px 100%;
    }

    /* Dark mode skeleton */
    .dark .skeleton-loading {
      background: linear-gradient(
        90deg,
        #374151 0%,
        #4b5563 20%,
        #374151 40%,
        #374151 100%
      );
      background-size: 1000px 100%;
    }

    /* Fallback for prefers-color-scheme */
    @media (prefers-color-scheme: light) {
      .skeleton-loading {
        background: linear-gradient(
          90deg,
          #e5e7eb 0%,
          #f3f4f6 20%,
          #e5e7eb 40%,
          #e5e7eb 100%
        );
        background-size: 1000px 100%;
      }
    }

    @media (prefers-color-scheme: dark) {
      .skeleton-loading {
        background: linear-gradient(
          90deg,
          #374151 0%,
          #4b5563 20%,
          #374151 40%,
          #374151 100%
        );
        background-size: 1000px 100%;
      }
    }
  `;

  if (type === 'table') {
    return (
      <div className="w-full space-y-3">
        <style>{skeletonStyle}</style>
        {/* Header row */}
        <div className="flex gap-3 border rounded-lg p-4 dark:border-gray-700">
          <div className="flex-1">
            <div className="skeleton-loading h-4 w-24 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="flex-1">
            <div className="skeleton-loading h-4 w-28 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="flex-1">
            <div className="skeleton-loading h-4 w-24 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="flex-1">
            <div className="skeleton-loading h-4 w-20 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
        
        {/* Table rows */}
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex gap-3 border rounded-lg p-4 dark:border-gray-700">
            <div className="flex-1">
              <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-1">
              <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-1">
              <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-1">
              <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        <style>{skeletonStyle}</style>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 dark:border-gray-700">
            <div className="skeleton-loading h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="skeleton-loading h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="skeleton-loading h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <style>{skeletonStyle}</style>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 dark:border-gray-700">
            <div className="skeleton-loading h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="skeleton-loading h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="skeleton-loading h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="skeleton-loading h-8 w-full rounded mt-4 bg-gray-300 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-6">
        <style>{skeletonStyle}</style>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton-loading h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  // Default page loader
  return (
    <div className="min-h-[60vh] space-y-6">
      <style>{skeletonStyle}</style>
      {/* Header */}
      <div className="space-y-3">
        <div className="skeleton-loading h-8 w-1/3 rounded bg-gray-300 dark:bg-gray-600" />
        <div className="skeleton-loading h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Filters/Controls */}
      <div className="flex gap-3">
        <div className="skeleton-loading h-10 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="skeleton-loading h-10 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Table */}
      <div className="space-y-3 mt-8">
        <div className="flex gap-3 border rounded-lg p-4 dark:border-gray-700">
          <div className="flex-1">
            <div className="skeleton-loading h-4 w-24 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="flex-1">
            <div className="skeleton-loading h-4 w-28 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="flex-1">
            <div className="skeleton-loading h-4 w-24 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 border rounded-lg p-4 dark:border-gray-700">
            <div className="flex-1">
              <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-1">
              <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-1">
              <div className="skeleton-loading h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
