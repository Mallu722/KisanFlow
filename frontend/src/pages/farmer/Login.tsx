import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, ShieldCheck, Leaf, Sparkles, CheckCircle2, Lock, KeyRound, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Quick Demo Auto-Fill
  const handleQuickDemo = () => {
    setPhone('9876543210');
    toast.success('Demo mobile number filled!');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulating OTP transmission
    setIsLoading(false);
    setStep('otp');
    toast.success(`OTP sent to +91 ${phone}`);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      await login(phone || '9876543210');
      toast.success('Namaskara! Welcome to KrishiFlow 🌾');
      navigate('/home', { replace: true });
    } catch {
      toast.error('Failed to log in. Please try again.');
    }
    setIsLoading(false);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleResendOtp = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      toast.success('New OTP sent: 123456');
    }, 600);
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

        {/* Step 1: Phone Number */}
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.form
              key="phone-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handlePhoneSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                  <Phone size={13} className="text-primary-600" /> Enter Mobile Number
                </label>
                <div className="flex rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
                  <div className="flex items-center px-3.5 border-r border-slate-200 bg-slate-100 font-bold text-slate-700 text-sm">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3.5 text-base font-bold text-slate-900 outline-none bg-transparent tracking-wider placeholder-slate-400"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Demo One-Click Button */}
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200 flex items-center justify-center gap-1.5"
              >
                <span>⚡ Use Demo Phone:</span>
                <span className="font-mono text-emerald-900">98765 43210</span>
              </button>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 gap-2 transition-all mt-2"
              >
                {isLoading ? 'Sending SMS OTP...' : 'Send Login OTP'}
                <ArrowRight size={16} />
              </Button>
            </motion.form>
          ) : (
            /* Step 2: OTP Verification */
            <motion.form
              key="otp-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleOtpSubmit}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-600">
                  <span>Enter OTP sent to</span>
                  <span className="font-mono text-slate-900">+91 {phone || '9876543210'}</span>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-primary-600 hover:underline ml-1"
                  >
                    (Edit)
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP Box Inputs */}
              <div className="flex justify-between gap-2 my-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKey(idx, e)}
                    className="w-12 h-14 text-center text-xl font-black rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-mono"
                  />
                ))}
              </div>

              {/* Demo Hint */}
              <div className="bg-slate-100 rounded-xl p-2.5 text-center text-xs text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold">
                  <KeyRound size={13} className="text-primary-600" /> Default Demo OTP:
                </span>
                <span className="font-mono font-bold text-primary-700">123456</span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 gap-2 transition-all"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enter Dashboard'}
                <CheckCircle2 size={16} />
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  ← Change Number
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                  Resend OTP
                </button>
              </div>
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
