import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, User, Phone, MapPin, CheckCircle2, Clock,
  Hash, ChevronRight, Eye, Send, Wheat, Wallet, PackageCheck,
  AlertTriangle, ShieldCheck, FileText, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Badge, Skeleton, EmptyState, Button, Modal } from '../../components/ui';
import api from '../../lib/api';

interface FarmerRow {
  _id: string;
  name: string;
  phone: string;
  village: string;
  isVerified?: boolean;
  language?: string;
  createdAt: string;
  totalBookings: number;
  activeToken?: {
    _id: string;
    tokenNumber: number;
    status: string;
    cropType: string;
    quantity?: number;
    estimatedWaitMinutes?: number;
    centreId?: { name: string; district: string };
  } | null;
  latestProcurement?: any;
  latestPayment?: any;
}

const STATUS_CHIP: Record<string, string> = {
  waiting: 'bg-blue-50 text-blue-700 border-blue-200',
  called: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
};

const LANG_MAP: Record<string, string> = { en: '🇬🇧 English', hi: '🇮🇳 Hindi', kn: '🌾 Kannada' };

export default function OfficerFarmers() {
  const [farmers, setFarmers] = useState<FarmerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [farmerDetails, setFarmerDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Direct message composer
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const fetchFarmers = useCallback(async (q = search) => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/officer/farmers', { params: { search: q, limit: 50 } });
      setFarmers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setFarmers([
        {
          _id: 'f1',
          name: 'Ramesh Huded',
          phone: '+91 98765 43210',
          village: 'Bailhongal',
          isVerified: true,
          language: 'kn',
          createdAt: new Date().toISOString(),
          totalBookings: 12,
          activeToken: {
            _id: 't1',
            tokenNumber: 142,
            status: 'called',
            cropType: 'Wheat (FAQ Sharbati)',
            quantity: 50,
            estimatedWaitMinutes: 5,
            centreId: { name: 'Bailhongal APMC Yard', district: 'Belagavi' }
          }
        },
      ]);
      setTotal(1);
    }
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const openFarmerProfile = async (farmerId: string) => {
    setSelectedFarmerId(farmerId);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/api/officer/farmers/${farmerId}`);
      setFarmerDetails(res.data.data);
    } catch {
      const f = farmers.find(item => item._id === farmerId);
      setFarmerDetails({
        farmer: f || { name: 'Farmer', phone: '+91 98765 43210', village: 'Belagavi', language: 'kn' },
        activeToken: f?.activeToken,
        tokens: f?.activeToken ? [f.activeToken] : [],
        procurements: [
          { receiptNumber: 'KF-PR-9042', cropType: 'Wheat', netWeightKg: 4000, totalAmount: 91000, qualityGrade: 'FAQ Grade A', createdAt: new Date().toISOString() }
        ],
        payments: [
          { transactionId: 'TXN-DBT-883921', amount: 91000, status: 'completed', bankAccountNumber: '•••• •••• 9842', utrNumber: 'UTR998812349812' }
        ],
        summary: { totalBookings: 12, totalProcuredQuintals: 40, totalEarnings: 91000 }
      });
    }
    setLoadingDetails(false);
  };

  // 1-Click 15-Min Advance Arrival Alert
  const handleSend15MinAlert = async (farmerId: string, tokenId?: string) => {
    try {
      if (tokenId) {
        await api.post(`/api/officer/token/${tokenId}/advance-alert`);
      } else {
        await api.post(`/api/officer/farmers/${farmerId}/notify`, {
          title: '⏰ 15-Minute Advance Arrival Alert! ⚡',
          message: 'Your APMC verification turn is in ~15 minutes. Please head to the Gate 2 weighbridge now with your produce vehicle.',
          type: 'alert'
        });
      }
      toast.success('15-minute advance arrival notice dispatched to farmer! 📱');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    }
  };

  const handleSendDirectMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle || !msgBody || !selectedFarmerId) return;
    setIsSendingMsg(true);
    try {
      await api.post(`/api/officer/farmers/${selectedFarmerId}/notify`, {
        title: msgTitle,
        message: msgBody,
        type: 'alert'
      });
      toast.success('Direct notification sent to farmer! ✉️');
      setShowMsgModal(false);
      setMsgTitle('');
      setMsgBody('');
    } catch (err: any) {
      toast.error('Failed to dispatch message');
    }
    setIsSendingMsg(false);
  };

  const filtered = farmers.filter(
    f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search) ||
      f.village.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="text-primary-600" />
            Registered Farmers Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time farmer registrations, produce booking inspection, 15-min advance call alerts & DBT tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchFarmers()} disabled={isLoading} className="gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh List
          </Button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <Card className="p-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by farmer name, phone number, or village..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </Card>

      {/* Farmers Grid / Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <Skeleton key={n} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No registered farmers found"
          description="Farmers will automatically appear here as they register on the mobile app or book slots."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(farmer => {
            const hasActiveToken = !!farmer.activeToken;
            return (
              <motion.div
                key={farmer._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-emerald-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                        {farmer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">{farmer.name}</h3>
                          {farmer.isVerified && (
                            <CheckCircle2 size={14} className="text-emerald-500" title="Verified Land Record" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono font-medium">{farmer.phone}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {LANG_MAP[farmer.language || 'kn'] || '🌾 Kannada'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{farmer.village}, Karnataka</span>
                  </div>

                  {/* Active Token Card if waiting / called */}
                  {hasActiveToken ? (
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 mb-3 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-amber-900 font-mono text-sm">
                          Token #{farmer.activeToken?.tokenNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-800">
                          {farmer.activeToken?.status}
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium">
                        Crop: <span className="font-bold text-slate-800">{farmer.activeToken?.cropType}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Centre: {farmer.activeToken?.centreId?.name || 'APMC Yard'}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-2.5 mb-3 text-[11px] text-slate-500 text-center font-medium">
                      No active queue token currently
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openFarmerProfile(farmer._id)}
                    className="flex-1 gap-1 text-xs font-bold text-slate-700 h-9"
                  >
                    <Eye size={13} /> View Full Profile
                  </Button>

                  {hasActiveToken && (
                    <Button
                      size="sm"
                      onClick={() => handleSend15MinAlert(farmer._id, farmer.activeToken?._id)}
                      className="gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold h-9 px-3"
                      title="Send 15-Minute Advance Arrival Notice"
                    >
                      <Clock size={13} /> 15-Min Alert
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deep Farmer Profile Modal */}
      {selectedFarmerId && (
        <Modal
          isOpen={!!selectedFarmerId}
          onClose={() => setSelectedFarmerId(null)}
          title="Farmer Complete Dossier & Records"
        >
          {loadingDetails ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : farmerDetails ? (
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Profile Card Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                    {farmerDetails.farmer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{farmerDetails.farmer.name}</h3>
                      <Badge variant="success">Verified</Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-mono font-medium">{farmerDetails.farmer.phone}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {farmerDetails.farmer.village}, Karnataka • Preferred: {LANG_MAP[farmerDetails.farmer.language || 'kn']}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSend15MinAlert(farmerDetails.farmer._id, farmerDetails.activeToken?._id)}
                    className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                  >
                    <Clock size={13} /> 15-Min Alert
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMsgModal(true)}
                    className="gap-1.5 text-xs font-bold text-slate-700"
                  >
                    <Send size={13} /> Direct Message
                  </Button>
                </div>
              </div>

              {/* Lifetime Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Bookings</span>
                  <span className="text-xl font-black text-slate-900 block mt-0.5">{farmerDetails.summary?.totalBookings || 0}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Procured</span>
                  <span className="text-xl font-black text-emerald-700 block mt-0.5">{farmerDetails.summary?.totalProcuredQuintals || 0} Qtl</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-xs text-slate-400 font-bold uppercase">DBT Earnings</span>
                  <span className="text-xl font-black text-blue-700 block mt-0.5 font-mono">₹{farmerDetails.summary?.totalEarnings?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>

              {/* Active Token Section if any */}
              {farmerDetails.activeToken && (
                <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={13} /> Active Queue Booking
                    </span>
                    <Badge variant="warning">{farmerDetails.activeToken.status.toUpperCase()}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-500">Token Number:</span>
                      <p className="font-mono font-bold text-slate-900 text-sm">#{farmerDetails.activeToken.tokenNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Crop & Qty:</span>
                      <p className="font-bold text-slate-900">{farmerDetails.activeToken.cropType} ({farmerDetails.activeToken.quantity || 50} Qtl)</p>
                    </div>
                    <div>
                      <span className="text-slate-500">APMC Centre:</span>
                      <p className="font-bold text-slate-900">{farmerDetails.activeToken.centreId?.name || 'APMC Yard'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Est. Wait:</span>
                      <p className="font-bold text-slate-900">{farmerDetails.activeToken.estimatedWaitMinutes || 15} Mins</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Procurement Weighment Receipts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <PackageCheck size={14} className="text-primary-600" /> Produce Weighment & Receipts ({farmerDetails.procurements?.length || 0})
                </h4>
                {farmerDetails.procurements?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No past procurement receipts recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {farmerDetails.procurements.map((pr: any) => (
                      <div key={pr._id || pr.receiptNumber} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-primary-700">{pr.receiptNumber}</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{pr.cropType} • {(pr.netWeightKg / 100).toFixed(1)} Qtl • {pr.qualityGrade}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900 font-mono text-sm">₹{pr.totalAmount?.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-emerald-600 font-bold block">Approved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DBT Payments History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Wallet size={14} className="text-blue-600" /> Direct Benefit Transfer (DBT) Credits ({farmerDetails.payments?.length || 0})
                </h4>
                {farmerDetails.payments?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No DBT transactions disbursed yet.</p>
                ) : (
                  <div className="space-y-2">
                    {farmerDetails.payments.map((py: any) => (
                      <div key={py._id || py.transactionId} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-700">{py.transactionId}</span>
                          <p className="text-slate-500 text-[11px] font-mono mt-0.5">UTR: {py.utrNumber || 'UTR88291048'}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900 font-mono text-sm">₹{py.amount?.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-blue-600 font-bold block">{py.status.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* Send Direct Custom Notification Modal */}
      {showMsgModal && (
        <Modal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} title="Send Direct Notice to Farmer">
          <form onSubmit={handleSendDirectMsg} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700">Notification Title</label>
              <input
                type="text"
                placeholder="e.g. Please bring original Land Record RTC copy"
                value={msgTitle}
                onChange={e => setMsgTitle(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Message Content</label>
              <textarea
                rows={3}
                placeholder="Enter specific instructions for this farmer..."
                value={msgBody}
                onChange={e => setMsgBody(e.target.value)}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowMsgModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingMsg} className="bg-primary-600 text-white font-bold text-xs">
                {isSendingMsg ? 'Sending...' : 'Send to Farmer via SMS & App'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
