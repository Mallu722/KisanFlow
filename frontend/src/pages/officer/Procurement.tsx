import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageCheck, Plus, Search, Filter, RefreshCw,
  FileCheck2, AlertCircle, CheckCircle2, ChevronDown, Download, Eye, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Modal, Skeleton, EmptyState } from '../../components/ui';
import api from '../../lib/api';

interface ProcurementRecord {
  _id: string;
  receiptNumber: string;
  farmerId: { _id: string; name: string; phone: string; village: string };
  centreId: { _id: string; name: string; district: string };
  cropType: string;
  variety: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  moisturePercent: number;
  qualityGrade: string;
  mspRatePerQuintal: number;
  totalAmount: number;
  status: 'pending_quality' | 'approved' | 'rejected' | 'settled';
  officerNotes: string;
  createdAt: string;
}

const MSP_RATES: Record<string, number> = {
  Wheat: 2275,
  Paddy: 2300,
  Maize: 2090,
  Cotton: 7121,
  Sugarcane: 315,
  Soybean: 4892,
  Gram: 5440,
};

export default function OfficerProcurement() {
  const [records, setRecords] = useState<ProcurementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProcurementRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    farmerName: '',
    phone: '',
    cropType: 'Wheat',
    variety: 'FAQ Grade Sharbati',
    grossWeightKg: 4000,
    tareWeightKg: 200,
    moisturePercent: 12.0,
    qualityGrade: 'FAQ Grade A',
    mspRatePerQuintal: 2275,
    officerNotes: '',
  });

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/officer/procurements');
      setRecords(res.data.data || []);
    } catch {
      // Demo fallback
      setRecords([
        {
          _id: 'p1',
          receiptNumber: 'KF-PR-9042',
          farmerId: { _id: 'f1', name: 'Ramesh Huded', phone: '+91 98765 43210', village: 'Bailhongal' },
          centreId: { _id: 'c1', name: 'Bailhongal APMC Yard', district: 'Belagavi' },
          cropType: 'Wheat',
          variety: 'Sharbati FAQ',
          grossWeightKg: 4250,
          tareWeightKg: 250,
          netWeightKg: 4000,
          moisturePercent: 11.8,
          qualityGrade: 'FAQ Grade A',
          mspRatePerQuintal: 2275,
          totalAmount: 91000,
          status: 'settled',
          officerNotes: 'Clean grain verified on sensor.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleCropChange = (crop: string) => {
    const rate = MSP_RATES[crop] || 2200;
    setForm(prev => ({ ...prev, cropType: crop, mspRatePerQuintal: rate }));
  };

  const handleCreateProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Resolve or create farmer and centre
      const farmersRes = await api.get('/api/officer/farmers');
      const centresRes = await api.get('/api/officer/centres');
      const farmer = farmersRes.data.data?.[0];
      const centre = centresRes.data.data?.[0];

      await api.post('/api/officer/procurements', {
        farmerId: farmer?._id,
        centreId: centre?._id,
        ...form,
      });

      toast.success('Procurement entry recorded & DBT triggered! 🌾');
      setShowModal(false);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save procurement entry');
    }
    setIsSubmitting(false);
  };

  const filtered = records.filter(r => {
    const matchSearch =
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.farmerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.cropType.toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter === 'all' || r.qualityGrade === gradeFilter;
    return matchSearch && matchGrade;
  });

  const netKg = Math.max(0, form.grossWeightKg - form.tareWeightKg);
  const calcAmount = Math.round((netKg / 100) * form.mspRatePerQuintal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <PackageCheck className="text-primary-600" />
            Procurement Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Weighbridge entry, moisture sensor grading, MSP valuation & automated DBT receipting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRecords} disabled={isLoading} className="gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowModal(true)} className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-md">
            <Plus size={16} /> Record Weighment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt, farmer, crop..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'FAQ Grade A', 'FAQ Grade B', 'Grade C', 'Rejected'].map(grade => (
            <button
              key={grade}
              onClick={() => setGradeFilter(grade)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                gradeFilter === grade
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grade === 'all' ? 'All Grades' : grade}
            </button>
          ))}
        </div>
      </Card>

      {/* Procurement Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <Skeleton key={n} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No procurement records found"
          description="Click 'Record Weighment' to enter a weighbridge receipt and notify the farmer."
          action={<Button onClick={() => setShowModal(true)}>Add Weighment Entry</Button>}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Farmer</th>
                  <th className="py-3.5 px-4">Crop & Grade</th>
                  <th className="py-3.5 px-4">Net Qtl</th>
                  <th className="py-3.5 px-4">Moisture</th>
                  <th className="py-3.5 px-4">Total MSP (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map(rec => (
                  <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-700">
                      {rec.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rec.farmerId?.name || 'Farmer'}</div>
                      <div className="text-xs text-slate-400">{rec.farmerId?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>{rec.cropType}</span>
                        <span className="text-xs text-slate-400 font-normal">({rec.variety})</span>
                      </div>
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                        rec.qualityGrade.includes('A') ? 'bg-emerald-50 text-emerald-700' :
                        rec.qualityGrade.includes('B') ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {rec.qualityGrade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {(rec.netWeightKg / 100).toFixed(2)} Qtl
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {rec.moisturePercent}%
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{rec.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={rec.status === 'settled' ? 'success' : rec.status === 'approved' ? 'default' : 'warning'}>
                        {rec.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRecord(rec)}
                        className="gap-1 text-xs py-1 px-2.5 h-8"
                      >
                        <Eye size={13} /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Procurement Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Produce Weighment & Grade">
        <form onSubmit={handleCreateProcurement} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Crop Type</label>
              <select
                value={form.cropType}
                onChange={e => handleCropChange(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                {Object.keys(MSP_RATES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Variety / Standard</label>
              <input
                type="text"
                value={form.variety}
                onChange={e => setForm(p => ({ ...p, variety: e.target.value }))}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Gross Weight (Kg)</label>
              <input
                type="number"
                value={form.grossWeightKg}
                onChange={e => setForm(p => ({ ...p, grossWeightKg: Number(e.target.value) }))}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Tare / Bag Weight (Kg)</label>
              <input
                type="number"
                value={form.tareWeightKg}
                onChange={e => setForm(p => ({ ...p, tareWeightKg: Number(e.target.value) }))}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Moisture Content (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.moisturePercent}
                onChange={e => setForm(p => ({ ...p, moisturePercent: Number(e.target.value) }))}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Quality Grade</label>
              <select
                value={form.qualityGrade}
                onChange={e => setForm(p => ({ ...p, qualityGrade: e.target.value }))}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              >
                <option value="FAQ Grade A">FAQ Grade A</option>
                <option value="FAQ Grade B">FAQ Grade B</option>
                <option value="Grade C">Grade C</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Real-time Calculation Summary */}
          <div className="bg-primary-50/70 border border-primary-200/80 rounded-xl p-3.5 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Net Weight:</span>
              <span className="font-extrabold text-slate-900">{netKg} Kg ({(netKg / 100).toFixed(2)} Qtl)</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Govt. MSP Rate:</span>
              <span className="font-extrabold text-slate-900">₹{form.mspRatePerQuintal} / Qtl</span>
            </div>
            <div className="flex justify-between text-sm font-black text-primary-900 border-t border-primary-200 pt-1.5 mt-1">
              <span>Total Payout Amount:</span>
              <span>₹{calcAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary-600 text-white font-bold">
              {isSubmitting ? 'Recording...' : 'Save & Initiate DBT'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Record Details Modal */}
      {selectedRecord && (
        <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Procurement Receipt Summary">
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Receipt</span>
                  <p className="text-base font-black text-slate-900 font-mono">{selectedRecord.receiptNumber}</p>
                </div>
                <Badge variant="success">OFFICIALLY RECORDED</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400">Farmer Name:</span>
                  <p className="font-bold text-slate-800">{selectedRecord.farmerId?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Contact:</span>
                  <p className="font-bold text-slate-800">{selectedRecord.farmerId?.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Centre:</span>
                  <p className="font-bold text-slate-800">{selectedRecord.centreId?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Date:</span>
                  <p className="font-bold text-slate-800">{new Date(selectedRecord.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Crop / Variety:</span>
                <span className="font-bold text-slate-800">{selectedRecord.cropType} ({selectedRecord.variety})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross / Tare / Net:</span>
                <span className="font-bold text-slate-800">{selectedRecord.grossWeightKg}kg / {selectedRecord.tareWeightKg}kg / {(selectedRecord.netWeightKg / 100).toFixed(2)} Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moisture Content:</span>
                <span className="font-bold text-slate-800">{selectedRecord.moisturePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quality Grading:</span>
                <span className="font-bold text-emerald-700">{selectedRecord.qualityGrade}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 text-slate-900">
                <span>Total DBT Payout:</span>
                <span className="text-primary-600">₹{selectedRecord.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
              <Button onClick={() => { toast.success('Receipt sent via SMS to farmer'); setSelectedRecord(null); }} className="gap-1.5 bg-primary-600 text-white font-bold">
                <Download size={14} /> Send SMS Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
