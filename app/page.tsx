'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Tag, UserCircle, LogOut, Lock } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { dictionaries } from '@/lib/dictionaries';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { currentUser, points, notes, fetchDashboardData, fetchCycleData, fetchFinanceData, isDashboardLoading, addNote, language, logout } = useAppStore();
  const t = dictionaries[language].dashboard;
  const router = useRouter();

  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ text: '', type: 'routine' });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset states
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.coupleId) {
      fetchDashboardData();
      fetchCycleData();
      fetchFinanceData();
    }
  }, [currentUser, router, fetchDashboardData, fetchCycleData, fetchFinanceData]);

  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddNote = async () => {
    if (!newNote.text) return;
    setIsSubmitting(true);
    await addNote({
      text: newNote.text,
      type: newNote.type,
      tags: tags,
      date: new Date().toISOString()
    });
    setNewNote({ text: '', type: 'routine' });
    setTags([]);
    setIsAddingNote(false);
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const handleResetPassword = async () => {
    if (!newPassword || !currentUser?._id) return;
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id, newPassword })
      });
      alert('Password updated successfully');
      setNewPassword('');
      setIsResettingPassword(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update password');
    }
  };

  if (isDashboardLoading && points.relationship === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 pt-12">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 animate-pulse">Syncing data...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 px-6 pt-12 pb-24 overflow-y-auto w-full relative">
      <div className="flex justify-between items-start mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t.greeting}, <span className="text-rose-500">{currentUser?.name || currentUser?.username || 'Alex'}</span>.</h1>
          <p className="text-slate-500 text-sm mt-1">{t.summaryDesc}</p>
        </motion.div>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="p-2 bg-rose-50 text-rose-500 rounded-full shadow-sm hover:bg-rose-100 transition-colors"
        >
          <UserCircle size={24} />
        </button>
      </div>

      {/* Points Widget */}
      <motion.button onClick={() => setIsMilestoneModalOpen(true)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full text-left bg-rose-50 border border-rose-100 rounded-[32px] p-6 shadow-sm mb-8 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-200 hover:bg-rose-100 transition-colors">
        <div className="relative z-10 w-full cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{t.totalPoints}</span>
            <div className="h-6 px-3 bg-white/60 rounded-full flex items-center justify-center text-[10px] font-bold text-rose-600 shadow-sm backdrop-blur-sm shadow-rose-200/50">+{points.today} {t.pointsToday}</div>
          </div>
          <div className="text-5xl font-black text-rose-900 mt-2 mb-1">{points.relationship.toLocaleString()}</div>
          <p className="text-xs text-rose-600 font-medium">Keep it up! 160 pts to next milestone.</p>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
      </motion.button>

      {/* Adding Note Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t.recentNotes}</h3>
        <button onClick={() => setIsAddingNote(true)} className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full transition-colors">
          <Plus size={14} /> {t.addNote}
        </button>
      </motion.div>

      {/* Notes Widget (2-Column Grid) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
         {notes.length === 0 ? (
            <p className="text-sm text-slate-500 italic px-2">{t.noRecentNotes}</p>
         ) : (
           <div className="grid grid-cols-2 gap-3">
             {notes.map((note) => {
               let colorClasses = "bg-slate-50 border-slate-100 text-slate-800";
               let badgeColor = "text-slate-700 bg-slate-100";
               
               if (note.type.toLowerCase() === 'routine') {
                 colorClasses = "bg-yellow-50 border-yellow-100 text-yellow-900";
                 badgeColor = "text-yellow-700 bg-yellow-100";
               } else if (note.type.toLowerCase() === 'surprise' || note.type.toLowerCase() === 'special') {
                 colorClasses = "bg-rose-50 border-rose-100 text-rose-900";
                 badgeColor = "text-rose-700 bg-rose-100";
               } else if (note.type.toLowerCase() === 'important' || note.type.toLowerCase() === 'conflict_resolution') {
                 colorClasses = "bg-sky-50 border-sky-100 text-sky-900";
                 badgeColor = "text-sky-700 bg-sky-100";
               }

               // Extract summary: first 50 chars
               const summary = note.text.length > 50 ? note.text.slice(0, 50) + '...' : note.text;

               return (
                <button 
                  key={note.id} 
                  onClick={() => setSelectedNote(note)}
                  className={`${colorClasses} p-4 rounded-3xl border shadow-sm flex flex-col justify-between text-left h-32 hover:shadow-md transition-shadow active:scale-[0.98]`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <span className={`text-[9px] font-bold ${badgeColor} px-2 py-0.5 rounded-sm uppercase tracking-wide`}>{note.type}</span>
                       <span className="text-base">{note.emoji}</span>
                    </div>
                    <p className="text-xs font-medium leading-tight line-clamp-3 break-words">{summary}</p>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1 overflow-hidden mt-2">
                      {note.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap opacity-60 bg-black/5`}>#{tag}</span>
                      ))}
                      {note.tags.length > 2 && <span className="text-[8px] font-bold px-1 py-0.5 rounded-full opacity-60 bg-black/5">+{note.tags.length - 2}</span>}
                    </div>
                  )}
                </button>
               )
             })}
            </div>
         )}
      </motion.div>

      {/* Selected Note Modal */}
      <AnimatePresence>
        {selectedNote && !isAddingNote && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedNote(null)}></div>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] p-6 pb-20 shadow-2xl relative z-10 min-h-[300px] max-h-[85%] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedNote.emoji}</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 capitalize leading-tight">{selectedNote.type} {t.noteDetails.split(' ')[1] || 'Note'}</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedNote(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{selectedNote.text}</p>
              </div>

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t.tags}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag: string, i: number) => (
                      <span key={i} className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Note Modal */}
      <AnimatePresence>
        {isAddingNote && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsAddingNote(false)}></div>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] p-6 pb-20 shadow-2xl relative z-10 max-h-[90%] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{t.addNewNote}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t.addNewNoteDesc}</p>
                </div>
                <button onClick={() => setIsAddingNote(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{t.type}</label>
                  <select 
                    value={newNote.type}
                    onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none"
                  >
                    <option value="routine">{t.routine}</option>
                    <option value="surprise">{t.surprise}</option>
                    <option value="conflict_resolution">{t.conflictResolution}</option>
                    <option value="special">{t.specialEvent}</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{t.noteDetails}</label>
                  <textarea 
                    value={newNote.text}
                    onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
                    placeholder={t.placeholderText}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-h-[120px] resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{t.tagsLabel}</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={t.tagsPlaceholder}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button 
                      onClick={handleAddTag} 
                      className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center hover:bg-slate-300 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-slate-800">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAddNote} 
                  disabled={isSubmitting || !newNote.text}
                  className="w-full mt-2 bg-rose-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? t.saving : t.saveNote}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] p-6 pb-20 shadow-2xl relative z-10 max-h-[90%] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Your Profile</h3>
                  <p className="text-xs text-slate-500 mt-1">Manage your account details</p>
                </div>
                <button onClick={() => setIsProfileOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Name</span>
                    <span className="text-sm font-semibold text-slate-800">{currentUser?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Username</span>
                    <span className="text-sm font-semibold text-slate-800">{currentUser?.username || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gender</span>
                    <span className="text-sm font-semibold text-slate-800 capitalize">{currentUser?.gender || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</span>
                    <span className="text-sm font-semibold text-slate-800">{currentUser?.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Partner</span>
                    <span className={`text-sm font-bold ${currentUser?.coupleId ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {currentUser?.coupleId ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>

                {!isResettingPassword ? (
                   <button 
                     onClick={() => setIsResettingPassword(true)}
                     className="w-full border border-orange-200 bg-orange-50 text-orange-600 font-bold py-3 rounded-xl shadow-sm hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 text-sm"
                   >
                     <Lock size={16} /> Reset Password
                   </button>
                ) : (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 p-4 border border-orange-200 rounded-2xl bg-orange-50/50">
                     <label className="text-xs font-bold text-orange-800 uppercase tracking-wide block">New Password</label>
                     <input 
                       type="password" 
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       placeholder="••••••••"
                       className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                     />
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setIsResettingPassword(false)}
                          className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleResetPassword}
                          disabled={!newPassword}
                          className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md disabled:opacity-50 hover:bg-orange-600 transition-colors text-sm"
                        >
                          Confirm
                        </button>
                     </div>
                   </motion.div>
                )}
              </div>

              <div className="w-full h-px bg-slate-100 my-6"></div>

              <button 
                onClick={handleLogout}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Milestone Modal */}
      <AnimatePresence>
        {isMilestoneModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMilestoneModalOpen(false)}></div>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[32px] p-6 pb-20 shadow-2xl relative z-10 max-h-[90%] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Milestones & Rewards</h3>
                  <p className="text-xs text-slate-500 mt-1">Unlock treats by building relationship points.</p>
                </div>
                <button onClick={() => setIsMilestoneModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              {/* Progress Bar for Current Level */}
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl mb-8">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-0.5">Current Level</span>
                    <span className="text-lg font-black text-rose-600">Level 1</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-rose-900">{points.relationship} <span className="text-xs text-rose-500 font-medium">/ 500</span></span>
                  </div>
                </div>
                <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner border border-rose-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((points.relationship / 500) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Rewards List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Unlockable Rewards</h4>
                
                {/* Unlocked Reward */}
                <div className={`p-4 rounded-3xl border flex items-center gap-4 ${points.relationship >= 100 ? 'bg-white border-rose-200 shadow-md' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${points.relationship >= 100 ? 'bg-rose-100 text-rose-500' : 'bg-slate-200 text-slate-400'}`}>
                    {points.relationship >= 100 ? '🍿' : <Lock size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-bold text-sm truncate ${points.relationship >= 100 ? 'text-slate-800' : 'text-slate-400'}`}>Movie Night Choice</h5>
                      {points.relationship >= 100 && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Unlocked</span>}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">100 Pts • Pick any movie this weekend</p>
                  </div>
                </div>

                {/* Locked Rewards */}
                <div className={`p-4 rounded-3xl border flex items-center gap-4 ${points.relationship >= 500 ? 'bg-white border-rose-200 shadow-md' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${points.relationship >= 500 ? 'bg-rose-100 text-rose-500' : 'bg-slate-200 text-slate-400'}`}>
                    {points.relationship >= 500 ? '💆' : <Lock size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-bold text-sm truncate ${points.relationship >= 500 ? 'text-slate-800' : 'text-slate-400'}`}>30-Min Massage</h5>
                      {points.relationship >= 500 && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Unlocked</span>}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">500 Pts • Relax and unwind</p>
                  </div>
                </div>

                <div className={`p-4 rounded-3xl border flex items-center gap-4 ${points.relationship >= 1000 ? 'bg-white border-rose-200 shadow-md' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${points.relationship >= 1000 ? 'bg-rose-100 text-rose-500' : 'bg-slate-200 text-slate-400'}`}>
                    {points.relationship >= 1000 ? '🍷' : <Lock size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-bold text-sm truncate ${points.relationship >= 1000 ? 'text-slate-800' : 'text-slate-400'}`}>Fancy Dinner Date</h5>
                      {points.relationship >= 1000 && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Unlocked</span>}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">1000 Pts • On me!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
