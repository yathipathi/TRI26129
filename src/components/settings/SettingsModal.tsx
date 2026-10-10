'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Database, Shield, Check, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [clerkPublishableKey, setClerkPublishableKey] = useState('');
  const [activeProvider, setActiveProvider] = useState<'built-in' | 'gemini' | 'openai'>('built-in');
  const [saved, setSaved] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResults, setVerifyResults] = useState<Record<string, { ok: boolean; message: string }> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      setGeminiKey(localStorage.getItem('gemini_api_key') || '');
      setOpenaiKey(localStorage.getItem('openai_api_key') || '');
      setSupabaseUrl(localStorage.getItem('supabase_url') || '');
      setSupabaseAnonKey(localStorage.getItem('supabase_anon_key') || '');
      setMongoUri(localStorage.getItem('mongo_uri') || '');
      setClerkPublishableKey(localStorage.getItem('clerk_pub_key') || '');
      setActiveProvider((localStorage.getItem('ai_provider') as any) || 'built-in');
      setVerifyResults(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnections = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiKey,
          openaiKey,
          supabaseUrl,
          supabaseAnonKey,
          mongoUri,
          clerkKey: clerkPublishableKey,
        }),
      });
      const data = await res.json();
      if (data.results) {
        setVerifyResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', geminiKey);
      localStorage.setItem('openai_api_key', openaiKey);
      localStorage.setItem('supabase_url', supabaseUrl);
      localStorage.setItem('supabase_anon_key', supabaseAnonKey);
      localStorage.setItem('mongo_uri', mongoUri);
      localStorage.setItem('clerk_pub_key', clerkPublishableKey);
      localStorage.setItem('ai_provider', activeProvider);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
              API CONFIGURATION & CREDENTIAL MANAGER
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">Settings & Credentials</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* AI Provider selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-3">
              Active AI Generation Engine
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'built-in', name: 'Built-in Agent', desc: 'Zero-latency neural compiler' },
                { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 1.5/2.0 Flash / Pro' },
                { id: 'openai', name: 'OpenAI GPT', desc: 'GPT-4o / GPT-4o-mini' },
              ].map((prov) => (
                <button
                  type="button"
                  key={prov.id}
                  onClick={() => setActiveProvider(prov.id as any)}
                  className={`p-3 border-2 border-black text-left transition-all ${
                    activeProvider === prov.id
                      ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-bold text-xs uppercase">{prov.name}</div>
                  <div className={`text-[10px] mt-1 ${activeProvider === prov.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {prov.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Keys */}
          <div className="space-y-4 border-t border-black pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase">
                <Key className="w-3.5 h-3.5" />
                <span>AI Engine Keys</span>
              </div>
              {verifyResults?.gemini && (
                <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${verifyResults.gemini.ok ? 'text-green-700' : 'text-red-600'}`}>
                  {verifyResults.gemini.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span>{verifyResults.gemini.ok ? 'Gemini Active' : 'Gemini Error'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Database & Auth Connectors */}
          <div className="space-y-4 border-t border-black pt-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase">
              <Database className="w-3.5 h-3.5" />
              <span>Supabase / MongoDB / Clerk Integration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                  MongoDB Connection URI
                </label>
                <input
                  type="password"
                  placeholder="mongodb+srv://..."
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-700 mb-1">
                  Clerk Publishable Key
                </label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={clerkPublishableKey}
                  onChange={(e) => setClerkPublishableKey(e.target.value)}
                  className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Connection Test Results Box */}
          {verifyResults && Object.keys(verifyResults).length > 0 && (
            <div className="border border-black p-3 bg-neutral-50 space-y-1.5 text-xs font-mono">
              <div className="font-bold uppercase text-[10px] text-neutral-600 mb-1">Live Connection Verification:</div>
              {Object.entries(verifyResults).map(([key, res]) => (
                <div key={key} className="flex items-center gap-2">
                  {res.ok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-700 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  )}
                  <span className="font-bold uppercase">{key}:</span>
                  <span className="text-neutral-700">{res.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-between">
            <button
              type="button"
              disabled={isVerifying}
              onClick={handleTestConnections}
              className="px-4 py-2 text-xs font-mono font-bold uppercase border border-black hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
            >
              {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isVerifying ? 'Testing...' : 'Test All Connections'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-black hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {saved ? <Check className="w-4 h-4 text-green-400" /> : <Shield className="w-4 h-4" />}
                <span>{saved ? 'Saved & Active' : 'Save & Activate'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
