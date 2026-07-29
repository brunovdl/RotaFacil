import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SkeletonBox, CardSkeleton, RouteCardSkeleton } from '@/components/ui/skeleton-loader';

export default function DashboardLoading() {
  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />
      <main className="px-4 pt-4 pb-28 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <SkeletonBox className="w-full h-40 rounded-2xl" />
        <SkeletonBox className="w-full h-16 rounded-2xl" />
        <div className="space-y-2">
          <SkeletonBox className="w-28 h-4" />
          <RouteCardSkeleton />
          <RouteCardSkeleton />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
