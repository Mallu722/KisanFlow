import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall, CheckCircle2, X, Clock, RefreshCw,
  User, Wheat, MapPin, Filter, Search, ChevronDown,
  AlertCircle, Loader2, Package, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Card, Badge, Button, Modal, EmptyState, Skeleton, type Token } from '../../components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PopulatedToken extends Omit<Token, 'farmerId' | 'centreId'> {
  farmerId: { _id: string; name: string; phone: string; village: string; isVerified?: boolean } | string;
  centreId: { _id: string; name: string; district: string } | string;
}

type ActionType = 'confirm' | 'processing' | 'complete' | 'cancel';

const STATUS_FLOW: Record<string, ActionType[]> = {
  waiting:    ['confirm', 'cancel'],
  called:     ['processing', 'cancel'],
  processing: ['complete', 'cancel'],
};

const STATUS_COLORS: Record<string, string> = {
  waiting:    'bg-blue-50 text-blue-700 border-blue-200',
  called:     'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  completed:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
};

const ACTION_CONFIG: Record<ActionType, { label: string; nextStatus: string; variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'; icon: React.ElementType }> = {
  confirm:    { label: 'Call to Counter', nextStatus: 'called',     variant: 'primary',   icon: PhoneCall },
  processing: { label: 'Mark Arrived',  nextStatus: 'processing', variant: 'secondary', icon: User },
  complete:   { label: 'Mark Complete', nextStatus: 'completed',  variant: 'primary',   icon: CheckCircle2 },
  cancel:     { label: 'Cancel',        nextStatus: 'cancelled',  variant: 'danger',    icon: X },
};

// ─── Token Row Component ────────────────────────────────────────────────────────
function TokenRow({
  token,
  onAction,
  onAdvanceAlert,
  isUpdating
}: {
  token: PopulatedToken;
  onAction: (token: PopulatedToken, action: ActionType) => void;
  onAdvanceAlert: (tokenId: string, name: string) => void;
  isUpdating: string | null;
}) {
  const farmer = typeof token.farmerId === 'object' ? token.farmerId : null;
  const centre = typeof token.centreId === 'object' ? token.centreId : null;
  const actions = STATUS_FLOW[token.status] || [];

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors ${token.status === 'processing' ? 'bg-primary-50/30' : token.status === 'called' ? 'bg-amber-50/30' : ''}`}
    >
      {/* Token # */}
      <td className="px-4 py-4">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black border-2 ${STATUS_COLORS[token.status]}`}>
          #{token.tokenNumber}
        </div>
      </td>

      {/* Farmer */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 font-bold text-xs text-slate-700">
            {farmer?.name?.charAt(0) || 'F'}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 leading-tight">{farmer?.name || '—'}</p>
            <p className="text-xs text-gray-400 font-mono">{farmer?.phone || '—'}</p>
          </div>
        </div>
      </td>

      {/* Crop */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <Wheat size={14} className="text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{token.cropType || 'Produce'}</p>
            <p className="text-xs text-gray-400">{token.quantity || 50} Qtl</p>
          </div>
        </div>
      </td>

      {/* Centre */}
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          <span>{centre?.name || 'Bailhongal APMC'}</span>
        </div>
      </td>

      {/* Wait */}
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
          <Clock size={12} />
          <span>~{token.estimatedWaitMinutes ?? 15} min</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[token.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            token.status === 'waiting' ? 'bg-blue-500' :
            token.status === 'called' ? 'bg-amber-500 animate-pulse' :
            token.status === 'processing' ? 'bg-purple-500 animate-pulse' : 'bg-green-500'
          }`} />
          {token.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {isUpdating === token._id ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 size={14} className="animate-spin" /> Updating...
            </div>
          ) : (
            <>
              {token.status === 'waiting' && (
                <button
                  onClick={() => onAdvanceAlert(token._id, farmer?.name || 'Farmer')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-all"
                  title="Send 15-Minute Advance Arrival Notice to Farmer"
                >
                  <Clock size={12} /> 15-Min Alert
                </button>
              )}

              {actions.map((action) => {
                const config = ACTION_CONFIG[action];
                const Icon = config.icon;
                return (
                  <button
                    key={action}
                    onClick={() => onAction(token, action)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                      action === 'cancel'
                        ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                        : action === 'confirm'
                        ? 'border-primary-300 text-primary-700 bg-primary-50 hover:bg-primary-100'
                        : action === 'processing'
                        ? 'border-secondary-300 text-secondary-700 bg-secondary-50 hover:bg-secondary-100'
                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    <Icon size={13} /> {config.label}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main Officer Queue Page ────────────────────────────────────────────────────
export default function OfficerQueue() {
  const [tokens, setTokens] = useState<PopulatedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ token: PopulatedToken; action: ActionType } | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchQueue = useCallback(async () => {
    try {
      const res = await api.get('/api/officer/queue', {
        params: { status: statusFilter === 'all' ? 'all' : undefined },
      });
      setTokens(res.data.data || []);
      setLastRefresh(new Date());
    } catch {
      // Demo mock tokens
      setTokens([
        {
          _id: 't1',
          tokenNumber: 142,
          status: 'called',
          cropType: 'Wheat',
          quantity: 50,
          position: 1,
          estimatedWaitMinutes: 5,
          farmerId: { _id: 'f1', name: 'Ramesh Huded', phone: '+91 98765 43210', village: 'Bailhongal' },
          centreId: { _id: 'c1', name: 'Bailhongal APMC Yard', district: 'Belagavi' },
          bookedFor: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          _id: 't2',
          tokenNumber: 143,
          status: 'waiting',
          cropType: 'Sugarcane',
          quantity: 120,
          position: 2,
          estimatedWaitMinutes: 20,
          farmerId: { _id: 'f2', name: 'Shankar Malikar', phone: '+91 87654 32109', village: 'Saundatti' },
          centreId: { _id: 'c1', name: 'Bailhongal APMC Yard', district: 'Belagavi' },
          bookedFor: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setIsLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 12000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Handle 15-Minute Advance Alert
  const handleAdvanceAlert = async (tokenId: string, farmerName: string) => {
    try {
      await api.post(`/api/officer/token/${tokenId}/advance-alert`);
      toast.success(`15-min advance arrival alert dispatched to ${farmerName}! 📱`);
    } catch (err: any) {
      toast.error('Failed to send advance alert');
    }
  };

  const handleCallNext = async () => {
    setIsCalling(true);
    try {
      const res = await api.post('/api/officer/queue/call-next');
      toast.success(res.data.message || 'Next token called!');
      await fetchQueue();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No waiting tokens in the queue');
    }
    setIsCalling(false);
  };

  const handleAction = async (token: PopulatedToken, action: ActionType) => {
    if (action === 'cancel') {
      setConfirmModal({ token, action });
      return;
    }
    const nextStatus = ACTION_CONFIG[action].nextStatus;
    setIsUpdating(token._id);
    try {
      await api.put(`/api/officer/token/${token._id}/status`, { status: nextStatus });
      toast.success(`Token #${token.tokenNumber} updated to ${nextStatus}!`);
      await fetchQueue();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update token');
    }
    setIsUpdating(null);
  };

  const handleConfirmCancel = async () => {
    if (!confirmModal) return;
    const { token } = confirmModal;
    setIsUpdating(token._id);
    setConfirmModal(null);
    try {
      await api.put(`/api/officer/token/${token._id}/status`, { status: 'cancelled' });
      toast.success(`Token #${token.tokenNumber} has been cancelled`);
      await fetchQueue();
    } catch (err: any) {
      toast.error('Failed to cancel token');
    }
    setIsUpdating(null);
  };

  const filtered = tokens.filter((t) => {
    if (statusFilter !== 'all' && statusFilter !== 'active') {
      if (t.status !== statusFilter) return false;
    }
    if (!search) return true;
    const farmer = typeof t.farmerId === 'object' ? t.farmerId : null;
    return (
      farmer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      farmer?.phone?.includes(search) ||
      t.cropType?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.tokenNumber).includes(search)
    );
  });

  const waiting = tokens.filter((t) => t.status === 'waiting').length;
  const called = tokens.filter((t) => t.status === 'called').length;
  const processing = tokens.filter((t) => t.status === 'processing').length;

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Summary Chips */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Waiting', count: waiting, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Called to Counter', count: called, color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { label: 'In Verification', count: processing, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${s.color}`}>
              <span className="w-2 h-2 rounded-full bg-current opacity-60" />
              {s.count} {s.label}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={12} />
          Auto-sync: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      {/* Controls Row */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Call Next Button */}
          <Button
            size="lg"
            onClick={handleCallNext}
            isLoading={isCalling}
            className="min-w-[160px] bg-primary-600 text-white font-bold gap-2 shadow-md"
          >
            <PhoneCall size={18} />
            Call Next Token
          </Button>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              placeholder="Search farmer name, crop, token #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              { id: 'active', label: 'Active Queue' },
              { id: 'waiting', label: 'Waiting' },
              { id: 'called', label: 'Called' },
              { id: 'processing', label: 'Processing' },
              { id: 'all', label: 'All' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === f.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={fetchQueue} disabled={isLoading} className="gap-1">
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </Card>

      {/* Queue Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="Queue is Clear"
              description={search ? 'No tokens matched your search' : 'No farmers are currently waiting in this queue state'}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Farmer</th>
                  <th className="px-4 py-3">Produce</th>
                  <th className="px-4 py-3 hidden lg:table-cell">APMC Centre</th>
                  <th className="px-4 py-3 hidden md:table-cell">Est. Wait</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Queue Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((token) => (
                    <TokenRow
                      key={token._id}
                      token={token}
                      onAction={handleAction}
                      onAdvanceAlert={handleAdvanceAlert}
                      isUpdating={isUpdating}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal for Cancel */}
      {confirmModal && (
        <Modal
          isOpen={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          title="Cancel Token Confirmation"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
              <AlertCircle size={20} className="flex-shrink-0" />
              <p className="text-xs font-semibold">
                Are you sure you want to cancel Token #{confirmModal.token.tokenNumber}? This will notify the farmer.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmModal(null)}>Keep Token</Button>
              <Button onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
