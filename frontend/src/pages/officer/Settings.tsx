import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Building, Phone, Mail, Shield, Save,
  Bell, Volume2, Clock, CheckCircle2, RefreshCw, KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Skeleton } from '../../components/ui';
import api from '../../lib/api';

interface OfficerProfile {
  name: string;
  officerId: string;
  designation: string;
  department: string;
  district: string;
  centreName: string;
  phone: string;
  email: string;
  shiftTiming: string;
  autoCallNext: boolean;
  smsAlerts: boolean;
  audioChime: boolean;
}

export default function OfficerSettings() {
  const [profile, setProfile] = useState<OfficerProfile>({
    name: 'Dr. Anand Patil',
    officerId: 'AGRI-OFF-KA-4819',
    designation: 'Senior Procurement Officer',
    department: 'Department of Agricultural Marketing & Co-operation, Govt. of Karnataka',
    district: 'Belagavi',
    centreName: 'Bailhongal APMC Yard',
    phone: '+91 98450 12345',
    email: 'anand.patil@agri.karnataka.gov.in',
    shiftTiming: 'Morning (07:30 AM – 04:30 PM)',
    autoCallNext: false,
    smsAlerts: true,
    audioChime: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/officer/profile');
      if (res.data.data) {
        setProfile(prev => ({ ...prev, ...res.data.data }));
      }
    } catch {
      // Keep defaults
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/api/officer/profile', profile);
      toast.success('Officer profile and operational preferences saved! ✅');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="text-primary-600" />
            Officer Settings & APMC Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your official officer profile, assigned APMC yard, duty shifts, and automated token call rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProfile} disabled={isLoading} className="gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Officer Profile Card */}
        <Card className="p-6 border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-emerald-400 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-primary-600/30">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{profile.name}</h3>
                <Badge variant="success">Active Officer</Badge>
              </div>
              <p className="text-xs text-slate-500 font-semibold">{profile.designation} • {profile.department}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">ID: {profile.officerId}</span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-primary-700">{profile.centreName} ({profile.district})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User size={14} className="text-slate-400" /> Officer Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Shield size={14} className="text-slate-400" /> Govt. Officer ID
              </label>
              <input
                type="text"
                value={profile.officerId}
                onChange={e => setProfile(p => ({ ...p, officerId: e.target.value }))}
                className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building size={14} className="text-slate-400" /> Assigned APMC Centre
              </label>
              <input
                type="text"
                value={profile.centreName}
                onChange={e => setProfile(p => ({ ...p, centreName: e.target.value }))}
                className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" /> Duty Shift Timings
              </label>
              <input
                type="text"
                value={profile.shiftTiming}
                onChange={e => setProfile(p => ({ ...p, shiftTiming: e.target.value }))}
                className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" /> Official Phone Number
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" /> Govt. Email ID
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Operational Automation Preferences */}
        <Card className="p-6 border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Bell size={16} className="text-primary-600" />
            Queue Automation & Alerts Preferences
          </h3>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Auto-Call Next Waiting Token</h4>
                <p className="text-[11px] text-slate-400">Automatically promote the next token to 'Called' when the previous token is marked completed</p>
              </div>
              <input
                type="checkbox"
                checked={profile.autoCallNext}
                onChange={e => setProfile(p => ({ ...p, autoCallNext: e.target.checked }))}
                className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">SMS Gateway Notifications</h4>
                <p className="text-[11px] text-slate-400">Dispatch instant SMS to farmers when their token is called or payment is disbursed</p>
              </div>
              <input
                type="checkbox"
                checked={profile.smsAlerts}
                onChange={e => setProfile(p => ({ ...p, smsAlerts: e.target.checked }))}
                className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Counter Audio Chime & Gong</h4>
                <p className="text-[11px] text-slate-400">Play notification audio sound through yard speaker system when calling new tokens</p>
              </div>
              <input
                type="checkbox"
                checked={profile.audioChime}
                onChange={e => setProfile(p => ({ ...p, audioChime: e.target.checked }))}
                className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm gap-2 shadow-md"
          >
            <Save size={16} />
            {isSaving ? 'Saving Profile...' : 'Save Settings & Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
