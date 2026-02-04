import { Home, ScanBarcode, ShoppingCart, Store, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/search', icon: Search, label: 'Recherche' },
  { path: '/scan', icon: ScanBarcode, label: 'Scanner', isMain: true },
  { path: '/lists', icon: ShoppingCart, label: 'Listes' },
  { path: '/vendors', icon: Store, label: 'Vendeurs' },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -mt-6"
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-elevated">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center py-2 px-4 relative"
              whileTap={{ scale: 0.95 }}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs mt-1 transition-colors',
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
