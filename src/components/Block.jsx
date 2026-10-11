import React from 'react';
import { HelpCircle, Trash2, Plus } from 'lucide-react';

export function WeightBlock({ type, count = 1, onRemove, isDraggable = true, panSource = null, compact = false }) {
  const isX = type === 'x';

  const handleDragStart = (e) => {
    if (!isDraggable) return;
    const payload = JSON.stringify({
      type,
      source: panSource || 'shelf'
    });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  if (compact) {
    return (
      <div
        draggable={isDraggable}
        onDragStart={handleDragStart}
        className={`group relative flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform active:scale-95 select-none ${
          isX
            ? 'w-11 h-11 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 text-white rounded-xl shadow-lg border-2 border-purple-300/40 block-x-shadow'
            : 'w-11 h-11 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-amber-950 font-bold rounded-xl shadow-lg border-2 border-amber-200/50 block-1kg-shadow'
        }`}
        title={isX ? "Mystery X Box (Click to remove)" : "1kg Weight (Click to remove)"}
        onClick={onRemove}
      >
        {isX ? (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="font-extrabold text-sm tracking-wider font-mono">X</span>
            <span className="text-[9px] opacity-75 font-sans">? kg</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="font-black text-sm tracking-tight">1</span>
            <span className="text-[8px] uppercase tracking-tighter opacity-80 font-bold">kg</span>
          </div>
        )}

        {/* Remove button badge on hover */}
        {onRemove && (
          <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow transition-opacity">
            <Trash2 className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    );
  }

  // Dispenser / Tray block presentation
  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all hover:-translate-y-1 active:translate-y-0.5 select-none ${
        isX
          ? 'bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-950 text-white border-2 border-purple-400/40 block-x-shadow'
          : 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-amber-950 border-2 border-amber-200/70 block-1kg-shadow'
      }`}
    >
      {/* 3D Bevel Highlight */}
      <div className="absolute inset-x-2 top-1.5 h-1.5 bg-white/30 rounded-full blur-[1px]"></div>

      {isX ? (
        <>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-900/40 border border-purple-300/30 flex items-center justify-center mb-1.5 relative overflow-hidden group-hover:scale-105 transition-transform">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-purple-100 drop-shadow-md">
              X
            </span>
            <HelpCircle className="w-4 h-4 text-purple-300/60 absolute bottom-1 right-1" />
          </div>
          <div className="text-center">
            <div className="font-bold text-xs sm:text-sm text-purple-100 tracking-wide flex items-center gap-1 justify-center">
              Mystery Box
            </div>
            <div className="text-[10px] text-purple-300 font-mono font-medium">weight = X</div>
          </div>
        </>
      ) : (
        <>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-600/30 border border-amber-200/40 flex flex-col items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <span className="text-xl sm:text-2xl font-black text-amber-950 drop-shadow-sm">1</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 -mt-1">KG</span>
          </div>
          <div className="text-center">
            <div className="font-extrabold text-xs sm:text-sm text-amber-950 tracking-tight">
              1kg Weight
            </div>
            <div className="text-[10px] text-amber-900 font-bold font-mono">constant = 1</div>
          </div>
        </>
      )}

      {/* Drag badge helper */}
      <div className="mt-2 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-black/20 text-white/90 backdrop-blur-sm group-hover:bg-black/30 transition-colors">
        Drag or Click +
      </div>
    </div>
  );
}
