'use client';

import React, { useState, createContext, useContext } from 'react';

// ─── Button ─────────────────────────────────────────────────────────────────
export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'ghost' | 'fab' | 'default' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({ variant = 'filled', size = 'md', children, className = '', ...props }: ButtonProps) {
  // Normalize legacy variants
  const effectiveVariant = variant === 'default' ? 'filled' : variant === 'outline' ? 'outlined' : variant;

  const variantClasses = {
    filled: 'bg-md-primary text-md-on-primary hover:shadow-md-1 active:opacity-90 border border-transparent',
    tonal: 'bg-md-secondary-container text-md-on-secondary-container hover:bg-opacity-90 border border-transparent',
    outlined: 'border border-md-outline text-md-primary hover:bg-md-primary/10 bg-transparent',
    ghost: 'bg-transparent text-md-primary hover:bg-md-primary/10 border border-transparent',
    fab: 'bg-md-primary-container text-md-on-primary-container shadow-md-3 hover:shadow-md-4 rounded-md-xl border border-transparent font-medium',
  }[effectiveVariant];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-md-full',
    md: 'px-5 py-2.5 text-sm rounded-md-full',
    lg: 'px-7 py-3 text-base rounded-md-full',
    icon: 'p-2.5 rounded-md-full',
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium tracking-wide m3-transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; onClick?: () => void; }

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-md-surface rounded-md-xl border border-md-outline-variant/60 shadow-md-1 hover:shadow-md-2 m3-transition text-md-on-surface overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`p-5 border-b border-md-outline-variant/40 ${className}`}>{children}</div>;
}
export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
export function CardFooter({ children, className = '' }: CardProps) {
  return <div className={`p-4 bg-md-surface-container-low border-t border-md-outline-variant/40 flex items-center justify-between ${className}`}>{children}</div>;
}

// ─── Badge & Chip ────────────────────────────────────────────────────────────
export function Badge({ children, className = '', variant = 'tonal' }: { children: React.ReactNode; className?: string; variant?: 'tonal' | 'primary' | 'error' | 'outline' }) {
  const variantClasses = {
    tonal: 'bg-md-secondary-container text-md-on-secondary-container',
    primary: 'bg-md-primary-container text-md-on-primary-container',
    error: 'bg-md-error-container text-md-on-error-container',
    outline: 'border border-md-outline text-md-on-surface-variant bg-transparent',
  }[variant];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md-full transition-colors ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}

export function Chip({ children, active, onClick, className = '' }: { children: React.ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md-sm border m3-transition cursor-pointer ${
        active
          ? 'bg-md-secondary-container border-md-secondary text-md-on-secondary-container font-semibold shadow-sm'
          : 'bg-md-surface border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container'
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Input & TextField ──────────────────────────────────────────────────────
export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-md-sm border border-md-outline bg-md-surface-lowest text-md-on-surface text-sm outline-none m3-transition focus:border-md-primary focus:ring-2 focus:ring-md-primary/20 placeholder:text-md-on-surface-variant/50 ${className}`}
      {...props}
    />
  );
}

export function TextField({ label, error, helperText, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; helperText?: string }) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-md-on-surface-variant mb-1.5">{label}</label>}
      <Input className={error ? 'border-md-error focus:ring-md-error/20' : ''} {...props} />
      {error && <p className="mt-1 text-xs text-md-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-md-on-surface-variant">{helperText}</p>}
    </div>
  );
}

// ─── Label ──────────────────────────────────────────────────────────────────
export function Label({ children, className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-xs font-medium text-md-on-surface-variant mb-1 ${className}`} {...props}>
      {children}
    </label>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────────
export function Separator({ className = '' }: { className?: string }) {
  return <hr className={`border-t border-md-outline-variant/60 my-2 ${className}`} />;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-md-surface-container-high rounded-md-sm ${className}`} />;
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ children, className = '' }: CardProps) {
  return <div className={`relative flex h-9 w-9 shrink-0 overflow-hidden rounded-md-full border border-md-outline-variant/40 shadow-xs ${className}`}>{children}</div>;
}
export function AvatarFallback({ children, className = '' }: CardProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-md-primary-container text-md-on-primary-container text-xs font-bold ${className}`}>
      {children}
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
interface TabsContextValue { active: string; setActive: (v: string) => void; }
const TabsContext = createContext<TabsContextValue>({ active: '', setActive: () => {} });

export function Tabs({ defaultValue, children, className = '' }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}
export function TabsList({ children, className = '' }: CardProps) {
  return <div className={`flex bg-md-surface-container-low p-1 rounded-md-lg border border-md-outline-variant/40 gap-1 ${className}`}>{children}</div>;
}
export function TabsTrigger({ value, children, onClick, className = '' }: { value: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  const { active, setActive } = useContext(TabsContext);
  const isSelected = active === value;
  return (
    <button
      type="button"
      onClick={() => {
        setActive(value);
        if (onClick) onClick();
      }}
      className={`flex-1 px-4 py-2 text-xs font-medium rounded-md-md m3-transition cursor-pointer text-center ${
        isSelected
          ? 'bg-md-surface text-md-primary shadow-md-1 font-semibold'
          : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface/50'
      } ${className}`}
    >
      {children}
    </button>
  );
}
export function TabsContent({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={`mt-3 ${className}`}>{children}</div>;
}

// ─── Dialog ──────────────────────────────────────────────────────────────────
interface DialogProps { open: boolean; onClose: () => void; children: React.ReactNode; }
export function Dialog({ open, onClose, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
export function DialogContent({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-md-surface rounded-md-xl border border-md-outline-variant max-w-2xl w-full max-h-[90vh] flex flex-col shadow-md-4 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
export function DialogHeader({ children, className = '' }: CardProps) {
  return <div className={`p-6 border-b border-md-outline-variant/60 ${className}`}>{children}</div>;
}
export function DialogTitle({ children, className = '' }: CardProps) {
  return <h2 className={`text-xl font-bold tracking-tight text-md-on-surface ${className}`}>{children}</h2>;
}

// ─── Switch ──────────────────────────────────────────────────────────────────
export function Switch({ checked, onChange, label, className = '' }: { checked: boolean; onChange: (val: boolean) => void; label?: string; className?: string }) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <div
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-md-full p-1 m3-transition flex items-center ${
          checked ? 'bg-md-primary justify-end' : 'bg-md-surface-container-highest justify-start border border-md-outline'
        }`}
      >
        <div className={`w-5 h-5 rounded-md-full bg-white shadow-md-1 transform m3-transition`} />
      </div>
      {label && <span className="text-sm font-medium text-md-on-surface">{label}</span>}
    </label>
  );
}

// ─── Linear Progress ────────────────────────────────────────────────────────
export function LinearProgress({ value, className = '' }: { value?: number; className?: string }) {
  return (
    <div className={`w-full h-1.5 bg-md-primary-container rounded-md-full overflow-hidden ${className}`}>
      {value !== undefined ? (
        <div className="h-full bg-md-primary m3-transition" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      ) : (
        <div className="h-full bg-md-primary animate-pulse w-2/3 rounded-md-full" />
      )}
    </div>
  );
}

// ─── Snackbar / Toast ───────────────────────────────────────────────────────
export function Snackbar({ message, actionLabel, onAction, onClose, open = true }: { message: string; actionLabel?: string; onAction?: () => void; onClose?: () => void; open?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-3 bg-md-surface-container-highest text-md-on-surface rounded-md-md shadow-md-3 border border-md-outline-variant text-sm animate-fadeIn max-w-md">
      <span className="flex-1">{message}</span>
      {actionLabel && (
        <button onClick={onAction} className="text-xs font-semibold text-md-primary hover:underline uppercase tracking-wider">
          {actionLabel}
        </button>
      )}
      {onClose && (
        <button onClick={onClose} className="text-md-on-surface-variant hover:text-md-on-surface text-base leading-none">
          ✕
        </button>
      )}
    </div>
  );
}
