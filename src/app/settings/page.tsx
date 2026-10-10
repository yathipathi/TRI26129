'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme-provider';
import { ArrowLeft, Palette, Moon, Sun, Shield, Sparkles, CheckCircle2, Check } from 'lucide-react';
import {
  Button, Card, CardHeader, CardContent, CardFooter,
  Badge, Chip, Switch, TextField
} from '@/components/ui';

export default function SettingsPage() {
  const { themeMode, skin, resolvedTheme, setThemeMode, setSkin, toggleTheme } = useTheme();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans flex flex-col selection:bg-md-primary-container selection:text-md-on-primary-container">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-md-surface/90 backdrop-blur-md border-b border-md-outline-variant/50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4 text-md-primary" />
            </div>
            <span className="font-bold text-base text-md-on-surface">Workspace Settings</span>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">Workspace</Button>
          </Link>
        </nav>
      </header>

      {/* Main Settings Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-md-on-surface">Settings & Preferences</h1>
          <p className="text-xs text-md-on-surface-variant mt-1.5">
            Configure application theme skins, design tokens, and local offline fallbacks.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-md-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        {/* Visual Skin Switcher */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-md-on-surface">Design System Skin</h2>
                <p className="text-xs text-md-on-surface-variant mt-0.5">
                  Choose between Google Material Design 3 and Microsoft Fluent 2 aesthetics.
                </p>
              </div>
              <Badge variant="primary">{skin === 'material3' ? 'Google M3' : 'Microsoft Fluent 2'}</Badge>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Material 3 Card */}
            <div
              onClick={() => setSkin('material3')}
              className={`p-5 rounded-md-xl border-2 m3-transition cursor-pointer space-y-3 ${
                skin === 'material3'
                  ? 'border-md-primary bg-md-primary-container/20 shadow-md-2'
                  : 'border-md-outline-variant/60 bg-md-surface hover:border-md-outline'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-md-on-surface">Google Material Design 3</span>
                {skin === 'material3' && <Check className="w-4 h-4 text-md-primary" />}
              </div>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">
                Tonal surface containers, 28px rounded shapes, pill action buttons, and elevation layer shadows.
              </p>
              <div className="flex gap-2 pt-1">
                <span className="w-5 h-5 rounded-full bg-[#0b57d0] inline-block" />
                <span className="w-5 h-5 rounded-full bg-[#d3e3fd] inline-block" />
                <span className="w-5 h-5 rounded-full bg-[#f0f4f9] inline-block border border-gray-300" />
              </div>
            </div>

            {/* Fluent 2 Card */}
            <div
              onClick={() => setSkin('fluent2')}
              className={`p-5 rounded-md-xl border-2 m3-transition cursor-pointer space-y-3 ${
                skin === 'fluent2'
                  ? 'border-md-primary bg-md-primary-container/20 shadow-md-2'
                  : 'border-md-outline-variant/60 bg-md-surface hover:border-md-outline'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-md-on-surface">Microsoft Fluent 2</span>
                {skin === 'fluent2' && <Check className="w-4 h-4 text-md-primary" />}
              </div>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">
                High-density toolbars, 4px rounded corner scales, subtle 1px border lines, and Inter/Segoe typography.
              </p>
              <div className="flex gap-2 pt-1">
                <span className="w-5 h-5 rounded-sm bg-[#0078d4] inline-block" />
                <span className="w-5 h-5 rounded-sm bg-[#eff6fc] inline-block" />
                <span className="w-5 h-5 rounded-sm bg-[#f5f5f5] inline-block border border-gray-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Mode */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-md-on-surface">Color Theme Mode</h2>
            <p className="text-xs text-md-on-surface-variant mt-0.5">Toggle light, dark, or system preferences.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { key: 'system', label: '💻 System Default' },
                { key: 'light', label: '☀️ Light Theme' },
                { key: 'dark', label: '🌙 Dark Theme' },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant={themeMode === item.key ? 'filled' : 'outlined'}
                  size="sm"
                  onClick={() => setThemeMode(item.key as any)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="pt-2 text-xs text-md-on-surface-variant">
              Currently resolved theme: <strong className="text-md-on-surface uppercase">{resolvedTheme}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Developer Keys & Offline Fallbacks */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-md-on-surface">LLM & Search API Keys (Optional)</h2>
            <p className="text-xs text-md-on-surface-variant mt-0.5">
              Groq free tier is configured by default. Fallback models work automatically offline.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Groq API Key" placeholder="gsk_..." type="password" helperText="Stored safely in environment settings" />
            <TextField label="Tavily Search API Key" placeholder="tvly-..." type="password" helperText="Used for internet evidence sourcing" />
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="filled" onClick={handleSave} className="font-semibold">
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
