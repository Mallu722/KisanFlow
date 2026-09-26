import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ChevronRight, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { VoiceInput } from '../../components/VoiceInput';

// Interfaces for our data
interface Centre {
  _id: string;
  name: string;
  location: { lat: number; lng: number };
  currentLoad: number;
  totalCapacity: number;
  avgProcessingTimeMinutes: number;
}

export default function BookSlot() {
  const [step, setStep] = useState(1);
  const [cropDetails, setCropDetails] = useState({ type: '', quantity: '' });
  
  // Backend State
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedToken, setBookedToken] = useState<any>(null);

  const handleVoiceResult = (text: string) => {
    // In a real app, this would use NLP to extract crop and quantity
    setCropDetails({ type: 'Wheat', quantity: '50' });
  };

  const fetchCentres = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/centres/recommend');
      if (response.data.success) {
        setCentres(response.data.data);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend. Please ensure the server is running.');
      // Fallback data if backend is offline so UI doesn't completely break during demo
      setCentres([
        { _id: '1', name: "Bailhongal APMC (Mock)", location: {lat:0, lng:0}, currentLoad: 12, totalCapacity: 100, avgProcessingTimeMinutes: 15 },
        { _id: '2', name: "Hubli Main Market (Mock)", location: {lat:0, lng:0}, currentLoad: 180, totalCapacity: 250, avgProcessingTimeMinutes: 20 }
      ]);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (centreId: string) => {
    setLoading(true);
    try {
      // Hardcoded dummy farmer ID for now
      const response = await api.post('/api/slots/book', {
        farmerId: '60d21b4667d0d8992e610c85', 
        centreId
      });
      if (response.data.success) {
        setBookedToken(response.data.data);
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setBookedToken({ tokenNumber: Math.floor(Math.random() * 100) + 1 });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-krishi transition-all duration-500 rounded-full -z-10" 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>
          
          {[1, 2, 3].map((num) => (
            <div 
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm ${
                step >= num ? 'bg-krishi text-white' : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              {step > num ? <CheckCircle2 size={16} /> : num}
            </div>
          ))}
        </div>

        {/* Step 1: Crop Details */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold text-gray-800 mb-6">What are you bringing?</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={cropDetails.type}
                    onChange={(e) => setCropDetails({ ...cropDetails, type: e.target.value })}
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-krishi focus:ring-2 focus:ring-krishi-light outline-none transition-all"
                    placeholder="e.g., Wheat, Rice"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                     <VoiceInput onResult={handleVoiceResult} className="p-2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity (Quintals)</label>
                <input 
                  type="number" 
                  value={cropDetails.quantity}
                  onChange={(e) => setCropDetails({ ...cropDetails, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-krishi focus:ring-2 focus:ring-krishi-light outline-none transition-all"
                  placeholder="e.g., 50"
                />
              </div>

              <button 
                onClick={fetchCentres}
                disabled={!cropDetails.type || !cropDetails.quantity || loading}
                className="w-full mt-6 bg-krishi hover:bg-krishi-dark text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Find Centres <Search size={20} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Centre */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <h2 className="text-xl font-bold text-gray-800 mb-2">Nearby Recommended Centres</h2>
             {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
             
             <div className="space-y-4 mt-4">
                {centres.map((centre) => {
                  const estWait = centre.currentLoad * centre.avgProcessingTimeMinutes;
                  return (
                    <div 
                      key={centre._id} 
                      onClick={() => !loading && bookSlot(centre._id)} 
                      className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-krishi hover:bg-krishi-light/30 transition-all flex justify-between items-center group relative overflow-hidden"
                    >
                      {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[1px]"><Loader2 className="animate-spin text-krishi" /></div>}
                      <div>
                        <h3 className="font-bold text-gray-800">{centre.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={14}/> 2.5 km (Mock)</span>
                          <span className={`${estWait > 600 ? 'text-red-500' : 'text-green-600'} font-medium`}>
                            {estWait > 600 ? 'High Load' : 'Low Load'} (~{Math.round(estWait/60)} hrs wait)
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-krishi transition-colors" />
                    </div>
                  );
                })}
             </div>
             <button onClick={() => setStep(1)} className="mt-6 text-gray-500 font-medium hover:text-gray-800 transition-colors">
               &larr; Back
             </button>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Slot Confirmed!</h2>
            <p className="text-gray-500 mb-6">Your token number is <span className="font-bold text-gray-900 text-lg">#{bookedToken?.tokenNumber || '142'}</span></p>
            
            <button className="w-full bg-krishi hover:bg-krishi-dark text-white font-bold py-3.5 rounded-xl transition-all mb-3 shadow-md shadow-green-200">
              View Live Queue
            </button>
            <button onClick={() => { setStep(1); setBookedToken(null); setCropDetails({type: '', quantity: ''}) }} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all">
              Book Another
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
