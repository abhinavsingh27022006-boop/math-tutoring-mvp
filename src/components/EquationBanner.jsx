import React from 'react';
import { Sparkles, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

export function EquationBanner({ leftPans, rightPans, secretX, isBalanced, tiltAngle }) {
  // Format algebraic expressions
  const formatExpression = (xCount, oneKgCount) => {
    const parts = [];
    if (xCount > 0) {
      parts.push(xCount === 1 ? 'x' : `${xCount}x`);
    }
    if (oneKgCount > 0) {
      parts.push(`${oneKgCount}`);
    }
    if (parts.length === 0) return '0';
    return parts.join(' + ');
  };

  const leftExpr = formatExpression(leftPans.xBlocks, leftPans.oneKgBlocks);
  const rightExpr = formatExpression(rightPans.xBlocks, rightPans.oneKgBlocks);

  // Compute calculated masses
  const leftWeight = leftPans.xBlocks * secretX + leftPans.oneKgBlocks;
  const rightWeight = rightPans.xBlocks * secretX + rightPans.oneKgBlocks;

  let operatorSymbol = '=';
  let statusText = 'Balanced! Equation is True';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  if (leftWeight > rightWeight) {
    operatorSymbol = '>';
    statusText = 'Left Side is Heavier';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (leftWeight < rightWeight) {
    operatorSymbol = '<';
    statusText = 'Right Side is Heavier';
    badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
  }

  return (
    <div className="w-full relative overflow-hidden rounded-2xl glass-panel-accent p-3.5 sm:p-5 shadow-2xl transition-all">
      {/* Decorative ambient background glow */}
      <div 
        className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isBalanced ? 'bg-emerald-500/30 opacity-100' : 'bg-purple-600/20 opacity-50'
        }`}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        
        {/* Left Side: Live Mathematical Equation */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <div className="flex items-center justify-center p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300">
            <Scale className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Live Equation:
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner font-mono text-lg sm:text-2xl font-bold tracking-wide">
              {/* Left Expression */}
              <span className="text-purple-300 transition-colors">
                {leftExpr}
              </span>

              {/* Operator */}
              <span className={`px-2 py-0.5 rounded-lg text-xl sm:text-2xl font-black transition-all ${
                isBalanced 
                  ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg shadow-emerald-500/50' 
                  : 'text-amber-400 animate-pulse'
              }`}>
                {operatorSymbol}
              </span>

              {/* Right Expression */}
              <span className="text-amber-300 transition-colors">
                {rightExpr}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Side: Balance Status Badge & Masses */}
        <div className="flex items-center gap-3">
          {/* Masses compare pill */}
          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="text-purple-400 font-semibold">{leftWeight} kg</span>
            <span className="text-slate-500">vs</span>
            <span className="text-amber-400 font-semibold">{rightWeight} kg</span>
          </div>

          {/* Balance state pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide transition-all ${badgeColor}`}>
            {isBalanced ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
                <span>PERFECT BALANCE</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 ml-0.5" />
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>{statusText}</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Subtitle pedagogical tip for students */}
      <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-purple-300">💡 Algebra Rule:</span>
          <span>An equation is balanced when the total weight on the left equals the total weight on the right.</span>
        </div>
        <div className="font-mono text-slate-400 mt-1 sm:mt-0">
          Tilt: <span className={Math.abs(tiltAngle) < 0.5 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{tiltAngle.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
}
