import React, { useState } from 'react';
import { WeightBlock } from './Block';
import { Plus, Minus, ArrowDownCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

export function BalanceScale({
  leftPans,
  rightPans,
  secretX,
  tiltAngle,
  isBalanced,
  onAddBlock,
  onRemoveBlock,
  onTransferBlock,
}) {
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  // Left & Right pan weight sums
  const leftWeight = leftPans.xBlocks * secretX + leftPans.oneKgBlocks;
  const rightWeight = rightPans.xBlocks * secretX + rightPans.oneKgBlocks;

  // Handle HTML5 Drag Drop
  const handleDrop = (e, targetPan) => {
    e.preventDefault();
    setIsHoveringLeft(false);
    setIsHoveringRight(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data || !data.type) return;

      soundFx.playClink();

      if (data.source === 'shelf') {
        // Adding new block from shelf
        onAddBlock(targetPan, data.type);
      } else if (data.source !== targetPan) {
        // Moving from one pan to another
        onTransferBlock(data.source, targetPan, data.type);
      }
    } catch {
      // Ignored
    }
  };

  const handleDragOver = (e, pan) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (pan === 'left') setIsHoveringLeft(true);
    if (pan === 'right') setIsHoveringRight(true);
  };

  const handleDragLeave = (pan) => {
    if (pan === 'left') setIsHoveringLeft(false);
    if (pan === 'right') setIsHoveringRight(false);
  };

  // Generate arrays of blocks for rendering
  const renderBlocks = (xCount, oneKgCount, panName) => {
    const blocks = [];
    for (let i = 0; i < xCount; i++) {
      blocks.push(
        <WeightBlock
          key={`${panName}-x-${i}`}
          type="x"
          compact={true}
          panSource={panName}
          onRemove={() => {
            soundFx.playPop();
            onRemoveBlock(panName, 'x');
          }}
        />
      );
    }
    for (let i = 0; i < oneKgCount; i++) {
      blocks.push(
        <WeightBlock
          key={`${panName}-1kg-${i}`}
          type="1kg"
          compact={true}
          panSource={panName}
          onRemove={() => {
            soundFx.playPop();
            onRemoveBlock(panName, '1kg');
          }}
        />
      );
    }
    return blocks;
  };

  return (
    <div className="relative w-full h-[360px] min-[420px]:h-[400px] sm:h-[460px] md:h-[490px] flex flex-col items-center justify-center select-none overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial-gradient from-slate-900/50 to-slate-950 pointer-events-none" />

      {/* Tilt Angle Indicator & Calibration Gauge at Top */}
      <div className="absolute top-2 sm:top-3 flex flex-col items-center z-10">
        <div className="relative w-36 sm:w-40 h-7 sm:h-8 flex items-end justify-center">
          {/* Degree Arc ticks */}
          <div className="flex items-center justify-between w-full px-4 text-[9px] font-mono text-slate-500 font-bold">
            <span className={tiltAngle < -3 ? 'text-amber-400 font-bold' : ''}>-14°</span>
            <span className={Math.abs(tiltAngle) <= 1 ? 'text-emerald-400 font-extrabold text-xs' : ''}>0°</span>
            <span className={tiltAngle > 3 ? 'text-indigo-400 font-bold' : ''}>+14°</span>
          </div>
          {/* Center Balance Arrow */}
          <div className="absolute bottom-0 w-1 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
        </div>
      </div>

      {/* Main Balance Apparatus Container with Responsive Scale */}
      <div className="relative w-full max-w-[620px] h-[360px] flex items-center justify-center scale-[0.68] min-[400px]:scale-[0.8] sm:scale-95 md:scale-100 origin-center transition-transform">

        {/* 1. Base Stand and Center Pillar (Static) */}
        <div className="absolute bottom-4 flex flex-col items-center z-0 pointer-events-none">
          {/* Vertical brass/steel column */}
          <div className="w-5 sm:w-6 h-56 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 rounded-t-sm shadow-xl border-x border-slate-500/40" />

          {/* Heavy ornate base pedestal */}
          <div className="w-48 sm:w-56 h-8 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 rounded-t-2xl border-t border-slate-500/50 shadow-2xl relative flex items-center justify-center">
            <div className="w-36 h-2 bg-gradient-to-r from-amber-500/30 via-purple-500/40 to-amber-500/30 rounded-full" />
            <span className="absolute -bottom-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
              PRECISION BALANCE
            </span>
          </div>
          {/* Base bottom footpad */}
          <div className="w-56 sm:w-64 h-3 bg-slate-900 rounded-b-lg border-t border-slate-700" />
        </div>

        {/* 2. Center Fulcrum & Needle (Pivot Point is at center of beam) */}
        <div className="absolute top-[82px] z-20 flex flex-col items-center pointer-events-none">
          {/* Fulcrum housing */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-200 shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-amber-300/60" />
          </div>
          {/* Triangular pivot wedge */}
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-amber-600 drop-shadow" />
        </div>

        {/* 3. ROTATING BEAM ASSEMBLY (Tilts smoothly based on tiltAngle) */}
        <div
          className="absolute top-[96px] w-[500px] sm:w-[540px] h-4 flex items-center justify-center z-10 transition-transform duration-500 ease-out origin-center scale-beam-glow"
          style={{
            transform: `rotate(${tiltAngle}deg)`,
          }}
        >
          {/* The Needle that points up at the gauge */}
          <div 
            className="absolute bottom-2 w-1 h-14 bg-gradient-to-t from-amber-400 to-rose-400 rounded-t-full shadow-md origin-bottom pointer-events-none"
            style={{
              filter: isBalanced ? 'drop-shadow(0 0 6px #10b981)' : 'none'
            }}
          >
            <div className="w-2.5 h-2.5 -ml-[3px] -mt-1 bg-amber-300 rounded-full border border-amber-500" />
          </div>

          {/* The Horizontal Crossbeam */}
          <div className="w-full h-3.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 rounded-full shadow-lg border-y border-amber-200/60 flex items-center justify-between px-2 relative">
            {/* Center decorative ring */}
            <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-amber-200 bg-amber-600/60" />
            
            {/* Left Beam Hook / Ring */}
            <div className="w-4 h-4 rounded-full border-2 border-amber-200 bg-amber-500 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* Right Beam Hook / Ring */}
            <div className="w-4 h-4 rounded-full border-2 border-amber-200 bg-amber-500 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>
          </div>

          {/* 4. LEFT SUSPENDED PAN ASSEMBLY (Counter-rotated by -tiltAngle so it hangs straight) */}
          <div
            className="absolute left-1 top-2 flex flex-col items-center transition-transform duration-500 ease-out origin-top z-30"
            style={{
              transform: `rotate(${-tiltAngle}deg)`,
            }}
          >
            {/* Chains / Suspension Strings (SVG lines) */}
            <svg className="w-40 h-28 pointer-events-none overflow-visible" viewBox="0 0 160 110">
              <defs>
                <linearGradient id="chainGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
              <line x1="80" y1="0" x2="16" y2="105" stroke="url(#chainGradLeft)" strokeWidth="2.5" strokeDasharray="3 2" />
              <line x1="80" y1="0" x2="144" y2="105" stroke="url(#chainGradLeft)" strokeWidth="2.5" strokeDasharray="3 2" />
              <line x1="80" y1="0" x2="80" y2="105" stroke="url(#chainGradLeft)" strokeWidth="1.5" opacity="0.6" strokeDasharray="2 3" />
            </svg>

            {/* The Pan Dish (Drop Zone for Left Side) */}
            <div
              onDrop={(e) => handleDrop(e, 'left')}
              onDragOver={(e) => handleDragOver(e, 'left')}
              onDragLeave={() => handleDragLeave('left')}
              className={`relative -mt-1 w-44 sm:w-48 min-h-[110px] rounded-b-3xl rounded-t-md px-3 pt-2 pb-3 transition-all flex flex-col items-center justify-end ${
                isHoveringLeft
                  ? 'bg-purple-950/80 border-2 border-purple-400 ring-4 ring-purple-500/40 scale-105'
                  : 'bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950 border-2 border-slate-600/70 shadow-2xl'
              }`}
            >
              <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent rounded-full" />

              {/* Pan Label */}
              <div className="absolute -top-6 px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/50 text-[10px] font-bold text-purple-300 font-mono tracking-wider shadow">
                LEFT PAN
              </div>

              {/* Weight blocks inside Left Pan */}
              <div className="w-full flex flex-wrap gap-1.5 items-center justify-center min-h-[46px] p-1">
                {renderBlocks(leftPans.xBlocks, leftPans.oneKgBlocks, 'left')}

                {leftPans.xBlocks === 0 && leftPans.oneKgBlocks === 0 && (
                  <div className="flex flex-col items-center text-slate-500 py-2">
                    <ArrowDownCircle className="w-5 h-5 text-purple-400/60 animate-bounce mb-1" />
                    <span className="text-[10px] font-medium text-slate-400">Drop weights here</span>
                  </div>
                )}
              </div>

              {/* Pan mass footer and quick buttons */}
              <div className="w-full mt-1 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold text-purple-300">
                  {leftWeight} kg
                </span>
                
                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddBlock('left', '1kg')}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-[9px] flex items-center gap-0.5 transition"
                    title="Add 1kg"
                  >
                    <Plus className="w-2.5 h-2.5" /> 1kg
                  </button>
                  <button
                    onClick={() => onAddBlock('left', 'x')}
                    className="px-1.5 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-[9px] flex items-center gap-0.5 transition"
                    title="Add X"
                  >
                    <Plus className="w-2.5 h-2.5" /> X
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. RIGHT SUSPENDED PAN ASSEMBLY (Counter-rotated by -tiltAngle) */}
          <div
            className="absolute right-1 top-2 flex flex-col items-center transition-transform duration-500 ease-out origin-top z-30"
            style={{
              transform: `rotate(${-tiltAngle}deg)`,
            }}
          >
            {/* Chains / Suspension Strings (SVG lines) */}
            <svg className="w-40 h-28 pointer-events-none overflow-visible" viewBox="0 0 160 110">
              <defs>
                <linearGradient id="chainGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
              <line x1="80" y1="0" x2="16" y2="105" stroke="url(#chainGradRight)" strokeWidth="2.5" strokeDasharray="3 2" />
              <line x1="80" y1="0" x2="144" y2="105" stroke="url(#chainGradRight)" strokeWidth="2.5" strokeDasharray="3 2" />
              <line x1="80" y1="0" x2="80" y2="105" stroke="url(#chainGradRight)" strokeWidth="1.5" opacity="0.6" strokeDasharray="2 3" />
            </svg>

            {/* The Pan Dish (Drop Zone for Right Side) */}
            <div
              onDrop={(e) => handleDrop(e, 'right')}
              onDragOver={(e) => handleDragOver(e, 'right')}
              onDragLeave={() => handleDragLeave('right')}
              className={`relative -mt-1 w-44 sm:w-48 min-h-[110px] rounded-b-3xl rounded-t-md px-3 pt-2 pb-3 transition-all flex flex-col items-center justify-end ${
                isHoveringRight
                  ? 'bg-amber-950/80 border-2 border-amber-400 ring-4 ring-amber-500/40 scale-105'
                  : 'bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950 border-2 border-slate-600/70 shadow-2xl'
              }`}
            >
              <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent rounded-full" />

              {/* Pan Label */}
              <div className="absolute -top-6 px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-[10px] font-bold text-amber-300 font-mono tracking-wider shadow">
                RIGHT PAN
              </div>

              {/* Weight blocks inside Right Pan */}
              <div className="w-full flex flex-wrap gap-1.5 items-center justify-center min-h-[46px] p-1">
                {renderBlocks(rightPans.xBlocks, rightPans.oneKgBlocks, 'right')}

                {rightPans.xBlocks === 0 && rightPans.oneKgBlocks === 0 && (
                  <div className="flex flex-col items-center text-slate-500 py-2">
                    <ArrowDownCircle className="w-5 h-5 text-amber-400/60 animate-bounce mb-1" />
                    <span className="text-[10px] font-medium text-slate-400">Drop weights here</span>
                  </div>
                )}
              </div>

              {/* Pan mass footer and quick buttons */}
              <div className="w-full mt-1 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold text-amber-300">
                  {rightWeight} kg
                </span>
                
                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddBlock('right', '1kg')}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-[9px] flex items-center gap-0.5 transition"
                    title="Add 1kg"
                  >
                    <Plus className="w-2.5 h-2.5" /> 1kg
                  </button>
                  <button
                    onClick={() => onAddBlock('right', 'x')}
                    className="px-1.5 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-[9px] flex items-center gap-0.5 transition"
                    title="Add X"
                  >
                    <Plus className="w-2.5 h-2.5" /> X
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
