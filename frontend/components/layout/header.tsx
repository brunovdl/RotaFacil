'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoIcon, LogoutIcon } from '@/components/ui/icons';

export function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserName(parsed.name?.split(' ')[0] || '');
      } catch {}
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(15, 15, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
        {/* Left: Logo + saudação */}
        <div className="flex items-center gap-3">
          <LogoIcon size={32} />
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {greeting}, {userName || 'motorista'}
            </p>
            <h1 className="text-base font-bold gradient-text">RotaFácil</h1>
          </div>
        </div>

        {/* Right: logout */}
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl transition-all duration-200 press-effect"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-muted)',
          }}
          title="Sair"
        >
          <LogoutIcon size={18} />
        </button>
      </div>
    </header>
  );
}
