import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Send, Users, Smartphone, RefreshCw, MessageSquare,
  AlertTriangle, Info, CheckCircle2, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Skeleton, EmptyState } from '../../components/ui';
import api from '../../lib/api';

interface NotificationLog {
  _id: string;
  farmerId?: { _id: string; name: string; phone: string; village: string } | null;
  title: string;
  message: string;
  type: 'queue' | 'procurement' | 'payment' | 'announcement' | 'alert';
  sentBy: string;
  channel: string;
  createdAt: string;
}

export default function OfficerNotifications() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    channel: 'both',
    targetAudience: 'all', // 'all', 'waiting_queue', 'procurement'
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/officer/notifications');
      setLogs(res.data.data || []);
    } catch {
      setLogs([
        {
          _id: 'n1',
          title: 'Weighbridge Maintenance Update',
          message: 'Counter #2 will undergo brief calibration at 1:30 PM. Token callings will continue on Counter #1.',
          type: 'alert',
          sentBy: 'Senior Procurement Officer',
          channel: 'both',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'n2',
          title: 'Wheat Procurement Target Reached',
          message: 'Daily intake quota of 200 Quintals has been fulfilled. Booking for tomorrow will reopen at 6:00 PM.',
          type: 'announcement',
          sentBy: 'Senior Procurement Officer',
          channel: 'app',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.error('Please enter a notification title and message');
      return;
    }

    setIsSending(true);
    try {
      await api.post('/api/officer/notifications/send', {
        title: form.title,
        message: form.message,
        type: form.type,
        channel: form.channel,
      });

      toast.success('Broadcast alert dispatched to farmers! 📢');
      setForm({
        title: '',
        message: '',
        type: 'announcement',
        channel: 'both',
        targetAudience: 'all',
      });
      fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch notification');
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="text-primary-600" />
            Farmer Broadcast & Notification Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch urgent APMC yard announcements, queue updates, weather alerts, and SMS broadcasts to farmers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading} className="gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Broadcast Composer */}
        <div className="lg:col-span-1">
          <Card className="p-5 border-slate-200/80 shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="p-2 bg-primary-100 rounded-xl text-primary-700">
                <Send size={18} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Send Broadcast Alert</h3>
                <p className="text-xs text-slate-400">Delivers in-app & via SMS gateway</p>
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g., Weather Alert: Rain Expected"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Target Category</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="announcement">📢 APMC Announcement</option>
                  <option value="alert">⚠️ Urgent Yard Alert</option>
                  <option value="queue">⏱️ Queue & Token Notice</option>
                  <option value="procurement">🌾 Procurement Update</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Broadcast Channel</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'both', label: 'SMS & App' },
                    { id: 'app', label: 'App Only' },
                    { id: 'sms', label: 'SMS Only' },
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, channel: ch.id }))}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                        form.channel === ch.id
                          ? 'bg-primary-50 border-primary-400 text-primary-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed notification message for farmers in Kannada / English..."
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs gap-2 shadow-md"
              >
                <Send size={14} />
                {isSending ? 'Transmitting Broadcast...' : 'Broadcast to All Farmers'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Notification Activity History */}
        <div className="lg:col-span-2">
          <Card className="p-5 border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare size={16} className="text-primary-600" />
                Dispatched Notifications & Queue Alerts
              </h3>
              <span className="text-xs text-slate-400 font-bold">{logs.length} Logged</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(n => (
                  <Skeleton key={n} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <EmptyState
                title="No notifications broadcasted yet"
                description="Use the composer on the left to send notifications to registered farmers."
              />
            ) : (
              <div className="space-y-3">
                {logs.map(log => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.type === 'alert'
                              ? 'bg-red-500'
                              : log.type === 'queue'
                              ? 'bg-blue-500'
                              : log.type === 'payment'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-900">{log.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {log.channel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{log.message}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px] text-slate-400">
                      <span>
                        Recipient: {log.farmerId ? `${log.farmerId.name} (${log.farmerId.phone})` : '🌐 All Farmers Broadcast'}
                      </span>
                      <span>By: {log.sentBy}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
