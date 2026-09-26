import React from 'react';
import { motion } from 'framer-motion';

// ─── Shared Token type (re-exported for convenience) ─────────────────────────
export interface Token {
  _id: string;
  tokenNumber: number;
  farmerId: string;
  centreId: string;
  cropType: string;
  quantity: number;
  status: 'waiting' | 'called' | 'processing' | 'completed' | 'cancelled';
  position: number;
  estimatedWaitMinutes: number;
  bookedFor: string;
  createdAt: string;
}


// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon,
  fullWidth, children, className = '', disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm shadow-primary-200',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-400 bg-transparent',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px] gap-1.5',
    md: 'px-4 py-2.5 text-sm min-h-[44px] gap-2',
    lg: 'px-6 py-3.5 text-base min-h-[52px] gap-2',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size={size === 'sm' ? 14 : 18} /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void; }
export function Card({ children, className = '', hover, onClick }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''} transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'waiting' | 'called' | 'processing' | 'completed' | 'cancelled' | 'pending' | 'paid' | 'success' | 'warning' | 'danger' | 'info';
interface BadgeProps { variant: BadgeVariant; children: React.ReactNode; className?: string; }
export function Badge({ variant, children, className = '' }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    waiting:    'bg-blue-50 text-blue-700 border-blue-200',
    called:     'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    completed:  'bg-green-50 text-green-700 border-green-200',
    cancelled:  'bg-red-50 text-red-700 border-red-200',
    pending:    'bg-amber-50 text-amber-700 border-amber-200',
    paid:       'bg-green-50 text-green-700 border-green-200',
    success:    'bg-green-50 text-green-700 border-green-200',
    warning:    'bg-amber-50 text-amber-700 border-amber-200',
    danger:     'bg-red-50 text-red-700 border-red-200',
    info:       'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg'; }
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} z-10`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
interface SkeletonProps { className?: string; }
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`shimmer rounded-xl ${className}`} />;
}

export function CardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-4/5" />
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex justify-between">
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </Card>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode; }
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── OfflineBanner ────────────────────────────────────────────────────────────
export function OfflineBanner() {
  return (
    <motion.div initial={{ y: -40 }} animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-sm font-medium text-center py-2 px-4">
      📡 You're offline — data will sync when you reconnect
    </motion.div>
  );
}
