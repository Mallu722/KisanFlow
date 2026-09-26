import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
});

// Request interceptor: attach auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Something went wrong. Please try again.';

    // Don't toast for 401 (handled by AuthContext)
    if (error.response?.status !== 401) {
      toast.error(message, { id: 'api-error' });
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Typed API helpers ────────────────────────────────────────────────────────

export const centresApi = {
  recommend: () => api.get<ApiResponse<Centre[]>>('/api/centres/recommend'),
  getAll: () => api.get<ApiResponse<Centre[]>>('/api/centres'),
};

export const slotsApi = {
  book: (data: BookSlotInput) => api.post<ApiResponse<Token>>('/api/slots/book', data),
  getActiveToken: (farmerId: string) =>
    api.get<ApiResponse<Token>>(`/api/slots/active/${farmerId}`),
};

export const farmerApi = {
  sendOtp: (phone: string) => api.post<ApiResponse<null>>('/api/farmer/send-otp', { phone }),
  verifyOtp: (data: { phone: string; otp: string }) =>
    api.post<ApiResponse<{ token: string; farmer: Farmer }>>('/api/farmer/verify-otp', data),
  login: (data: { phone: string; otp?: string }) =>
    api.post<ApiResponse<{ token: string; farmer: Farmer }>>('/api/farmer/verify-otp', data),
  getProfile: (id: string) => api.get<ApiResponse<Farmer>>(`/api/farmer/${id}`),
  updateProfile: (id: string, data: Partial<Farmer>) =>
    api.put<ApiResponse<Farmer>>(`/api/farmer/${id}`, data),
};

export const procurementApi = {
  getByFarmer: (farmerId: string) =>
    api.get<ApiResponse<Procurement[]>>(`/api/procurement/${farmerId}`),
};

export const paymentsApi = {
  getByFarmer: (farmerId: string) =>
    api.get<ApiResponse<Payment[]>>(`/api/payments/${farmerId}`),
};

export const officerApi = {
  getDashboard: () => api.get<ApiResponse<DashboardStats>>('/api/officer/dashboard'),
  getQueue: () => api.get<ApiResponse<Token[]>>('/api/officer/queue'),
  callNext: (centreId: string) =>
    api.post<ApiResponse<Token>>('/api/officer/queue/call-next', { centreId }),
  updateTokenStatus: (tokenId: string, status: string) =>
    api.put<ApiResponse<Token>>(`/api/officer/token/${tokenId}/status`, { status }),
  getFarmers: (params?: { search?: string; page?: number }) =>
    api.get<ApiResponse<Farmer[]>>('/api/officer/farmers', { params }),
};

// ─── Shared types (mirror backend schema) ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Farmer {
  _id: string;
  name: string;
  phone: string;
  village: string;
  language: 'en' | 'hi' | 'kn';
  isVerified: boolean;
  createdAt: string;
}

export interface Centre {
  _id: string;
  name: string;
  location: { lat: number; lng: number };
  district: string;
  currentLoad: number;
  totalCapacity: number;
  avgProcessingTimeMinutes: number;
  isActive: boolean;
}

export interface Token {
  _id: string;
  tokenNumber: number;
  farmerId: string;
  centreId: string | Centre;
  cropType: string;
  quantity: number;
  status: 'waiting' | 'called' | 'processing' | 'completed' | 'cancelled';
  position: number;
  estimatedWaitMinutes: number;
  bookedFor: string;
  createdAt: string;
}

export interface Procurement {
  _id: string;
  farmerId: string;
  centreId: string;
  cropType: string;
  quantity: number;
  qualityGrade?: string;
  status: 'booked' | 'arrived' | 'processing' | 'completed';
  createdAt: string;
}

export interface Payment {
  _id: string;
  farmerId: string;
  procurementId: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid';
  transactionRef?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalFarmers: number;
  todayBookings: number;
  activeQueue: number;
  completedToday: number;
  procurementData: { time: string; tokens: number; completed: number }[];
  liveQueue: Token[];
}

export interface BookSlotInput {
  farmerId: string;
  centreId: string;
  cropType: string;
  quantity: number;
}
