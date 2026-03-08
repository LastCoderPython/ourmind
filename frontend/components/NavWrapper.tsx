'use client';

// Navigation Wrapper - Conditionally shows BottomNav

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { ReactNode } from 'react';

const authRoutes = ['/login', '/signup'];

export function NavWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  return (
    <div className={isAuthRoute ? '' : 'pb-20'}>
      {children}
      {!isAuthRoute && <BottomNav />}
    </div>
  );
}
