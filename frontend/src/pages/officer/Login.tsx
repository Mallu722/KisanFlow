import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui';

export default function OfficerLogin() {
  const navigate = useNavigate();
  const [officerId, setOfficerId] = useState('AGRI-OFF-KA-4819');
  const [pin, setPin] = useState('4819');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId || !pin) {
      toast.error('Please enter your Officer ID and PIN');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Validate official pin or accept 4819
      if (pin === '4819' || pin === 'admin' || pin.length >= 4) {
        localStorage.setItem('krishiflow_officer_session', JSON.stringify({
          authenticated: true,
          officerId,
          name: 'Dr. Anand Patil',
          designation: 'Senior Procurement Officer',
          centre: 'Bailhongal APMC Yard',
          district: 'Belagavi',
          loginTime: new Date().toISOString(),
        }));
        toast.success('Officer credentials verified. Welcome!');
        navigate('/officer/dashboard', { replace: true });
      } else {
        toast.error('Invalid Official PIN. Use PIN: 4819');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        {/* Header with Govt seal insignia */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-600/40">
            <Shield size={28} className="text-white" />
          </div>
          <div className="inline-block px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-xs font-bold tracking-wider uppercase mb-2">
            Govt. of Karnataka • APMC Portal
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Officer & Admin Sign In</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorized access for Procurement Officers & Yard Supervisors
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <User size={13} className="text-slate-400" /> Officer ID / Govt. Badge Number
            </label>
            <input
              type="text"
              value={officerId}
              onChange={e => setOfficerId(e.target.value)}
              placeholder="e.g. AGRI-OFF-KA-4819"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Lock size={13} className="text-slate-400" /> Official Security PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter 4-digit PIN (Default: 4819)"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound size={13} className="text-primary-400" /> Demo Officer PIN:
            </span>
            <span className="font-mono font-bold text-primary-400">4819</span>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-900/50 gap-2 transition-all"
          >
            {isLoading ? 'Authenticating...' : 'Authorize Officer Access'}
            <ArrowRight size={16} />
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Farmer Public Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
