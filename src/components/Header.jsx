import React, { useState } from 'react';
import { 
  Check, 
  Volume2, 
  VolumeX, 
  Share2, 
  MousePointer, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export function Header({
  roomId,
  role,
  peerStatus,
  hasRemotePeer,
  currentLevel,
  setCurrentLevel,
  levels,
  onGenerateInviteLink,
  isPointerActive,
  setIsPointerActive,
}) {
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleCopyLink = () => {
    soundFx.playClink();
    onGenerateInviteLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundFx.setEnabled(nextVal);
    if (nextVal) soundFx.playClink();
  };

  return (
    <header className="w-full bg-slate-900/95 border-b border-slate-800 px-2.5 sm:px-4 md:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 select-none backdrop-blur-md z-30 shrink-0">
      
      {/* 1. App Title & Branding */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center text-base sm:text-xl shadow-lg shadow-purple-500/20 border border-white/20">
          ⚖️
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-sm sm:text-base md:text-lg tracking-tight text-white flex items-center gap-1">
              <span>EquaBalance</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
                Live
              </span>
            </h1>
            <span className="hidden md:inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Grade 5-8
            </span>
          </div>
          <p className="hidden lg:block text-[10px] text-slate-400">
            1-on-1 Math Tutoring • Real-time Balance Scale MVP
          </p>
        </div>
      </div>

      {/* 2. Level Selector */}
      <div className="flex items-center gap-1 sm:gap-2 max-w-[150px] sm:max-w-[240px] md:max-w-none">
        <div className="relative w-full">
          <select
            value={currentLevel}
            onChange={(e) => setCurrentLevel(Number(e.target.value))}
            className="w-full appearance-none bg-slate-950 border border-slate-700 hover:border-purple-500 text-slate-200 text-xs sm:text-sm font-bold rounded-xl pl-2 sm:pl-3.5 pr-7 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md cursor-pointer transition truncate"
          >
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.id === 6 ? '🛠️ Sandbox Mode' : `L${lvl.id}: ${lvl.targetEquation}`}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Room Actions & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Connection status pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
          <span className={`w-2 h-2 rounded-full ${
            hasRemotePeer ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
          }`} />
          <span className="text-slate-400">Room:</span>
          <span className="text-purple-300 font-bold">{roomId ? roomId.substring(0, 10) : '...'}</span>
        </div>

        {/* Laser Pointer Mode */}
        <button
          onClick={() => setIsPointerActive(!isPointerActive)}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
            isPointerActive
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/20'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Toggle Teacher Laser Pointer (Broadcast cursor to student)"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isPointerActive ? 'Pointer' : 'Pointer'}</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold border transition ${
            soundEnabled
              ? 'bg-slate-950 text-amber-400 border-slate-800 hover:border-amber-400/40'
              : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
          title={soundEnabled ? 'Mute Game Sounds' : 'Unmute Game Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* FEATURE 5: GENERATE INVITE LINK BUTTON */}
        <button
          onClick={handleCopyLink}
          className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-lg transition active:scale-95 ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25 border border-purple-400/30'
          }`}
          title="Generate Invite Link and copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Copied!</span>
              <span className="sm:hidden text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Generate Invite Link</span>
              <span className="sm:hidden text-[11px]">Invite</span>
            </>
          )}
        </button>
      </div>

    </header>
  );
}
