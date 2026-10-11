import React, { useState } from 'react';
import { WeightBlock } from './Block';
import { 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Sliders, 
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Divide
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export function AlgebraControls({
  leftPans,
  rightPans,
  secretX,
  setSecretX,
  isSandbox,
  currentLevelData,
  onResetScale,
  onAddBlock,
  onSubtractFromBothSides,
  onDivideBothSides,
}) {
  const [showSecretX, setShowSecretX] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Can we subtract 1kg from both?
  const canSubtract1kg = leftPans.oneKgBlocks > 0 && rightPans.oneKgBlocks > 0;
  // Can we subtract X from both?
  const canSubtractX = leftPans.xBlocks > 0 && rightPans.xBlocks > 0;
  // Can we divide both sides?
  const canDivideBy2 = leftPans.xBlocks % 2 === 0 && 
                       leftPans.oneKgBlocks % 2 === 0 && 
                       rightPans.xBlocks % 2 === 0 && 
                       rightPans.oneKgBlocks % 2 === 0 &&
                       (leftPans.xBlocks > 0 || leftPans.oneKgBlocks > 0);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Weight Shelf & Dispenser */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Weight Dispenser Shelf (Drag or Click to Add)
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Infinite Weights Available</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1kg Block Dispenser */}
          <div className="relative group">
            <WeightBlock type="1kg" isDraggable={true} />
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => {
                  soundFx.playClink();
                  onAddBlock('left', '1kg');
                }}
                className="flex-1 py-1 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                + Left Pan
              </button>
              <button
                onClick={() => {
                  soundFx.playClink();
                  onAddBlock('right', '1kg');
                }}
                className="flex-1 py-1 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                + Right Pan
              </button>
            </div>
          </div>

          {/* Mystery X Block Dispenser */}
          <div className="relative group">
            <WeightBlock type="x" isDraggable={true} />
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => {
                  soundFx.playClink();
                  onAddBlock('left', 'x');
                }}
                className="flex-1 py-1 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                + Left Pan
              </button>
              <button
                onClick={() => {
                  soundFx.playClink();
                  onAddBlock('right', 'x');
                }}
                className="flex-1 py-1 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                + Right Pan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Algebraic Solving Actions ("Do to Both Sides") */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Algebraic Operations (Equal Actions on Both Pans)
          </span>
          <span className="text-[10px] text-slate-400">Keep scale in equilibrium</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Subtract 1kg from Both Sides */}
          <button
            onClick={() => onSubtractFromBothSides('1kg')}
            disabled={!canSubtract1kg}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              canSubtract1kg
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40 active:scale-95 shadow-md'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/30 cursor-not-allowed opacity-60'
            }`}
          >
            <span>➖ Take 1kg from Both</span>
          </button>

          {/* Subtract X from Both Sides */}
          <button
            onClick={() => onSubtractFromBothSides('x')}
            disabled={!canSubtractX}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              canSubtractX
                ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-500/40 active:scale-95 shadow-md'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/30 cursor-not-allowed opacity-60'
            }`}
          >
            <span>➖ Take 1 X from Both</span>
          </button>

          {/* Divide Both Sides by 2 */}
          <button
            onClick={onDivideBothSides}
            disabled={!canDivideBy2}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              canDivideBy2
                ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border-teal-500/40 active:scale-95 shadow-md'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/30 cursor-not-allowed opacity-60'
            }`}
          >
            <Divide className="w-3.5 h-3.5" />
            <span>Divide Both by 2</span>
          </button>
        </div>

        {/* Pedagogical Tip Banner */}
        <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="font-extrabold text-amber-400">⚖️ The Golden Rule:</span>
            <span>Whatever you do to one pan, you MUST do to the other pan!</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Hint toggle */}
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-900/40 border border-purple-700/50 transition"
            >
              <Lightbulb className="w-3 h-3 text-amber-300" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>

            {/* Reset button */}
            <button
              onClick={onResetScale}
              className="text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 transition"
              title="Reset scale to initial level"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Hint Box (if visible) */}
        {showHint && currentLevelData && (
          <div className="mt-2 p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-xs text-purple-200 flex items-start gap-2 animate-fadeIn">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Coach's Clue: </span>
              {currentLevelData.hint}
            </div>
          </div>
        )}
      </div>

      {/* 3. Secret Value X Inspector / Reveal Card */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-700/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center font-mono font-black text-purple-300 text-lg">
            X
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              Mystery Box X Weight Card
            </div>
            <div className="text-[11px] text-slate-400">
              {showSecretX ? (
                <span className="text-emerald-400 font-mono font-bold">1 Box of X = {secretX} kg!</span>
              ) : (
                <span>Solve the balance scale puzzle to find X, or reveal below:</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Secret X Setter if in Sandbox Mode */}
          {isSandbox && (
            <div className="flex items-center gap-1.5 mr-2 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700 text-xs font-mono">
              <span className="text-slate-400">Teacher Set X:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={secretX}
                onChange={(e) => setSecretX(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 bg-slate-800 border border-purple-500/50 rounded px-1.5 py-0.5 text-center text-purple-300 font-bold"
              />
            </div>
          )}

          <button
            onClick={() => setShowSecretX(!showSecretX)}
            className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            {showSecretX ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-purple-400" />}
            <span>{showSecretX ? 'Hide X' : 'Reveal X Secret'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
