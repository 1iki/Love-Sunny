'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function FinancePage() {
  const { currentUser, finance, fetchFinanceData, addTransaction } = useAppStore();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [newTransaction, setNewTransaction] = useState({ name: '', amount: '', category: 'Food' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.coupleId) {
      fetchFinanceData();
    }
  }, [currentUser, router, fetchFinanceData]);

  // Use the new API fields (totalIncome, totalExpense, balance) directly from the store if available,
  // or calculate as fallback.
  const totalIncome = finance.totalIncome || 0;
  const totalExpense = finance.totalExpense || 0;
  const balance = finance.balance || 0;

  // Group by category for the chart (Expenses only)
  const categoryData = finance.transactions
    .filter(tx => tx.type !== 'income')
    .reduce((acc: any, curr) => {
      const existing = acc.find((item: any) => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []);

  const handleOpenModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setNewTransaction({ name: '', amount: '', category: type === 'expense' ? 'Food' : 'Salary' });
    setIsModalOpen(true);
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.name || !newTransaction.amount) return;
    setIsSubmitting(true);
    let emoji = '💸';
    if (modalType === 'expense') {
      emoji = '🛒';
      if (newTransaction.category === 'Date') emoji = '🍷';
      if (newTransaction.category === 'Food') emoji = '🍔';
      if (newTransaction.category === 'Subscription') emoji = '📺';
      if (newTransaction.category === 'Gift') emoji = '🎁';
    } else {
      emoji = '💵';
      if (newTransaction.category === 'Salary') emoji = '💰';
      if (newTransaction.category === 'Bonus') emoji = '🎉';
      if (newTransaction.category === 'Transfer') emoji = '🏦';
    }
    
    await addTransaction({
      date: new Date().toISOString(),
      name: newTransaction.name,
      amount: Number(newTransaction.amount),
      category: newTransaction.category,
      type: modalType,
      emoji: emoji
    });
    setNewTransaction({ name: '', amount: '', category: 'Food' });
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 px-6 pt-12 pb-24 overflow-y-auto w-full relative">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Shared Finances</h2>
      
      {/* Joint Funds Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-md mb-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joint Balance</span>
          <div className="text-4xl font-black text-white mt-1 mb-6">${balance.toFixed(2)}</div>
          
          <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4 gap-4">
             <div className="flex-1">
                <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1 mb-1"><ArrowDownRight size={12}/> Income</div>
                <div className="text-lg font-bold text-white">${totalIncome.toFixed(2)}</div>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <div className="flex-1">
                <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1 mb-1"><ArrowUpRight size={12}/> Expense</div>
                <div className="text-lg font-bold text-white">${totalExpense.toFixed(2)}</div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
      </div>

      <div className="mb-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Recent Transactions</h3>
        {finance.transactions.length === 0 ? (
          <p className="text-sm text-slate-500 italic px-2">No recent transactions.</p>
        ) : (
          <div className="space-y-3">
             {finance.transactions.map((tx) => (
               <div key={tx.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                   <div className="bg-slate-50 min-w-10 min-h-10 rounded-full flex items-center justify-center text-xl shrink-0">{tx.emoji}</div>
                   <div className="min-w-0 flex-1">
                     <div className="text-sm font-bold text-slate-800 truncate">{tx.name}</div>
                     <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{tx.category} &bull; {format(new Date(tx.date), 'MMM d, h:mm a')}</div>
                   </div>
                 </div>
                 <div className={`text-sm font-black shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                   {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-8">
        <button onClick={() => handleOpenModal('income')} className="bg-emerald-50 text-emerald-600 border border-emerald-100 flex-1 text-sm font-bold px-4 py-4 rounded-2xl flex justify-center items-center gap-2 shadow-sm hover:bg-emerald-100 transition-colors">
          <Plus size={18} /> Add Income
        </button>
        <button onClick={() => handleOpenModal('expense')} className="bg-slate-900 text-white flex-1 text-sm font-bold px-4 py-4 rounded-2xl flex justify-center items-center gap-2 shadow-sm hover:bg-slate-800 transition-colors">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-x-0 bottom-0 z-[60] flex flex-col justify-end pointer-events-auto h-[120%]"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
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
                  <h3 className="text-lg font-bold text-slate-800">Add {modalType === 'income' ? 'Income' : 'Expense'}</h3>
                  <p className="text-xs text-slate-500 mt-1">Track your shared {modalType === 'income' ? 'funds' : 'spending'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{modalType === 'income' ? 'Income Name' : 'Expense Name'}</label>
                  <input 
                    type="text" 
                    value={newTransaction.name}
                    onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
                    placeholder={modalType === 'income' ? 'E.g., Monthly Salary' : "E.g., Dinner at Luigi's"}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 bg-slate-50 border-slate-200 ${modalType === 'income' ? 'focus:ring-emerald-500/20 focus:border-emerald-500' : 'focus:ring-rose-500/20 focus:border-rose-500'}`}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Amount ($)</label>
                  <input 
                    type="number" 
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    placeholder="0.00"
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 bg-slate-50 border-slate-200 ${modalType === 'income' ? 'focus:ring-emerald-500/20 focus:border-emerald-500' : 'focus:ring-rose-500/20 focus:border-rose-500'}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Category</label>
                  <select 
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 appearance-none bg-slate-50 border-slate-200 ${modalType === 'income' ? 'focus:ring-emerald-500/20 focus:border-emerald-500' : 'focus:ring-rose-500/20 focus:border-rose-500'}`}
                  >
                    {modalType === 'expense' ? (
                      <>
                        <option value="Food">Food & Dining</option>
                        <option value="Date">Date Night</option>
                        <option value="Subscription">Subscription</option>
                        <option value="Gift">Gift</option>
                        <option value="Home">Home & Utilities</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Bonus">Bonus / Gift</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <button 
                  onClick={handleAddTransaction} 
                  disabled={isSubmitting || !newTransaction.name || !newTransaction.amount}
                  className={`w-full mt-4 text-white font-bold py-4 rounded-xl shadow-md disabled:opacity-50 transition-colors ${modalType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                >
                  {isSubmitting ? 'Saving...' : `Add ${modalType === 'income' ? 'Income' : 'Expense'}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
