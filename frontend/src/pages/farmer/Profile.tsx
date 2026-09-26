import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Globe, Shield, Camera, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge } from '../../components/ui';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function Profile() {
  const { farmer, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('en');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(farmer?.name || 'Ramesh Kumar');
  const [village, setVillage] = useState(farmer?.village || 'Bailhongal, Belagavi');

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const MENU_ITEMS = [
    { label: 'My Bookings', icon: ChevronRight, action: () => navigate('/book-slot') },
    { label: 'Payment History', icon: ChevronRight, action: () => navigate('/payments') },
    { label: 'Notifications', icon: ChevronRight, action: () => navigate('/notifications') },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Profile Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30">
              <User size={28} className="text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-bold">{farmer?.name || name}</h2>
              {farmer?.isVerified && <Shield size={14} className="text-primary-300" />}
            </div>
            <p className="text-blue-200 text-xs flex items-center gap-1">
              <Phone size={11} /> {farmer?.phone || '+91 98765 43210'}
            </p>
            <p className="text-blue-200 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {farmer?.village || village}
            </p>
          </div>
        </div>
        {farmer?.isVerified && (
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 w-fit">
            <Shield size={14} className="text-primary-300" />
            <span className="text-xs font-semibold text-white">Verified Farmer</span>
          </div>
        )}
      </motion.div>

      {/* Language Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} className="text-gray-500" />
          <span className="font-semibold text-sm text-gray-900">Language Preference</span>
        </div>
        <div className="flex gap-2">
          {LANGUAGES.map(lang => (
            <button key={lang.code}
              onClick={() => { setSelectedLang(lang.code); toast.success(`Language changed to ${lang.label}`); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                selectedLang === lang.code ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <span className="block text-sm">{lang.native}</span>
              <span className="text-[10px] opacity-70">{lang.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Edit Profile Form */}
      {isEditing ? (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Edit Profile</h3>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Full Name</label>
            <input className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Village / Town</label>
            <input className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={village} onChange={e => setVillage(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={() => { setIsEditing(false); toast.success('Profile updated!'); }}>Save Changes</Button>
          </div>
        </Card>
      ) : (
        <Button variant="outline" size="md" fullWidth onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      )}

      {/* Menu Items */}
      <Card className="divide-y divide-gray-50 overflow-hidden">
        {MENU_ITEMS.map(item => (
          <button key={item.label} onClick={item.action}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
            <span className="font-medium text-sm text-gray-700">{item.label}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
      </Card>

      {/* Logout */}
      <Button variant="danger" size="lg" fullWidth leftIcon={<LogOut size={16} />} onClick={handleLogout}>
        Sign Out
      </Button>
    </div>
  );
}
