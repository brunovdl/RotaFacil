'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, RoutesIcon, AddRouteIcon, ReportsIcon, AccountIcon } from '@/components/ui/icons';

const navItems = [
  { href: '/dashboard', label: 'Início',     Icon: HomeIcon },
  { href: '/history',   label: 'Rotas',      Icon: RoutesIcon },
  { href: '/routes/new', label: '',          Icon: AddRouteIcon, isAction: true },
  { href: '/reports',   label: 'Relatórios', Icon: ReportsIcon },
  { href: '/settings',  label: 'Conta',      Icon: AccountIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
      style={{
        background: 'rgba(15, 15, 26, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, Icon, isAction }) => {
          const isActive = pathname === href || (!isAction && pathname.startsWith(href + '/'));

          if (isAction) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center w-14 h-14 -mt-6 rounded-2xl transition-all duration-300 press-effect relative"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.5), 0 0 0 4px rgba(15,15,26,1)',
                }}
              >
                {/* Brilho interno */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
                    pointerEvents: 'none',
                  }}
                />
                <Icon className="text-white relative z-10" size={24} />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center px-3 py-1 gap-1 transition-all duration-200 press-effect relative"
            >
              {/* Indicator dot */}
              {isActive && (
                <span
                  className="absolute top-0.5 w-1 h-1 rounded-full"
                  style={{ background: '#7C3AED' }}
                />
              )}
              <span
                className="transition-all duration-200"
                style={{ color: isActive ? '#A78BFA' : 'var(--text-muted)' }}
              >
                <Icon size={22} />
              </span>
              <span
                className="text-xs font-medium transition-all duration-200"
                style={{ color: isActive ? '#A78BFA' : 'var(--text-muted)', fontSize: '10px' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
