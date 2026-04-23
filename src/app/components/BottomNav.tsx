import { Home, Plus, Calendar, BarChart3, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/new', icon: Plus, label: 'New', highlight: true },
    { path: '/plans', icon: Calendar, label: 'Plans' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe z-[100] pointer-events-auto">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full p-4 shadow-lg"
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 relative"
            >
              <motion.div
                className="flex flex-col items-center"
                whileTap={{ scale: 0.9 }}
              >
                <div className={`relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] mt-1 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
