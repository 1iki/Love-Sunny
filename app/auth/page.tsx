'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { ArrowRight, UserCheck } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const { login, register, pairPartner, googleLogin, isLoading, error, language } = useAppStore();
  const router = useRouter();
  
  const brand = dictionaries[(language as 'en' | 'id')]?.brand || dictionaries.en.brand;

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('female');

  // Pairing states
  const [nickname, setNickname] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      try {
        await login({ username, password });
        router.push('/');
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await register({ username, password, email, gender });
        setShowPairingModal(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pairPartner({ partnerUsername, nickname });
      setShowPairingModal(false);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    const mockEmail = window.prompt("Enter your Google email (mock):", "user@gmail.com");
    if (!mockEmail) return;
    
    try {
      await googleLogin({
        email: mockEmail,
        name: mockEmail.split('@')[0],
      });
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen max-h-screen min-h-screen w-full flex flex-col justify-between overflow-y-auto px-6 py-10 z-[100] bg-white relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      {/* Top Brand Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 flex flex-col items-center mt-2"
      >
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-rose-100 shadow-xl mb-4 bg-rose-50 flex items-center justify-center p-1">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img 
              src="https://lh3.google.com/u/0/d/1VU25_6IlGDuACeQChpNgMvNNPC7bS4gU=w1919-h969-iv1?auditContext=prefetch" 
              alt={brand.logoAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-4xl font-black text-rose-500 tracking-tight">{brand.name}</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">{brand.tagline}</p>
      </motion.div>

      {/* Auth Form Section */}
      <motion.div 
        layout
        className="relative z-10 w-full max-w-md mx-auto flex flex-col my-4 bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-2xl shadow-rose-100/50 border border-slate-100/50 flex-grow justify-center"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAuth}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-rose-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? 'Loading...' : 'Sign In'} <ArrowRight size={18} />
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleAuth}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="your@email.com"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Gender</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-rose-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-5 text-center">
          <p className="text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)} 
              className="font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-medium tracking-wide">OR</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white text-slate-700 border border-slate-200 font-bold py-3.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </motion.div>

      {/* Pairing Modal */}
      <AnimatePresence>
        {showPairingModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-6 shadow-2xl relative z-10 w-full max-w-md"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck size={32} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Connect with your Partner</h3>
              <p className="text-sm text-slate-500 text-center mb-6">Enter your partner's username to link your accounts together.</p>

              <form onSubmit={handlePairing} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Your Nickname</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    placeholder="What your partner calls you"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Partner's Username</label>
                  <input 
                    type="text" 
                    value={partnerUsername}
                    onChange={(e) => setPartnerUsername(e.target.value)}
                    required
                    placeholder="Their exact username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full mt-4 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Connecting...' : 'Connect Accounts'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
