'use client';

import React, { useState, useEffect } from 'react';
import { Section, SectionItem } from '@/types';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { generateId } from '@/lib/ai-generator';

interface SectionEditorModalProps {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: Section) => void;
}

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Section | null>(section);

  useEffect(() => {
    if (section) {
      setFormData({ ...section });
    }
  }, [section, isOpen]);

  if (!isOpen || !section || !formData) return null;

  const handleItemChange = (index: number, field: keyof SectionItem, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem: SectionItem = {
      id: generateId(),
      title: 'New Feature Item',
      description: 'Describe the value proposition or feature here in detail.',
      badge: 'NEW',
    };
    setFormData({
      ...formData,
      items: [...(formData.items || []), newItem],
    });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = (formData.items || []).filter((_, idx) => idx !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
              SECTION EDITOR // TYPE: {formData.type}
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">Edit Section Content</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Title */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
              Section Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-black text-sm bg-white text-black outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
              Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-black text-sm bg-white text-black outline-none focus:ring-1 focus:ring-black resize-none"
            />
          </div>

          {/* Badge */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
              Badge Label
            </label>
            <input
              type="text"
              value={formData.badge || ''}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="e.g. CORE ARCHITECTURE"
              className="w-full px-4 py-2.5 border-2 border-black text-sm bg-white text-black outline-none focus:ring-1 focus:ring-black font-mono"
            />
          </div>

          {/* Items / Cards / List */}
          {formData.items && formData.items.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  List Items / Cards ({formData.items.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 text-xs border border-black bg-white hover:bg-black hover:text-white font-bold uppercase transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {formData.items.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 border border-black bg-neutral-50 relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase">Item #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="text-neutral-500 hover:text-black transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Title / Heading"
                      value={item.title || item.question || ''}
                      onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-black text-xs bg-white text-black outline-none font-bold"
                    />

                    <textarea
                      rows={2}
                      placeholder="Description / Body copy / Answer"
                      value={item.description || item.answer || ''}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-black text-xs bg-white text-black outline-none resize-none"
                    />

                    {/* Pricing specific */}
                    {formData.type === 'pricing' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Price (e.g. $49)"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          className="px-3 py-1.5 border border-black text-xs bg-white font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Period (e.g. / mo)"
                          value={item.period || ''}
                          onChange={(e) => handleItemChange(idx, 'period', e.target.value)}
                          className="px-3 py-1.5 border border-black text-xs bg-white"
                        />
                      </div>
                    )}

                    {/* Stats specific */}
                    {formData.type === 'stats' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Metric (e.g. 99.99%)"
                          value={item.stat || ''}
                          onChange={(e) => handleItemChange(idx, 'stat', e.target.value)}
                          className="px-3 py-1.5 border border-black text-xs bg-white font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Label (e.g. Uptime SLA)"
                          value={item.label || ''}
                          onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                          className="px-3 py-1.5 border border-black text-xs bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-black text-black hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
