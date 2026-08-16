import React, { useState } from 'react';
import { X, FolderPlus, Tag } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
}

const PRESET_COLORS = [
  { hex: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60', text: 'text-blue-700 dark:text-blue-300' },
  { hex: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60', text: 'text-emerald-700 dark:text-emerald-300' },
  { hex: '#8B5CF6', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60', text: 'text-purple-700 dark:text-purple-300' },
  { hex: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60', text: 'text-amber-700 dark:text-amber-300' },
  { hex: '#EC4899', bg: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800/60', text: 'text-pink-700 dark:text-pink-300' },
  { hex: '#06B6D4', bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60', text: 'text-cyan-700 dark:text-cyan-300' },
  { hex: '#EF4444', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60', text: 'text-rose-700 dark:text-rose-300' },
  { hex: '#64748B', bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800', text: 'text-slate-700 dark:text-slate-300' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      name: name.trim(),
      color: selectedColor.hex,
      bgLight: selectedColor.bg,
      textLight: selectedColor.text,
      iconName: 'Tag',
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderPlus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Tambah Kategori / Proyek Baru
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kelompokkan tugas ke dalam folder khusus.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Desain UI, Riset Pasar, Pribadi..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              autoFocus
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Warna Identitas
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => {
                const isSelected = selectedColor.hex === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-400">Pratinjau Label:</span>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${selectedColor.bg} ${selectedColor.text}`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
                {name.trim() || 'Nama Kategori'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
