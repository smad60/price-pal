import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface MainLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function MainLayout({ children, hideNav = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-lg mx-auto">{children}</main>
      {!hideNav && <BottomNavigation />}
    </div>
  );
}
