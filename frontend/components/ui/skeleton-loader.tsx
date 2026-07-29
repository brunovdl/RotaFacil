'use client';

export function SkeletonBox({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-shimmer rounded-xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex justify-between items-center">
        <SkeletonBox className="w-24 h-4" />
        <SkeletonBox className="w-12 h-4 rounded-full" />
      </div>
      <SkeletonBox className="w-3/4 h-6" />
      <div className="flex gap-3">
        <SkeletonBox className="w-16 h-3" />
        <SkeletonBox className="w-16 h-3" />
      </div>
    </div>
  );
}

export function RouteCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1.5 flex-1">
          <SkeletonBox className="w-40 h-5" />
          <SkeletonBox className="w-28 h-3" />
        </div>
        <SkeletonBox className="w-16 h-5 rounded-full" />
      </div>
      <div className="flex gap-4">
        <SkeletonBox className="w-20 h-4" />
        <SkeletonBox className="w-20 h-4" />
        <SkeletonBox className="w-20 h-4" />
      </div>
    </div>
  );
}

export function RouteDetailSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <SkeletonBox className="w-20 h-8" />
        <div className="flex gap-2">
          <SkeletonBox className="w-20 h-8" />
          <SkeletonBox className="w-8 h-8" />
        </div>
      </div>

      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
      >
        <SkeletonBox className="w-32 h-4" />
        <SkeletonBox className="w-48 h-7" />
        <div className="grid grid-cols-3 gap-2">
          <SkeletonBox className="h-14" />
          <SkeletonBox className="h-14" />
          <SkeletonBox className="h-14" />
        </div>
      </div>

      <SkeletonBox className="w-full h-56 rounded-2xl" />

      <div className="space-y-2">
        <RouteCardSkeleton />
        <RouteCardSkeleton />
        <RouteCardSkeleton />
      </div>
    </div>
  );
}
