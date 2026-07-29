import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { RouteDetailSkeleton } from '@/components/ui/skeleton-loader';

export default function RouteDetailLoading() {
  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />
      <main className="px-4 pt-4 pb-28">
        <RouteDetailSkeleton />
      </main>
      <BottomNav />
    </div>
  );
}
