'use client';

import React, { useState, createContext, useContext } from 'react';

// ─── Button ─────────────────────────────────────────────────────────────────
type ButtonVariant = 'default' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({ variant = 'default', size = 'md', children, className = '', ...props }: ButtonProps) {
  const variantClasses = {
    default: 'bg-black text-white hover:bg-neutral-800 border border-black',
    outline: 'bg-white text-black hover:bg-neutral-50 border border-black',
    ghost: 'bg-transparent text-black hover:bg-neutral-100 border border-transparent',
  }[variant];
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  }[size];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; }

export function Card({ children, className = '' }: CardProps) {
  return <div className={`border border-black bg-white ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`p-4 border-b border-black ${className}`}>{children}</div>;
}
export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
export function CardFooter({ children, className = '' }: CardProps) {
  return <div className={`p-4 border-t border-black ${className}`}>{children}</div>;
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-black bg-white text-black ${className}`}>
      {children}
    </span>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-2 border border-black bg-white text-black text-sm font-mono outline-none focus:ring-1 focus:ring-black ${className}`}
      {...props}
    />
  );
}

// ─── Label ───────────────────────────────────────────────────────────────────
export function Label({ children, className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-[11px] font-mono font-bold uppercase tracking-wider text-black mb-1 ${className}`} {...props}>
      {children}
    </label>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────────
export function Separator({ className = '' }: { className?: string }) {
  return <hr className={`border-t border-black ${className}`} />;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 ${className}`} />;
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ children, className = '' }: CardProps) {
  return <div className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black ${className}`}>{children}</div>;
}
export function AvatarFallback({ children, className = '' }: CardProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-black text-white text-xs font-bold uppercase ${className}`}>
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
  return <div className={`flex border-b border-black ${className}`}>{children}</div>;
}
export function TabsTrigger({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      onClick={() => setActive(value)}
      className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 ${
        active === value
          ? 'border-black text-black bg-neutral-50'
          : 'border-transparent text-neutral-500 hover:text-black hover:bg-neutral-50'
      } ${className}`}
    >
      {children}
    </button>
  );
}
export function TabsContent({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
}

// ─── Dialog ──────────────────────────────────────────────────────────────────
interface DialogProps { open: boolean; onClose: () => void; children: React.ReactNode; }
export function Dialog({ open, onClose, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
export function DialogContent({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {children}
    </div>
  );
}
export function DialogHeader({ children, className = '' }: CardProps) {
  return <div className={`p-6 border-b-2 border-black ${className}`}>{children}</div>;
}
export function DialogTitle({ children, className = '' }: CardProps) {
  return <h2 className={`text-xl font-black uppercase tracking-tight text-black ${className}`}>{children}</h2>;
}
