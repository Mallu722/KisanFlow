import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Leaf, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { type ApiResponse } from '../../lib/api';
import { Button } from '../../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // ⚡ One-Click Demo Login
  const handleQuickDemo = async () => {
    setEmail('farmer@krishiflow.com');
    setPassword('farmer123');
    setIsLoading(true);
    try {
      await login('farmer@krishiflow.com', 'farmer123');
      toast.success('Namaskara! Welcome to KrishiFlow 🌾');
      navigate('/home', { replace: true });
    } catch {
      toast.error('Failed to log in. Please try again.');
    }
    setIsLoading(false);
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Namaskara! Login Successful 🌾');
      navigate('/home', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: ApiResponse<null> } };
      const msg = apiErr.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(msg);
    }
    setIsLoading(false);
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      toast.error('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({ name, phone, email, password });
      toast.success('Account created successfully! Welcome to KrishiFlow 🌾');
      navigate('/home', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: ApiResponse<null> } };
      const msg = apiErr.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(msg);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-600/30">
            <Leaf size={28} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold mb-2">
            <Sparkles size={12} /> Smart APMC Farmer Access
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Krishi<span className="text-primary-600">Flow</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Smart Procurement, Centre Recommendation & Farmer Queue Management
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-white text-primary-700 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn size={14} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-primary-700 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus size={14} /> Create Account
          </button>
        </div>

        {/* Sign In / Sign Up Form */}
        <AnimatePresence mode="wait">
          {mode === 'signin' ? (
            /* Sign In Tab */
            <motion.form
              key="signin-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignIn}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                  <Mail size={13} className="text-primary-600" /> Email Address
                </label>
                <div className="flex items-center rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="farmer@krishiflow.com"
                    className="w-full px-4 py-3 text-sm font-bold text-slate-900 outline-none bg-transparent placeholder-slate-400"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                  <Lock size={13} className="text-primary-600" /> Password
                </label>
                <div className="flex items-center rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 text-sm font-bold text-slate-900 outline-none bg-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Quick Demo One-Click Fill & Login */}
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200 flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" /> Use Demo Account:
                </span>
                <span className="font-mono bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900 font-extrabold">
                  farmer@krishiflow.com / farmer123
                </span>
              </button>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 gap-2 transition-all mt-2"
              >
                {isLoading ? 'Signing In...' : 'Sign In & Access Portal'}
                <ArrowRight size={16} />
              </Button>
            </motion.form>
          ) : (
            /* Sign Up Tab */
            <motion.form
              key="signup-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleSignUp}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <User size={13} className="text-primary-600" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Huded"
                  className="w-full px-4 py-2.5 text-sm font-bold text-slate-900 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Phone size={13} className="text-primary-600" /> Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 text-sm font-bold text-slate-900 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Mail size={13} className="text-primary-600" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ramesh@gmail.com"
                  className="w-full px-4 py-2.5 text-sm font-bold text-slate-900 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Lock size={13} className="text-primary-600" /> Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full px-4 py-2.5 text-sm font-bold text-slate-900 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !name || !email || !password}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 gap-2 transition-all mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Farmer Account'}
                <UserPlus size={16} />
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Security Assurance */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Govt. of Karnataka • Verified Farmer Access</span>
        </div>
      </motion.div>
    </div>
  );
}
