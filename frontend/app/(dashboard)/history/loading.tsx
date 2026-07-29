import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SkeletonBox, RouteCardSkeleton } from '@/components/ui/skeleton-loader';

export default function HistoryLoading() {
  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />
      <main className="px-4 pt-4 pb-28 space-y-4">
        <div className="flex justify-between items-center">
          <SkeletonBox className="w-36 h-6" />
          <SkeletonBox className="w-24 h-8 rounded-xl" />
        </div>
        <div className="space-y-3">
          <RouteCardSkeleton />
          <RouteCardSkeleton />
          <RouteCardSkeleton />
          <RouteCardSkeleton />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
