'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Calendar, HeartPulse, Wallet, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { dictionaries } from '@/lib/dictionaries';

export default function BottomNav() {
  const pathname = usePathname();
  const { language, setLanguage } = useAppStore();
  const t = dictionaries[language].nav;
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navItems = [
    { name: t.dashboard, path: '/', icon: Home },
    { name: t.calendar, path: '/calendar', icon: Calendar },
    { name: t.cycle, path: '/cycle', icon: HeartPulse },
    { name: t.finance, path: '/finance', icon: Wallet },
  ];

  const handleLanguageToggle = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
    setShowLangMenu(false);
  };

  if (pathname === '/auth' || pathname === '/login') {
    return null;
  }

  return (
    <>
      <div className="absolute top-4 right-6 z-50">
        <button 
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition-colors border border-slate-100"
        >
          <Globe size={20} />
        </button>
        <AnimatePresence>
          {showLangMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 min-w-[120px] flex flex-col gap-1"
            >
              <button 
                onClick={() => { setLanguage('id'); setShowLangMenu(false); }}
                className={`text-left px-3 py-2 text-sm font-bold rounded-lg ${language === 'id' ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Indonesia
              </button>
              <button 
                onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                className={`text-left px-3 py-2 text-sm font-bold rounded-lg ${language === 'en' ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                English
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 pb-8 z-50">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path} className="relative flex flex-col items-center p-2">
                <Icon 
                  size={24} 
                  className={`transition-colors z-10 ${isActive ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`} 
                />
                <span className={`text-[10px] mt-1 z-10 font-medium ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-x-0 bottom-0 top-0 bg-rose-50 rounded-2xl -z-0"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
