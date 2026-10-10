'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const AuthSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fields = section.authFields || [
    { id: '1', label: 'Username or Email', type: 'text', placeholder: 'name@domain.com', required: true },
    { id: '2', label: 'Password', type: 'password', placeholder: '••••••••••••', required: true },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-b-2 border-black flex items-center justify-center min-h-[600px]">
      <div className="max-w-md w-full mx-auto">
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Brand Icon / Security Icon */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 border border-black bg-black text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            {section.badge && (
              <span
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
                className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 border border-black bg-white text-black outline-none"
              >
                {section.badge}
              </span>
            )}
          </div>

          {/* Heading */}
          <h2
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
            className="text-2xl font-black uppercase tracking-tight text-black mb-1 outline-none focus:ring-1 focus:ring-black"
          >
            {isSignUp ? 'Create Your Account' : section.title}
          </h2>

          {/* Subtitle */}
          <p
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
            className="text-xs font-mono text-neutral-600 mb-6 outline-none focus:ring-1 focus:ring-black"
          >
            {isSignUp ? 'Fill in your credentials to get started.' : (section.subtitle || 'Please enter your username and password to continue.')}
          </p>

          {/* Tab Switcher */}
          <div className="flex border-2 border-black p-0.5 bg-neutral-100 mb-6 text-xs font-mono font-bold uppercase">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 transition-all ${
                !isSignUp ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 transition-all ${
                isSignUp ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Register
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold uppercase text-black font-mono">
                {isSignUp ? 'Account Created' : 'Authenticated Successfully'}
              </h3>
              <p className="text-xs text-neutral-600 font-mono">
                Redirecting to secure workspace...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field, idx) => (
                <div key={field.id || idx}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-black">
                      {field.label}
                    </label>
                    {!isSignUp && field.type === 'password' && (
                      <a href="#forgot" className="text-[10px] font-mono font-bold text-neutral-600 hover:text-black underline uppercase">
                        Forgot?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black"
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded-none border border-black text-black focus:ring-0"
                />
                <label htmlFor="remember" className="text-xs font-mono text-neutral-700 select-none cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold uppercase text-xs border border-black transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>{isSignUp ? 'Create Account' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Social Logins */}
              <div className="pt-4 border-t border-black">
                <div className="text-center text-[10px] text-neutral-500 uppercase font-mono font-bold tracking-wider mb-2">
                  Or continue with
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="py-2 px-3 border border-black hover:bg-neutral-100 text-xs font-mono font-bold uppercase text-black flex items-center justify-center transition-colors"
                  >
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="py-2 px-3 border border-black hover:bg-neutral-100 text-xs font-mono font-bold uppercase text-black flex items-center justify-center transition-colors"
                  >
                    <span>GitHub</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
