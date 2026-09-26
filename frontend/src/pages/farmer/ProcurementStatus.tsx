import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Truck, Package, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Card, Badge, EmptyState } from '../../components/ui';

const STATUSES = ['booked', 'arrived', 'processing', 'completed'] as const;
type ProcStatus = typeof STATUSES[number];

const STATUS_ICONS: Record<ProcStatus, React.ElementType> = {
  booked: Clock, arrived: Truck, processing: Package, completed: CheckCircle2
};

const MOCK_PROCUREMENTS = [
  { id: '1', cropType: 'Wheat', quantity: 50, centre: 'Bailhongal APMC', date: '26 Sep 2026', status: 'processing' as ProcStatus, qualityGrade: null },
  { id: '2', cropType: 'Sugarcane', quantity: 120, centre: 'Belagavi APMC', date: '20 Sep 2026', status: 'completed' as ProcStatus, qualityGrade: 'A+' },
  { id: '3', cropType: 'Rice', quantity: 35, centre: 'Hubli APMC', date: '15 Sep 2026', status: 'completed' as ProcStatus, qualityGrade: 'A' },
];

function ProcurementTimeline({ status }: { status: ProcStatus }) {
  const currentIdx = STATUSES.indexOf(status);
  return (
    <div className="flex items-center w-full mt-3">
      {STATUSES.map((s, i) => {
        const Icon = STATUS_ICONS[s];
        const done = i <= currentIdx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${done ? 'bg-primary-600' : 'bg-gray-100'}`}>
                <Icon size={13} className={done ? 'text-white' : 'text-gray-400'} />
              </div>
              <span className={`text-[9px] font-semibold mt-1 capitalize ${done ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STATUSES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentIdx ? 'bg-primary-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProcurementStatus() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Procurement Status</h1>
        <p className="text-sm text-gray-500">{MOCK_PROCUREMENTS.length} total procurements</p>
      </div>

      {MOCK_PROCUREMENTS.length === 0 ? (
        <EmptyState icon={<Package size={28} />} title="No Procurements Yet" description="Your procurement records will appear here after your first booking." />
      ) : (
        MOCK_PROCUREMENTS.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gray-900">{p.cropType}</span>
                      {p.qualityGrade && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                          Grade {p.qualityGrade}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{p.centre} · {p.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === 'completed' ? 'completed' : p.status === 'processing' ? 'processing' : 'waiting'}>
                      {p.status}
                    </Badge>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <ProcurementTimeline status={p.status} />
              </div>
              {expanded === p.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-gray-50 overflow-hidden">
                  <div className="p-4 bg-gray-50 space-y-2">
                    {[
                      { label: 'Quantity', value: `${p.quantity} Quintals` },
                      { label: 'Quality Grade', value: p.qualityGrade || 'Pending assessment' },
                      { label: 'Centre', value: p.centre },
                      { label: 'Date', value: p.date },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-bold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
