import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Users, Activity, ToggleLeft, ToggleRight, X, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Modal, Badge, Skeleton, EmptyState } from '../../components/ui';
import api from '../../lib/api';

interface Centre {
  _id: string;
  name: string;
  district: string;
  address: string;
  totalCapacity: number;
  currentLoad: number;
  avgProcessingTimeMinutes: number;
  operatingHours: string;
  isActive: boolean;
  activeTokens?: number;
  todayTokens?: number;
}

const KA_DISTRICTS = ['Belagavi', 'Dharwad', 'Bagalkot', 'Bidar', 'Vijayapura', 'Gadag', 'Haveri', 'Uttara Kannada', 'Koppal', 'Raichur', 'Yadgir', 'Kalaburagi', 'Ballari', 'Mysuru', 'Bengaluru', 'Tumakuru', 'Shivamogga', 'Chitradurga', 'Davanagere', 'Hassan'];

const EMPTY_FORM = {
  name: '', district: 'Belagavi', address: '', totalCapacity: 100,
  avgProcessingTimeMinutes: 15, operatingHours: '8:00 AM – 6:00 PM', isActive: true,
  location: { lat: 0, lng: 0 }
};

function loadColor(pct: number) {
  if (pct < 50) return { bar: 'bg-primary-500', text: 'text-primary-600' };
  if (pct < 80) return { bar: 'bg-amber-500', text: 'text-amber-600' };
  return { bar: 'bg-red-500', text: 'text-red-500' };
}

export default function OfficerCentres() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCentres = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/officer/centres');
      setCentres(res.data.data || []);
    } catch {
      setCentres([
        { _id: 'c1', name: 'Bailhongal APMC Yard', district: 'Belagavi', address: 'Bailhongal, Karnataka', totalCapacity: 150, currentLoad: 68, avgProcessingTimeMinutes: 15, operatingHours: '8:00 AM – 6:00 PM', isActive: true, activeTokens: 12, todayTokens: 45 },
        { _id: 'c2', name: 'Belagavi Central APMC', district: 'Belagavi', address: 'Belagavi city', totalCapacity: 200, currentLoad: 120, avgProcessingTimeMinutes: 20, operatingHours: '7:00 AM – 7:00 PM', isActive: true, activeTokens: 8, todayTokens: 72 },
        { _id: 'c3', name: 'Hubli Amargol APMC', district: 'Dharwad', address: 'Amargol, Hubli', totalCapacity: 250, currentLoad: 45, avgProcessingTimeMinutes: 12, operatingHours: '8:00 AM – 5:00 PM', isActive: true, activeTokens: 5, todayTokens: 28 },
        { _id: 'c4', name: 'Gokak Farmers Market', district: 'Belagavi', address: 'Gokak town', totalCapacity: 100, currentLoad: 0, avgProcessingTimeMinutes: 18, operatingHours: '9:00 AM – 4:00 PM', isActive: false, activeTokens: 0, todayTokens: 0 },
      ]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchCentres(); }, [fetchCentres]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Centre name is required'); return; }
    if (form.totalCapacity <= 0) { toast.error('Capacity must be > 0'); return; }
    setIsSaving(true);
    try {
      await api.post('/api/officer/centres', form);
      toast.success(`✅ Centre "${form.name}" created!`);
      setShowModal(false);
      setForm({ ...EMPTY_FORM });
      fetchCentres();
    } catch {
      toast.error('Failed to save. Check backend connection.');
    }
    setIsSaving(false);
  };

  const toggleActive = async (centre: Centre) => {
    setTogglingId(centre._id);
    try {
      await api.put(`/api/officer/centres/${centre._id}`, { isActive: !centre.isActive });
      toast.success(`Centre ${!centre.isActive ? 'activated' : 'deactivated'}`);
      setCentres(prev => prev.map(c => c._id === centre._id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      setCentres(prev => prev.map(c => c._id === centre._id ? { ...c, isActive: !c.isActive } : c));
      toast.success(`Centre ${!centre.isActive ? 'activated' : 'deactivated'}`);
    }
    setTogglingId(null);
  };

  const f = (field: string, val: any) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">APMC Centres</h2>
          <p className="text-sm text-gray-400">{centres.length} centres · {centres.filter(c => c.isActive).length} active</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCentres}
            className="flex items-center gap-1.5 text-sm text-gray-500 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Add Centre
          </Button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Centres', value: centres.length },
          { label: 'Active Today', value: centres.filter(c => c.isActive).length },
          { label: 'Total Capacity', value: centres.reduce((s, c) => s + c.totalCapacity, 0) },
        ].map(s => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-xl font-black text-gray-900">{s.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Centre Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : centres.length === 0 ? (
        <EmptyState icon={<MapPin size={28} />} title="No Centres Yet"
          description="Add your first APMC centre to get started."
          action={<Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowModal(true)}>Add First Centre</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {centres.map((centre, i) => {
            const pct   = Math.round((centre.currentLoad / centre.totalCapacity) * 100);
            const color = loadColor(pct);
            return (
              <motion.div key={centre._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Card className="p-5 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight truncate pr-2">{centre.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">{centre.district}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={centre.isActive ? 'completed' : 'cancelled'}>
                        {centre.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <button onClick={() => toggleActive(centre)} disabled={togglingId === centre._id}
                        className="text-gray-400 hover:text-primary-600 transition-colors">
                        {centre.isActive
                          ? <ToggleRight size={22} className="text-primary-500" />
                          : <ToggleLeft size={22} />}
                      </button>
                    </div>
                  </div>

                  {/* Load Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-500 font-medium">Current Load</span>
                      <span className={`text-xs font-bold ${color.text}`}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color.bar} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">{centre.currentLoad} tokens active</span>
                      <span className="text-[10px] text-gray-400">/{centre.totalCapacity} capacity</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-gray-50 rounded-xl p-2">
                      <p className="text-sm font-bold text-gray-900">{centre.todayTokens || 0}</p>
                      <p className="text-[9px] text-gray-400 font-medium">Today</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded-xl p-2">
                      <p className="text-sm font-bold text-gray-900">{centre.activeTokens || 0}</p>
                      <p className="text-[9px] text-gray-400 font-medium">In Queue</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded-xl p-2">
                      <p className="text-sm font-bold text-gray-900">{centre.avgProcessingTimeMinutes}m</p>
                      <p className="text-[9px] text-gray-400 font-medium">Avg Wait</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock size={10} /> {centre.operatingHours}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Centre Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm({ ...EMPTY_FORM }); }}
        title="Add New APMC Centre" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Centre Name *</label>
              <input className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                placeholder="e.g. Bailhongal APMC Yard" value={form.name} onChange={e => f('name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">District</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                value={form.district} onChange={e => f('district', e.target.value)}>
                {KA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Total Capacity</label>
              <input type="number" min={10} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="100" value={form.totalCapacity} onChange={e => f('totalCapacity', +e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Avg Processing (minutes)</label>
              <input type="number" min={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="15" value={form.avgProcessingTimeMinutes} onChange={e => f('avgProcessingTimeMinutes', +e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Operating Hours</label>
              <input className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="8:00 AM – 6:00 PM" value={form.operatingHours} onChange={e => f('operatingHours', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Address</label>
              <input className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Full address" value={form.address} onChange={e => f('address', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Active immediately?</span>
            <button onClick={() => f('isActive', !form.isActive)} className="flex items-center gap-2">
              {form.isActive
                ? <ToggleRight size={24} className="text-primary-500" />
                : <ToggleLeft size={24} className="text-gray-400" />}
              <span className={`text-sm font-bold ${form.isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                {form.isActive ? 'Yes, Active' : 'Inactive'}
              </span>
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" isLoading={isSaving} onClick={handleSave}
              leftIcon={<Plus size={16} />}>
              Create Centre
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
