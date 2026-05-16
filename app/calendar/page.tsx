'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarIcon, Plus, X, Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

export default function CalendarPage() {
  const { currentUser, communicationLogs, fetchCalendarData, addCommunicationLog } = useAppStore();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState({ type: 'daily', points: 5, notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.coupleId) {
      fetchCalendarData();
    }
  }, [currentUser, router, fetchCalendarData]);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Simplified day-of-week offset (0 = Sunday, etc.)
  const startOffset = monthStart.getDay();
  const blankDays = Array.from({ length: startOffset });

  const getLogsForDate = (date: Date) => {
    return communicationLogs.filter(log => isSameDay(new Date(log.date), date));
  };

  const selectedLogs = selectedDate ? getLogsForDate(selectedDate) : [];

  const handleAddLog = async () => {
    if (!newLog.notes) return;
    setIsSubmitting(true);
    await addCommunicationLog({
      date: new Date().toISOString(),
      type: newLog.type,
      points: Number(newLog.points),
      notes: newLog.notes
    });
    setNewLog({ type: 'daily', points: 5, notes: '' });
    setIsAddingLog(false);
    setIsSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 px-6 pt-4 pb-24 overflow-y-auto w-full relative">
      <div className="flex justify-between items-center mb-6 mt-8">
         <h2 className="text-2xl font-bold text-slate-800">Calendar</h2>
         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{format(today, 'MMMM yyyy')}</span>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm mb-6">
        <div className="grid grid-cols-7 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-3">
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="h-10"></div>
          ))}
          {daysInMonth.map((day, i) => {
            const logs = getLogsForDate(day);
            const hasLog = logs.length > 0;
            const isSelected = selectedDate && isSameDay(selectedDate, day);
            const isDayToday = isToday(day);

            return (
              <button 
                key={day.toString()} 
                onClick={() => setSelectedDate(day)}
                className={`relative h-10 w-10 mx-auto flex items-center justify-center rounded-full transition-colors ${
                  isSelected ? 'bg-sky-500 text-white shadow-md' : 
                  isDayToday ? 'border-2 border-sky-200 text-sky-700 font-bold' : 
                  'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {hasLog && !isSelected && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={() => setIsAddingLog(true)} className="bg-slate-900 text-white w-full text-sm font-bold px-6 py-4 rounded-2xl flex justify-center items-center gap-2 shadow-md hover:bg-slate-800 transition-colors">
        <Plus size={18} /> Log Interaction
      </button>

      {/* Date Logs View Modal */}
      <AnimatePresence>
        {selectedDate && !isAddingLog && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedDate(null)}></div>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] p-6 pb-20 shadow-2xl relative z-10 min-h-[300px] max-h-[80%] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{format(selectedDate, 'MMMM d, yyyy')}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedLogs.length} interaction(s) logged</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              {selectedLogs.length > 0 ? (
                <div className="space-y-4">
                  {selectedLogs.map(log => (
                    <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide bg-sky-100 px-2 py-0.5 rounded-sm">{log.type}</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                          +{log.points} <Heart size={10} className="fill-rose-600" />
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{log.notes}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">No logs for this date.</p>
                  {isSameDay(selectedDate, today) && (
                    <button onClick={() => setIsAddingLog(true)} className="mt-4 text-xs font-bold text-sky-600 hover:text-sky-700 border border-sky-200 px-4 py-2 rounded-full">
                      Add a Log for Today
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Log Modal */}
      <AnimatePresence>
        {isAddingLog && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsAddingLog(false)}></div>
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
                  <h3 className="text-lg font-bold text-slate-800">New Interaction</h3>
                  <p className="text-xs text-slate-500 mt-1">Log today's moment</p>
                </div>
                <button onClick={() => setIsAddingLog(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Type</label>
                  <select 
                    value={newLog.type}
                    onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none"
                  >
                    <option value="daily">Daily Check-in</option>
                    <option value="routine">Routine</option>
                    <option value="surprise">Surprise</option>
                    <option value="conflict_resolution">Conflict Resolution</option>
                    <option value="special">Special Event</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Points</label>
                  <input 
                    type="number" 
                    value={newLog.points}
                    onChange={(e) => setNewLog({ ...newLog, points: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Notes</label>
                  <textarea 
                    value={newLog.notes}
                    onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                    placeholder="What happened? How are you feeling?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[100px] resize-none"
                  ></textarea>
                </div>

                <button 
                  onClick={handleAddLog} 
                  disabled={isSubmitting || !newLog.notes}
                  className="w-full mt-4 bg-sky-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-sky-600 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
