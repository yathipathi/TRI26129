'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { Search, Plus, PieChart, TrendingUp, ShieldCheck, Activity, Flag } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const DashboardSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'sectors'>('chart');

  const textLower = `${section.title} ${section.subtitle} ${section.badge}`.toLowerCase();
  const isIndiaPakDashboard = textLower.includes('india') || textLower.includes('pakistan') || textLower.includes('development') || textLower.includes('growth');

  const stats = section.items?.slice(0, 4) || [
    { id: '1', stat: '7.2% CAGR', label: 'India GDP Growth 🇮🇳 (Orange)', description: '$4.1T Nominal Output' },
    { id: '2', stat: '2.8% CAGR', label: 'Pakistan GDP Growth 🇵🇰 (Green)', description: '$380B Nominal Output' },
    { id: '3', stat: '$245.0B', label: 'India Tech Exports 🇮🇳 (Orange)', description: '+18.4% YoY Tech Expansion' },
    { id: '4', stat: '$3.2B', label: 'Pakistan Tech Exports 🇵🇰 (Green)', description: '+12.1% YoY Freelance Tech' },
  ];

  const devRows = [
    { id: 'IND-PAK-01', sector: 'GDP Growth Rate (CAGR 2026)', indiaVal: '+7.2% CAGR', pakVal: '+2.8% CAGR', indiaShare: '72%', pakShare: '28%', status: 'India Outperforming', update: 'Live Q3 Sync' },
    { id: 'IND-PAK-02', sector: 'IT & Software Exports', indiaVal: '$245.0 Billion', pakVal: '$3.2 Billion', indiaShare: '98.7%', pakShare: '1.3%', status: 'High Variance', update: 'Annual Report' },
    { id: 'IND-PAK-03', sector: 'Renewable Power Capacity', indiaVal: '190.0 GW Grid', pakVal: '14.0 GW Grid', indiaShare: '93.1%', pakShare: '6.9%', status: 'Solar Expansion', update: '2026 Target' },
    { id: 'IND-PAK-04', sector: 'Foreign Direct Investment (FDI)', indiaVal: '$71.4 Billion', pakVal: '$2.1 Billion', indiaShare: '97.1%', pakShare: '2.9%', status: 'Capital Inflow', update: 'Central Bank Data' },
    { id: 'IND-PAK-05', sector: 'Digital Payment Volume (Monthly)', indiaVal: '13.1 Billion (UPI)', pakVal: '140 Million (Raast)', indiaShare: '98.9%', pakShare: '1.1%', status: 'Digital Stack', update: 'Real-Time Mesh' },
    { id: 'IND-PAK-06', sector: 'Annual STEM Graduates', indiaVal: '1,500,000 / year', pakVal: '280,000 / year', indiaShare: '84.3%', pakShare: '15.7%', status: 'Demographic Pool', update: 'EDU Census' },
  ];

  const filteredDevRows = devRows.filter(r =>
    r.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.indiaVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.pakVal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
          <div>
            {section.badge && (
              <span
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 border border-black bg-white text-black mb-2 inline-flex items-center gap-1.5"
              >
                <Activity className="w-3 h-3 text-orange-500" />
                <span>{section.badge}</span>
              </span>
            )}
            <h2
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
              className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black outline-none focus:ring-1 focus:ring-black"
            >
              {section.title || 'Development Growth Telemetry'}
            </h2>
            <p
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
              className="text-xs sm:text-sm font-mono text-neutral-600 mt-1 outline-none focus:ring-1 focus:ring-black"
            >
              {section.subtitle || 'Comparative macroeconomic analysis highlighting India (Orange) and Pakistan (Green) development growth.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3.5 py-2 border border-black text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'chart' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Pie Chart View
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-2 border border-black text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'table' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Data Stream
            </button>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((card, idx) => {
            const cardLabel = card.label || '';
            const isIndiaCard = cardLabel.toLowerCase().includes('india') || idx % 2 === 0;
            const isPakCard = cardLabel.toLowerCase().includes('pakistan') || idx % 2 === 1;

            return (
              <div
                key={card.id || idx}
                className={`border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden`}
              >
                {/* Accent Color Strip for Explicit Country Identification */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isIndiaCard ? 'bg-orange-500' : isPakCard ? 'bg-emerald-600' : 'bg-black'
                  }`}
                />

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-700">
                    {card.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border border-black ${
                      isIndiaCard ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isIndiaCard ? '🇮🇳 INDIA' : '🇵🇰 PAKISTAN'}
                  </span>
                </div>

                <div className="text-3xl font-black tracking-tight text-black mb-1">
                  {card.stat}
                </div>
                <div className="text-xs font-mono text-neutral-600 font-bold">
                  {card.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* PIE CHART & DEVELOPMENT COMPARISON PANEL */}
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                Regional Tech & Industrial Growth Share (Pie Chart)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-orange-500 border border-black inline-block" />
                <span>India 🇮🇳 (Orange: 82.4%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-emerald-600 border border-black inline-block" />
                <span>Pakistan 🇵🇰 (Green: 17.6%)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: SVG Pie Chart Component */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 border-2 border-black bg-neutral-50 relative">
              <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-md">
                {/* India Arc: 82.4% -> 296.6 deg -> StrokeDasharray 362.4 out of 439.8 */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="34"
                  strokeDasharray="362.4 439.8"
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                />
                {/* Pakistan Arc: 17.6% -> 63.4 deg -> StrokeDasharray 77.4 out of 439.8 */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="34"
                  strokeDasharray="77.4 439.8"
                  strokeDashoffset="-362.4"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                />
                {/* Center Donut Hole */}
                <circle cx="100" cy="100" r="50" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                <text x="100" y="92" textAnchor="middle" className="text-[9px] font-mono font-bold uppercase fill-neutral-500">
                  REGIONAL SHARE
                </text>
                <text x="100" y="112" textAnchor="middle" className="text-sm font-black fill-black">
                  2026 GROWTH
                </text>
              </svg>

              <div className="mt-4 grid grid-cols-2 gap-3 w-full text-center text-xs font-mono">
                <div className="p-2 border border-black bg-orange-50 text-orange-950 font-bold">
                  <div className="text-[10px] text-orange-700">INDIA 🇮🇳</div>
                  <div className="text-base font-black text-orange-600">82.4%</div>
                  <div className="text-[9px] text-neutral-600">Vibrant Orange</div>
                </div>
                <div className="p-2 border border-black bg-emerald-50 text-emerald-950 font-bold">
                  <div className="text-[10px] text-emerald-700">PAKISTAN 🇵🇰</div>
                  <div className="text-base font-black text-emerald-600">17.6%</div>
                  <div className="text-[9px] text-neutral-600">Vibrant Green</div>
                </div>
              </div>
            </div>

            {/* Right: Comparative Progress Bars & Macro Breakdown */}
            <div className="lg:col-span-7 space-y-6 font-mono">
              <div className="space-y-4">
                {/* Metric 1: GDP Expansion Rate */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 inline-block border border-black" />
                      <span>India GDP CAGR (+7.2%) vs Pakistan (+2.8%)</span>
                    </span>
                    <span className="text-neutral-600">7.2% vs 2.8%</span>
                  </div>
                  <div className="h-4 border-2 border-black bg-neutral-100 flex overflow-hidden">
                    <div style={{ width: '72%' }} className="bg-orange-500 h-full border-r border-black" title="India 7.2%" />
                    <div style={{ width: '28%' }} className="bg-emerald-600 h-full" title="Pakistan 2.8%" />
                  </div>
                </div>

                {/* Metric 2: IT & Tech Revenue ($245B vs $3.2B) */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 inline-block border border-black" />
                      <span>IT Services Revenue (India $245B vs Pakistan $3.2B)</span>
                    </span>
                    <span className="text-neutral-600">98.7% vs 1.3%</span>
                  </div>
                  <div className="h-4 border-2 border-black bg-neutral-100 flex overflow-hidden">
                    <div style={{ width: '98.7%' }} className="bg-orange-500 h-full border-r border-black" title="India $245B" />
                    <div style={{ width: '1.3%' }} className="bg-emerald-600 h-full" title="Pakistan $3.2B" />
                  </div>
                </div>

                {/* Metric 3: Renewable Energy Capacity (190 GW vs 14 GW) */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 inline-block border border-black" />
                      <span>Clean Energy Grid Capacity (190 GW vs 14 GW)</span>
                    </span>
                    <span className="text-neutral-600">93.1% vs 6.9%</span>
                  </div>
                  <div className="h-4 border-2 border-black bg-neutral-100 flex overflow-hidden">
                    <div style={{ width: '93.1%' }} className="bg-orange-500 h-full border-r border-black" title="India 190 GW" />
                    <div style={{ width: '6.9%' }} className="bg-emerald-600 h-full" title="Pakistan 14 GW" />
                  </div>
                </div>

                {/* Metric 4: FDI Net Inflows ($71B vs $2.1B) */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 inline-block border border-black" />
                      <span>Foreign Direct Investment Inflow ($71B vs $2.1B)</span>
                    </span>
                    <span className="text-neutral-600">97.1% vs 2.9%</span>
                  </div>
                  <div className="h-4 border-2 border-black bg-neutral-100 flex overflow-hidden">
                    <div style={{ width: '97.1%' }} className="bg-orange-500 h-full border-r border-black" title="India $71B" />
                    <div style={{ width: '2.9%' }} className="bg-emerald-600 h-full" title="Pakistan $2.1B" />
                  </div>
                </div>
              </div>

              <div className="p-4 border-2 border-black bg-neutral-50 text-xs leading-relaxed">
                <div className="font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>Color Coding Standard</span>
                </div>
                <p className="text-neutral-700">
                  <strong className="text-orange-600 font-bold">India (Orange #F97316)</strong> represents Digital Public Infrastructure (UPI), $4.1T GDP scale, and IT exports.
                  <strong className="text-emerald-700 font-bold ml-2">Pakistan (Green #16A34A)</strong> represents CPEC freight corridors, freelance tech workforce expansion, and agricultural modernization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Development Data Stream Table */}
        <div className="border-2 border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50">
            <div className="text-xs font-mono font-bold uppercase text-black flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span>Comparative Development Indicators Stream</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter indicators..."
                className="pl-8 pr-3 py-1.5 border border-black bg-white text-xs font-mono text-black placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-100 border-b-2 border-black text-black text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 border-r border-neutral-300">Development Sector</th>
                  <th className="py-3 px-4 border-r border-neutral-300 bg-orange-50 text-orange-950">India 🇮🇳 (Orange)</th>
                  <th className="py-3 px-4 border-r border-neutral-300 bg-emerald-50 text-emerald-950">Pakistan 🇵🇰 (Green)</th>
                  <th className="py-3 px-4 border-r border-neutral-300">Relative Ratio</th>
                  <th className="py-3 px-4">Status & Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredDevRows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-black border-r border-neutral-200">
                      {row.sector}
                    </td>
                    <td className="py-3 px-4 font-bold text-orange-600 bg-orange-50/50 border-r border-neutral-200">
                      {row.indiaVal}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 bg-emerald-50/50 border-r border-neutral-200">
                      {row.pakVal}
                    </td>
                    <td className="py-3 px-4 text-neutral-700 border-r border-neutral-200 font-bold">
                      <span className="text-orange-600">{row.indiaShare}</span> / <span className="text-emerald-700">{row.pakShare}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 border border-black text-[10px] font-bold uppercase text-black bg-white shadow-xs">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
