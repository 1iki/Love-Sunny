import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  currentUser: any | null;
  language: 'id' | 'en';
  points: { relationship: number; today: number };
  notes: Array<{ id: string; type: string; text: string; emoji: string; tags: string[] }>;
  cycle: { startDate: string; cycleLength: number; periodLength: number };
  finance: {
    budget: number;
    transactions: Array<{ id: string; name: string; category: string; emoji: string; amount: number; date: string; type: string }>;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  communicationLogs: Array<{ id: string; date: string; points: number; type: string; notes: string; tags: string[] }>;
  
  isLoading: boolean;
  isDashboardLoading: boolean;
  isCalendarLoading: boolean;
  isCycleLoading: boolean;
  isFinanceLoading: boolean;
  error: string | null;
  
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  pairPartner: (pairData: any) => Promise<void>;
  googleLogin: (googleData: any) => Promise<void>;
  logout: () => void;
  
  fetchDashboardData: () => Promise<void>;
  fetchCalendarData: () => Promise<void>;
  fetchCycleData: () => Promise<void>;
  fetchFinanceData: () => Promise<void>;
  addTransaction: (data: any) => Promise<void>;
  addCommunicationLog: (data: any) => Promise<void>;
  addNote: (data: any) => Promise<void>;
  updateCycle: (startDate: string) => Promise<void>;
  updateCycleHistory: (data: any) => Promise<void>;
  setLanguage: (lang: 'id' | 'en') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      language: 'id',
      points: { relationship: 0, today: 0 },
      notes: [],
      cycle: { startDate: new Date().toISOString(), cycleLength: 28, periodLength: 5 },
      finance: { budget: 500, transactions: [], totalIncome: 0, totalExpense: 0, balance: 0 },
      communicationLogs: [],
      
      isLoading: false,
      isDashboardLoading: false,
      isCalendarLoading: false,
      isCycleLoading: false,
      isFinanceLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to login');
          set({ currentUser: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to register');
          set({ currentUser: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      pairPartner: async (pairData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/pair', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              username: get().currentUser?.username, 
              ...pairData 
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to pair');
          set({ currentUser: data.user, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      googleLogin: async (googleData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googleData)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to authenticate with Google');
          set({ currentUser: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ currentUser: null });
      },
      
      fetchDashboardData: async () => {
    set({ isDashboardLoading: true, error: null });
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      set({ points: data.points, notes: data.notes, isDashboardLoading: false });
    } catch (error: any) {
      set({ error: error.message, isDashboardLoading: false });
    }
  },
  
  fetchCalendarData: async () => {
    set({ isCalendarLoading: true, error: null });
    try {
      const res = await fetch('/api/calendar');
      if (!res.ok) throw new Error('Failed to fetch calendar data');
      const data = await res.json();
      set({ communicationLogs: data.logs, isCalendarLoading: false });
    } catch (error: any) {
      set({ error: error.message, isCalendarLoading: false });
    }
  },
  
  fetchCycleData: async () => {
    set({ isCycleLoading: true, error: null });
    try {
      const res = await fetch('/api/cycle');
      if (!res.ok) throw new Error('Failed to fetch cycle data');
      const data = await res.json();
      set({ cycle: data, isCycleLoading: false });
    } catch (error: any) {
      set({ error: error.message, isCycleLoading: false });
    }
  },
  
  fetchFinanceData: async () => {
    set({ isFinanceLoading: true, error: null });
    try {
      const res = await fetch('/api/finance');
      if (!res.ok) throw new Error('Failed to fetch finance data');
      const data = await res.json();
      set((state) => ({ 
        finance: { ...state.finance, transactions: data.transactions, totalIncome: data.totalIncome, totalExpense: data.totalExpense, balance: data.balance },
        isFinanceLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isFinanceLoading: false });
    }
  },
  
  addTransaction: async (txData) => {
    const tempId = Date.now().toString();
    const isIncome = txData.type === 'income';
    const amount = Number(txData.amount) || 0;
    const tempTx = { 
      ...txData, 
      id: tempId,
      amount,
      date: txData.date || new Date().toISOString()
    };
    
    // 1. Capture snapshot
    const prevFinance = get().finance;
    
    // 2. Optimistic Update
    set((state) => {
      const newTotalIncome = state.finance.totalIncome + (isIncome ? amount : 0);
      const newTotalExpense = state.finance.totalExpense + (!isIncome ? amount : 0);
      return {
        finance: {
          ...state.finance,
          transactions: [tempTx, ...state.finance.transactions],
          totalIncome: newTotalIncome,
          totalExpense: newTotalExpense,
          balance: newTotalIncome - newTotalExpense
        }
      };
    });

    // 3. Background fetch
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      
      // 4. Handle Failure (Rollback)
      if (!res.ok) throw new Error('Failed to add transaction');
      
      const newTx = await res.json();
      
      // 5. Replace temp obj with db obj (success)
      set((state) => ({
        finance: {
          ...state.finance,
          transactions: state.finance.transactions.map(tx => tx.id === tempId ? { ...newTx, id: newTx.id || newTx._id } : tx)
        }
      }));
    } catch (error: any) {
      set({ finance: prevFinance, error: error.message });
    }
  },
  
  addCommunicationLog: async (logData) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      if (!res.ok) throw new Error('Failed to add log');
      const newLog = await res.json();
      set((state) => ({
        communicationLogs: [newLog, ...state.communicationLogs],
        points: {
           ...state.points,
           relationship: state.points.relationship + (newLog.points || 0),
           today: state.points.today + (newLog.points || 0)
        }
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  addNote: async (noteData) => {
    const tempId = Date.now().toString();
    const tempNote = { 
      ...noteData, 
      id: tempId, 
      date: new Date().toISOString() 
    };
    
    // 1. Capture snapshot
    const prevNotes = get().notes;
    
    // 2. Optimistic Update
    set((state) => ({
      notes: [tempNote, ...state.notes]
    }));

    // 3. Background fetch
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      
      // 4. Handle Failure (Rollback)
      if (!res.ok) throw new Error('Failed to add note');
      const newNote = await res.json();
      
      // 5. Replace temp with db obj
      set((state) => ({
        notes: state.notes.map(n => n.id === tempId ? { ...newNote, id: newNote.id || newNote._id } : n)
      }));
    } catch (error: any) {
      set({ notes: prevNotes, error: error.message });
    }
  },
  
  updateCycle: async (startDate: string) => {
    try {
      set((state) => ({ cycle: { ...state.cycle, startDate } }));
      const res = await fetch('/api/cycle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate })
      });
      if (!res.ok) throw new Error('Failed to update cycle');
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateCycleHistory: async (historyData: any) => {
    try {
      const res = await fetch('/api/cycle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
      });
      if (!res.ok) throw new Error('Failed to update cycle history');
      const updatedCycle = await res.json();
      set({ cycle: updatedCycle });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setLanguage: (lang) => set({ language: lang })
    }),
    {
      name: 'couple-tracker-storage',
    }
  )
);
