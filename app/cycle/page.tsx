'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useRouter } from 'next/navigation';
import { differenceInDays, format } from 'date-fns';
import { Settings, X } from 'lucide-react';

export default function CyclePage() {
  const { currentUser, cycle, fetchCycleData, updateCycleHistory } = useAppStore();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [pastDate1, setPastDate1] = useState('');
  const [pastDate2, setPastDate2] = useState('');
  const [pastDate3, setPastDate3] = useState('');
  const [periodLength, setPeriodLength] = useState(5);
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.coupleId) {
      fetchCycleData();
    }
  }, [currentUser, router, fetchCycleData]);
  
  // Set default values for modal state when opened
  useEffect(() => {
    if (isSettingsOpen && cycle?.startDate) {
      setPastDate3(format(new Date(cycle.startDate), 'yyyy-MM-dd'));
      setPeriodLength(cycle.periodLength || 5);
    }
  }, [isSettingsOpen, cycle]);

  const today = new Date();
  const startDate = new Date(cycle.startDate || new Date());
  // Calculate day securely so we don't end up with huge numbers if no recent update
  let currentDay = differenceInDays(today, startDate) + 1;
  if (currentDay < 1) currentDay = 1;
  // If we overran cycle, simulate a new one (modular arithmetic for mock)
  const cycleLen = cycle.cycleLength || 28;
  currentDay = ((currentDay - 1) % cycleLen) + 1;
  
  let phase = 'Menstruation';
  let phaseColor = 'bg-rose-50';
  let borderColor = 'border-rose-100';
  let textColor = 'text-rose-900';
  let accentColor = 'text-rose-500';
  let blobColor = 'bg-rose-200/40';
  let description = "Low energy. Comfort, warmth, and gentle communication highly appreciated.";
  
  const perLen = cycle.periodLength || 5;
  if (currentDay > perLen && currentDay <= Math.round(cycleLen / 2) - 1) {
    phase = 'Follicular';
    phaseColor = 'bg-sky-50';
    borderColor = 'border-sky-100';
    textColor = 'text-sky-900';
    accentColor = 'text-sky-500';
    blobColor = 'bg-sky-200/40';
    description = "Energy rising. Great time for trying new things, active dates, and deep conversations.";
  } else if (currentDay >= Math.round(cycleLen / 2) && currentDay <= Math.round(cycleLen / 2) + 3) {
    phase = 'Ovulation';
    phaseColor = 'bg-emerald-50';
    borderColor = 'border-emerald-100';
    textColor = 'text-emerald-900';
    accentColor = 'text-emerald-500';
    blobColor = 'bg-emerald-200/40';
    description = "High energy & mood. Most social and communicative phase. Great time for going out!";
  } else if (currentDay > Math.round(cycleLen / 2) + 3) {
    phase = 'Luteal';
    phaseColor = 'bg-indigo-50';
    borderColor = 'border-indigo-100';
    textColor = 'text-indigo-900';
    accentColor = 'text-indigo-500';
    blobColor = 'bg-indigo-200/40';
    description = "Energy winding down towards the end. Might feel inward. Patience and understanding are key.";
  }

  // Calculate rotation for a circular progress (360 degrees)
  const rotation = (currentDay / cycleLen) * 360;

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    await updateCycleHistory({
      pastDate1: pastDate1 || undefined,
      pastDate2: pastDate2 || undefined,
      pastDate3: pastDate3,
      periodLength: Number(periodLength),
      startDate: pastDate3 // fallback
    });
    setIsSubmitting(false);
    setIsSettingsOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 px-6 pt-12 pb-24 overflow-y-auto w-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Cycle Tracker</h2>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm border border-slate-100 transition-colors">
          <Settings size={20} />
        </button>
      </div>
      
      <div className={`${phaseColor} border ${borderColor} rounded-[32px] p-6 shadow-sm mb-8 relative overflow-hidden transition-colors`}>
        <div className="relative z-10 text-center">
            <span className={`text-xs font-bold ${accentColor} uppercase tracking-widest`}>Current Phase</span>
            <div className={`text-4xl font-black ${textColor} mt-2 mb-1`}>{phase}</div>
            <span className={`text-sm ${accentColor} font-medium`}>Day {currentDay} of {cycleLen}</span>
            
            <p className={`text-xs ${textColor} opacity-80 mt-6 leading-relaxed bg-white/60 p-4 rounded-2xl shadow-sm backdrop-blur-sm`}>
              {description}
            </p>
        </div>
        <div className={`absolute -top-10 -left-10 w-32 h-32 ${blobColor} rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${blobColor} rounded-full blur-3xl`}></div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 self-start mb-6">Cycle Progress</h3>
        
        {/* Simple Circular Timeline */}
        <div className="relative w-48 h-48 rounded-full border-[8px] border-slate-50 flex items-center justify-center">
          {/* Progress Indicator dot */}
          <div 
            className="absolute top-0 w-full h-full pointer-events-none transition-transform duration-700 ease-out" 
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="w-5 h-5 bg-slate-800 rounded-full absolute top-0 left-1/2 -ml-2.5 -mt-3 shadow-md border-2 border-white"></div>
          </div>
          
          <div className="text-center">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{phase}</span>
            <div className="text-3xl font-black text-slate-800 mt-1">{currentDay}</div>
          </div>
        </div>
        <div className="w-full flex justify-between mt-6 text-[10px] font-bold text-slate-400 uppercase">
           <span>Day 1</span>
           <span>Day {Math.round(cycleLen / 2)}</span>
           <span>Day {cycleLen}</span>
        </div>
      </div>

      {/* Cycle Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] p-6 pb-20 shadow-2xl relative z-10 overflow-y-auto max-h-[90%]"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Cycle Settings</h3>
                  <p className="text-xs text-slate-500 mt-1">Enhance accuracy by adding history</p>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Month 1 (3 Months Ago)</label>
                  <input 
                    type="date" 
                    value={pastDate1}
                    onChange={(e) => setPastDate1(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Month 2 (2 Months Ago)</label>
                  <input 
                    type="date" 
                    value={pastDate2}
                    onChange={(e) => setPastDate2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-500 uppercase tracking-wide block mb-1">Month 3 (Latest / Current)</label>
                  <input 
                    type="date" 
                    value={pastDate3}
                    onChange={(e) => setPastDate3(e.target.value)}
                    className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm font-medium text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1 mt-2">Average Period Length (Days)</label>
                  <input 
                    type="number" 
                    value={periodLength}
                    onChange={(e) => setPeriodLength(Number(e.target.value))}
                    min={1}
                    max={14}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  disabled={isSubmitting || !pastDate3}
                  className="w-full mt-4 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Save History & Recalculate'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
