import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Navigation, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QueueStatus() {
  const [position, setPosition] = useState(14);
  const [estimatedWait, setEstimatedWait] = useState(45); // in minutes
  const [status, setStatus] = useState<'waiting' | 'called' | 'processing' | 'completed'>('waiting');

  // Simulate queue moving
  useEffect(() => {
    const timer = setInterval(() => {
      setPosition((prev) => {
        if (prev <= 1) return 1;
        setEstimatedWait((wait) => Math.max(0, wait - 3));
        return prev - 1;
      });
    }, 15000); // Queue moves every 15s for demo purposes

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/home" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h2 className="text-xl font-bold text-gray-800">Live Queue Status</h2>
      </div>

      {/* Main Ticket Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-krishi-light rounded-bl-full -z-10 opacity-50"></div>
        
        <div className="text-center mb-6">
          <p className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">Your Token Number</p>
          <div className="text-6xl font-black text-gray-900 tracking-tighter">#142</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
            <p className="text-orange-600 font-medium text-sm mb-1">Position</p>
            <p className="text-3xl font-bold text-orange-700">{position}</p>
            <p className="text-xs text-orange-500 mt-1">in queue</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
            <p className="text-blue-600 font-medium text-sm mb-1">Est. Wait</p>
            <p className="text-3xl font-bold text-blue-700">{estimatedWait}</p>
            <p className="text-xs text-blue-500 mt-1">minutes</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-medium">Centre</p>
            <p className="font-bold text-gray-800">Bailhongal APMC Yard</p>
          </div>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 text-krishi hover:text-white hover:bg-krishi transition-colors">
            <Navigation size={18} />
          </button>
        </div>
      </motion.div>

      {/* Leave Home Alert */}
      {position <= 5 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3 shadow-sm"
        >
          <div className="mt-0.5">
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-yellow-800 text-sm">Leave Home Alert!</h4>
            <p className="text-yellow-700 text-sm mt-1">You are almost at the front of the queue. Please start heading to the centre if you haven't already.</p>
          </div>
        </motion.div>
      )}

      {/* Live Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6">Queue Timeline</h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-krishi before:via-gray-200 before:to-gray-200">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-krishi text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
              <Clock size={16} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-800 text-sm">Token Generated</h4>
                <span className="text-xs font-medium text-gray-500">09:15 AM</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-krishi text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-krishi bg-krishi-light/30 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-krishi-dark text-sm">Waiting in Queue</h4>
                <span className="text-xs font-bold text-krishi">NOW</span>
              </div>
              <p className="text-xs text-gray-600">Currently processing Token #128</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-200 text-gray-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 opacity-60">
              <h4 className="font-bold text-gray-500 text-sm">Token Called</h4>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
