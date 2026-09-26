import { motion } from 'framer-motion';
import { Users, CalendarCheck, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';

const analyticsData = [
  { time: '09:00', tokens: 12, completed: 5 },
  { time: '10:00', tokens: 25, completed: 18 },
  { time: '11:00', tokens: 45, completed: 30 },
  { time: '12:00', tokens: 68, completed: 42 },
  { time: '13:00', tokens: 82, completed: 55 },
  { time: '14:00', tokens: 110, completed: 78 },
];

const mockQueue = [
  { id: '#142', farmer: 'Ramesh H.', status: 'Processing', time: '10 mins ago' },
  { id: '#143', farmer: 'Shankar M.', status: 'Waiting', time: 'Arrived' },
  { id: '#144', farmer: 'Lakshmi V.', status: 'Waiting', time: 'Not Arrived' },
  { id: '#145', farmer: 'Suresh K.', status: 'Waiting', time: 'Not Arrived' },
];

export default function Dashboard() {
  const stats = [
    { label: 'Total Farmers', value: '1,248', trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Today\'s Bookings', value: '342', trend: '+5%', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Queue', value: '68', trend: '-2', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed Today', value: '276', trend: '+40', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Procurement Overview (Today)</h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-krishi text-gray-600 font-medium">
              <option>Bailhongal APMC</option>
              <option>All Centres</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="tokens" name="Tokens Issued" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Queue Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-0 shadow-sm border border-gray-100 flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
            <h3 className="text-lg font-bold text-gray-800">Live Queue (Gate 1)</h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> LIVE
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockQueue.map((item, i) => (
              <div key={item.id} className={`p-4 rounded-xl border ${item.status === 'Processing' ? 'border-krishi bg-krishi-light/50' : 'border-gray-100 bg-white hover:border-gray-300'} transition-colors flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`text-sm font-bold px-2 py-1 rounded ${item.status === 'Processing' ? 'bg-krishi text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {item.id}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.farmer}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
                {item.status === 'Processing' ? (
                   <button className="text-xs font-bold bg-white text-krishi-dark border border-krishi px-3 py-1.5 rounded-lg shadow-sm hover:bg-krishi hover:text-white transition-colors">Finish</button>
                ) : (
                   <button className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-800 transition-colors">Call</button>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
            <Link to="/officer/queue" className="text-sm font-bold text-krishi-dark hover:text-krishi flex items-center justify-center gap-1">
              View Full Queue <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
