export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8 animate-pulse">
      <div className="px-5 pt-6 pb-4">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48 hidden lg:block" />
      </div>
      <div className="px-5 lg:px-8">
        {/* Header Card Skeleton */}
        <div className="border border-gray-100 rounded-2xl p-4 mb-4 flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        
        {/* Section skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-6">
            <Skeleton className="h-5 w-40 mb-3" />
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
