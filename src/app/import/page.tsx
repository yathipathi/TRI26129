'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileCode, CheckCircle2 } from 'lucide-react';

export default function ImportPage() {
  const router = useRouter();
  const [jsonContent, setJsonContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!jsonContent.trim()) return;

    setLoading(true);
    try {
      const parsed = JSON.parse(jsonContent);
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: parsed }),
      });

      const data = await res.json();
      if (data.siteId) {
        router.push(`/builder?siteId=${data.siteId}`);
      } else {
        alert(data.error || 'Import failed.');
      }
    } catch (err: any) {
      alert('Invalid JSON syntax: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setJsonContent(evt.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col justify-center items-center p-6 font-mono">
      <div className="max-w-xl w-full border-2 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <Link href="/dashboard" className="p-1 border border-black hover:bg-black hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="font-black text-sm uppercase flex items-center gap-2">
            <FileCode className="w-4 h-4 text-orange-500" />
            <span>SiteSpec Import</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase text-black">Re-Import SiteSpec JSON</h1>
          <p className="text-xs text-neutral-600 mt-1">Upload or paste an exported SiteSpec JSON file to restore and edit a project.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase mb-1">Upload spec.json File</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full p-2.5 border-2 border-black bg-neutral-50 text-black cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-bold uppercase mb-1">Or Paste Raw JSON</label>
            <textarea
              rows={8}
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder='{ "meta": { "siteName": "My Enterprise Site" }, ... }'
              className="w-full p-3 border-2 border-black bg-white text-black outline-none font-mono text-[11px]"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={loading || !jsonContent.trim()}
            className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-orange-500" />
            <span>{loading ? 'Processing Import...' : 'Import Project & Launch Editor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
