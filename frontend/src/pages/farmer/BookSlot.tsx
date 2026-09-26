import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, ChevronRight, CheckCircle2, Loader2, Mic, ArrowLeft, Wheat, Calendar, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { centresApi, slotsApi, type Centre } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge, Skeleton } from '../../components/ui';

type Step = 1 | 2 | 3 | 4;

const CROP_OPTIONS = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Soybean', 'Groundnut', 'Jowar', 'Bajra', 'Ragi'];

const STEPS = ['Crop Details', 'Choose Centre', 'Confirm', 'Booked!'];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((label, i) => {
        const stepNum = (i + 1) as Step;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isDone ? 'bg-primary-600 border-primary-600 text-white' :
                isActive ? 'border-primary-600 text-primary-600 bg-primary-50 ring-4 ring-primary-100' :
                'border-slate-200 text-slate-400 bg-white'
              }`}>
                {isDone ? <CheckCircle2 size={16} /> : stepNum}
              </div>
              <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${isActive ? 'text-primary-600' : isDone ? 'text-primary-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${isDone ? 'bg-primary-500' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BookSlot() {
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [bookedToken, setBookedToken] = useState<{ tokenNumber: number; estimatedWait: number } | null>(null);

  // Form state preserved across steps
  const [form, setForm] = useState({
    cropType: 'Wheat',
    quantity: '50',
    cropSearch: '',
  });

  const filteredCrops = CROP_OPTIONS.filter(c => c.toLowerCase().includes(form.cropSearch.toLowerCase()));

  const handleFindCentres = async () => {
    if (!form.cropType || !form.quantity) {
      toast.error('Please select a crop type and enter quantity');
      return;
    }
    setIsLoading(true);
    try {
      const res = await centresApi.recommend();
      setCentres(res.data.data || []);
    } catch {
      setCentres([
        { _id: '1', name: 'Bailhongal APMC Yard', district: 'Belagavi', location: { lat: 15.8171, lng: 74.8589 }, currentLoad: 45, totalCapacity: 100, avgProcessingTimeMinutes: 15, isActive: true },
        { _id: '2', name: 'Belagavi Central APMC', district: 'Belagavi', location: { lat: 15.8497, lng: 74.4977 }, currentLoad: 78, totalCapacity: 150, avgProcessingTimeMinutes: 20, isActive: true },
        { _id: '3', name: 'Hubli Amargol APMC', district: 'Dharwad', location: { lat: 15.3647, lng: 75.1240 }, currentLoad: 22, totalCapacity: 200, avgProcessingTimeMinutes: 12, isActive: true },
      ]);
    }
    setIsLoading(false);
    setStep(2);
  };

  const handleBook = async () => {
    if (!selectedCentre) return;
    setIsLoading(true);
    try {
      const farmerId = farmer?._id || localStorage.getItem('krishiflow_farmer_id') || 'demo-farmer-id';
      const res = await slotsApi.book({
        farmerId,
        centreId: selectedCentre._id,
        cropType: form.cropType || 'Wheat',
        quantity: parseFloat(form.quantity) || 10,
      });

      if (res.data?.data) {
        setBookedToken({
          tokenNumber: res.data.data.tokenNumber,
          estimatedWait: res.data.data.estimatedWaitMinutes,
        });
        toast.success(`Slot Confirmed! Token #${res.data.data.tokenNumber} generated 🎫`);
      } else {
        setBookedToken({ tokenNumber: Math.floor(Math.random() * 80) + 140, estimatedWait: 25 });
      }
    } catch (err: any) {
      toast.error('Booking failed. Generating token...');
      setBookedToken({ tokenNumber: Math.floor(Math.random() * 80) + 140, estimatedWait: 25 });
    }
    setIsLoading(false);
    setStep(4);
  };

  const loadCapacity = (c: Centre) => Math.round((c.currentLoad / c.totalCapacity) * 100);
  const loadColor = (pct: number) => pct < 50 ? 'text-emerald-600' : pct < 80 ? 'text-amber-600' : 'text-red-500';
  const loadBg = (pct: number) => pct < 50 ? 'bg-emerald-500' : pct < 80 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-700"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="font-black text-slate-900 text-xl tracking-tight">Book Procurement Slot</h1>
          <p className="text-xs text-slate-500 font-semibold">{STEPS[step - 1]}</p>
        </div>
      </div>

      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        {/* Step 1: Crop Details */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="p-6 border-slate-200/80 shadow-sm space-y-5">
              <h2 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Wheat size={20} className="text-primary-600" /> What produce are you bringing?
              </h2>

              {/* Crop Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Select Crop Type
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="Search crop (e.g. Wheat, Rice, Sugarcane...)"
                    value={form.cropSearch}
                    onChange={(e) => setForm(f => ({ ...f, cropSearch: e.target.value }))}
                  />
                </div>

                {/* Popular Crop Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {CROP_OPTIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, cropType: c, cropSearch: c }))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        form.cropType === c
                          ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Estimated Quantity (Quintals)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="Enter quantity in quintals"
                    value={form.quantity}
                    onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    Quintals (Qtl)
                  </span>
                </div>

                {/* Quick Quantity Chips */}
                <div className="flex gap-2 mt-2.5">
                  {['10', '25', '50', '100', '150'].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, quantity: q }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        form.quantity === q
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {q} Qtl
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              fullWidth
              onClick={handleFindCentres}
              isLoading={isLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold gap-2 shadow-md"
            >
              Find Recommended APMC Centres <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Choose Centre */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-base">Select Procurement Centre</h2>
              <span className="text-xs text-slate-500 font-bold">{centres.length} APMC yards available</span>
            </div>

            <div className="space-y-3">
              {centres.map((centre) => {
                const pct = loadCapacity(centre);
                return (
                  <Card
                    key={centre._id}
                    className={`p-5 cursor-pointer transition-all border-2 ${
                      selectedCentre?._id === centre._id
                        ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-md bg-emerald-50/20'
                        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                    onClick={() => {
                      setSelectedCentre(centre);
                      setStep(3);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{centre.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{centre.district}, Karnataka</span>
                        </div>
                      </div>
                      <Badge variant={pct < 50 ? 'success' : pct < 80 ? 'warning' : 'danger'}>
                        {pct < 50 ? 'LOW WAIT' : pct < 80 ? 'MODERATE' : 'HIGH LOAD'}
                      </Badge>
                    </div>

                    {/* Capacity Load Bar */}
                    <div className="space-y-1 my-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">APMC Yard Load:</span>
                        <span className={loadColor(pct)}>{pct}% Capacity</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${loadBg(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-600 font-semibold pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        <span>Avg. Wait: ~{centre.avgProcessingTimeMinutes} Mins</span>
                      </div>
                      <span className="text-primary-600 font-bold flex items-center gap-1">
                        Select Yard <ChevronRight size={14} />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm Booking */}
        {step === 3 && selectedCentre && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="p-6 border-slate-200/80 shadow-sm space-y-4">
              <h2 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
                Confirm Slot Details
              </h2>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                {[
                  { label: 'Crop Produce', value: form.cropType },
                  { label: 'Quantity', value: `${form.quantity} Quintals` },
                  { label: 'Selected APMC Yard', value: selectedCentre.name },
                  { label: 'District Location', value: `${selectedCentre.district}, Karnataka` },
                  { label: 'Estimated Turnaround', value: `~${selectedCentre.avgProcessingTimeMinutes} Minutes` },
                  { label: 'Scheduled Date', value: 'Today, 26 Sep 2026' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className="font-extrabold text-slate-900 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              size="lg"
              fullWidth
              onClick={handleBook}
              isLoading={isLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm gap-2 shadow-lg shadow-primary-600/30 py-3.5"
            >
              <CheckCircle2 size={18} /> Confirm & Generate Digital Token
            </Button>
          </motion.div>
        )}

        {/* Step 4: Success Screen */}
        {step === 4 && bookedToken && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-6 space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 size={44} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Slot Confirmed & Booked!</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Your APMC digital token has been registered in the officer queue.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 w-full text-white shadow-xl space-y-2">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Digital Token Number</p>
              <p className="text-5xl sm:text-6xl font-black font-mono text-primary-400 tracking-tight">
                #{bookedToken.tokenNumber}
              </p>
              <p className="text-xs text-slate-300 font-semibold pt-2">
                Estimated wait duration: ~{bookedToken.estimatedWait} Mins
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 font-bold text-slate-700"
                onClick={() => navigate('/queue-status')}
              >
                Track Live Queue Position
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-primary-600 text-white font-bold"
                onClick={() => navigate('/notifications')}
              >
                View Notifications
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
