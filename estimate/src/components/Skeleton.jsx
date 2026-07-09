function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 px-3 py-3 bg-gray-100 rounded-t-lg">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
      {/* Rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-3 py-4 border-b border-gray-100">
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-8 rounded" />
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card p-4 space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-8" />
        </div>
      ))}
    </div>
  )
}

export function RFPHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="w-96 h-8 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg bg-white/10 p-4 space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-20 h-5" />
              <Skeleton className="w-28 h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skeleton
