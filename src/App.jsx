import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { EquationBanner } from './components/EquationBanner';
import { BalanceScale } from './components/BalanceScale';
import { AlgebraControls } from './components/AlgebraControls';
import { VideoConference } from './components/VideoConference';
import { MATH_LEVELS } from './constants/levels';
import { usePeer } from './hooks/usePeer';
import { soundFx } from './utils/audio';
import { Sparkles, Award, Scale, Video, MessageSquare, MousePointer2 } from 'lucide-react';

export default function App() {
  // Current game level
  const [currentLevel, setCurrentLevel] = useState(1);
  const currentLevelData = MATH_LEVELS.find((l) => l.id === currentLevel) || MATH_LEVELS[0];

  // Responsive mobile tab ('scale' | 'video')
  const [mobileTab, setMobileTab] = useState('scale');

  // Scale Pans State
  const [leftPans, setLeftPans] = useState(currentLevelData.initialLeft);
  const [rightPans, setRightPans] = useState(currentLevelData.initialRight);
  const [secretX, setSecretX] = useState(currentLevelData.secretX);

  // Laser Pointer & Emotes
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [remotePointer, setRemotePointer] = useState(null);
  const [floatingEmotes, setFloatingEmotes] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [hasCelebratedLevel, setHasCelebratedLevel] = useState(false);

  // Scale interactive container ref for coordinates mapping
  const scaleBoardRef = useRef(null);

  // Calculate Masses and Physics Tilt Angle
  const leftMass = leftPans.xBlocks * secretX + leftPans.oneKgBlocks;
  const rightMass = rightPans.xBlocks * secretX + rightPans.oneKgBlocks;
  const massDiff = rightMass - leftMass; // positive = right is heavier (tilts clockwise)
  const tiltAngle = Math.max(-14, Math.min(14, massDiff * 2.2));
  const isBalanced = leftMass === rightMass && (leftMass > 0 || rightMass > 0);

  // Peer State Change Handlers
  const handleRemoteStateChange = useCallback((remoteState) => {
    if (!remoteState) return;
    if (remoteState.leftPans) setLeftPans(remoteState.leftPans);
    if (remoteState.rightPans) setRightPans(remoteState.rightPans);
    if (remoteState.secretX !== undefined) setSecretX(remoteState.secretX);
    if (remoteState.currentLevel && remoteState.currentLevel !== currentLevel) {
      setCurrentLevel(remoteState.currentLevel);
    }
  }, [currentLevel]);

  const handleRemoteReaction = useCallback((data) => {
    if (!data.emoji) return;
    spawnFloatingEmote(data.emoji, data.senderRole);
    soundFx.playChime();
  }, []);

  const handleRemotePointer = useCallback((data) => {
    if (data.x !== undefined && data.y !== undefined) {
      setRemotePointer({ x: data.x, y: data.y, role: data.senderRole });
    }
  }, []);

  const handleRemoteChat = useCallback((data) => {
    if (!data.message) return;
    setChatMessages((prev) => [...prev, data]);
  }, []);

  // WebRTC PeerJS Hook
  const {
    roomId,
    peerId,
    isHost,
    role,
    setRole,
    peerStatus,
    hasRemotePeer,
    remotePeerId,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    isUsingVirtualCam,
    toggleAudio,
    toggleVideo,
    toggleVirtualCam,
    broadcastState,
    broadcastReaction,
    broadcastPointer,
    broadcastChat,
    generateInviteLink,
  } = usePeer({
    onRemoteStateChange: handleRemoteStateChange,
    onRemoteReaction: handleRemoteReaction,
    onRemotePointer: handleRemotePointer,
    onRemoteChat: handleRemoteChat,
  });

  // Provide current state getter to window for initial peer sync
  useEffect(() => {
    window.__getScaleCurrentState = () => ({
      leftPans,
      rightPans,
      secretX,
      currentLevel,
    });
  }, [leftPans, rightPans, secretX, currentLevel]);

  // Sync state broadcast whenever scale changes
  const syncState = useCallback((newLeft, newRight, newX = secretX, newLvl = currentLevel) => {
    broadcastState({
      leftPans: newLeft,
      rightPans: newRight,
      secretX: newX,
      currentLevel: newLvl,
    });
  }, [broadcastState, secretX, currentLevel]);

  // Handle Level Changes
  const handleSelectLevel = (levelId) => {
    const lvl = MATH_LEVELS.find((l) => l.id === levelId) || MATH_LEVELS[0];
    setCurrentLevel(levelId);
    setLeftPans(lvl.initialLeft);
    setRightPans(lvl.initialRight);
    setSecretX(lvl.secretX);
    setHasCelebratedLevel(false);
    syncState(lvl.initialLeft, lvl.initialRight, lvl.secretX, levelId);
    soundFx.playClink();
  };

  // Check Equilibrium Celebration
  useEffect(() => {
    if (isBalanced && !hasCelebratedLevel && currentLevel !== 6) {
      setHasCelebratedLevel(true);
      soundFx.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
      });
    }
  }, [isBalanced, hasCelebratedLevel, currentLevel]);

  // Reset Scale
  const handleResetScale = () => {
    setLeftPans(currentLevelData.initialLeft);
    setRightPans(currentLevelData.initialRight);
    setSecretX(currentLevelData.secretX);
    setHasCelebratedLevel(false);
    syncState(currentLevelData.initialLeft, currentLevelData.initialRight, currentLevelData.secretX, currentLevel);
    soundFx.playPop();
  };

  // Add Block
  const handleAddBlock = (pan, blockType) => {
    if (pan === 'left') {
      const next = {
        ...leftPans,
        xBlocks: blockType === 'x' ? leftPans.xBlocks + 1 : leftPans.xBlocks,
        oneKgBlocks: blockType === '1kg' ? leftPans.oneKgBlocks + 1 : leftPans.oneKgBlocks,
      };
      setLeftPans(next);
      syncState(next, rightPans);
    } else {
      const next = {
        ...rightPans,
        xBlocks: blockType === 'x' ? rightPans.xBlocks + 1 : rightPans.xBlocks,
        oneKgBlocks: blockType === '1kg' ? rightPans.oneKgBlocks + 1 : rightPans.oneKgBlocks,
      };
      setRightPans(next);
      syncState(leftPans, next);
    }
    soundFx.playClink();
  };

  // Remove Block
  const handleRemoveBlock = (pan, blockType) => {
    if (pan === 'left') {
      const next = {
        ...leftPans,
        xBlocks: blockType === 'x' ? Math.max(0, leftPans.xBlocks - 1) : leftPans.xBlocks,
        oneKgBlocks: blockType === '1kg' ? Math.max(0, leftPans.oneKgBlocks - 1) : leftPans.oneKgBlocks,
      };
      setLeftPans(next);
      syncState(next, rightPans);
    } else {
      const next = {
        ...rightPans,
        xBlocks: blockType === 'x' ? Math.max(0, rightPans.xBlocks - 1) : rightPans.xBlocks,
        oneKgBlocks: blockType === '1kg' ? Math.max(0, rightPans.oneKgBlocks - 1) : rightPans.oneKgBlocks,
      };
      setRightPans(next);
      syncState(leftPans, next);
    }
  };

  // Transfer Block (between pans)
  const handleTransferBlock = (fromPan, toPan, blockType) => {
    if (fromPan === toPan) return;
    let nextLeft = { ...leftPans };
    let nextRight = { ...rightPans };

    if (fromPan === 'left') {
      if (blockType === 'x' && nextLeft.xBlocks > 0) {
        nextLeft.xBlocks--;
        nextRight.xBlocks++;
      } else if (blockType === '1kg' && nextLeft.oneKgBlocks > 0) {
        nextLeft.oneKgBlocks--;
        nextRight.oneKgBlocks++;
      }
    } else {
      if (blockType === 'x' && nextRight.xBlocks > 0) {
        nextRight.xBlocks--;
        nextLeft.xBlocks++;
      } else if (blockType === '1kg' && nextRight.oneKgBlocks > 0) {
        nextRight.oneKgBlocks--;
        nextLeft.oneKgBlocks++;
      }
    }

    setLeftPans(nextLeft);
    setRightPans(nextRight);
    syncState(nextLeft, nextRight);
  };

  // Pedagogical Operation: Subtract from both sides
  const handleSubtractFromBothSides = (blockType) => {
    let nextLeft = { ...leftPans };
    let nextRight = { ...rightPans };

    if (blockType === '1kg') {
      if (nextLeft.oneKgBlocks > 0 && nextRight.oneKgBlocks > 0) {
        nextLeft.oneKgBlocks--;
        nextRight.oneKgBlocks--;
        soundFx.playPop();
      }
    } else if (blockType === 'x') {
      if (nextLeft.xBlocks > 0 && nextRight.xBlocks > 0) {
        nextLeft.xBlocks--;
        nextRight.xBlocks--;
        soundFx.playPop();
      }
    }

    setLeftPans(nextLeft);
    setRightPans(nextRight);
    syncState(nextLeft, nextRight);
  };

  // Pedagogical Operation: Divide both sides by 2
  const handleDivideBothSides = () => {
    const nextLeft = {
      xBlocks: Math.floor(leftPans.xBlocks / 2),
      oneKgBlocks: Math.floor(leftPans.oneKgBlocks / 2),
    };
    const nextRight = {
      xBlocks: Math.floor(rightPans.xBlocks / 2),
      oneKgBlocks: Math.floor(rightPans.oneKgBlocks / 2),
    };

    soundFx.playPop();
    setLeftPans(nextLeft);
    setRightPans(nextRight);
    syncState(nextLeft, nextRight);
  };

  // Teacher pointer broadcasting
  const handleScaleMouseMove = (e) => {
    if (!isPointerActive || !scaleBoardRef.current) return;
    const rect = scaleBoardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    broadcastPointer({ x, y });
  };

  // Floating Emote reaction spawning
  const spawnFloatingEmote = (emoji, sender) => {
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40;
    setFloatingEmotes((prev) => [...prev, { id, emoji, x, sender }]);
    setTimeout(() => {
      setFloatingEmotes((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  };

  const handleSendReaction = (emoji) => {
    spawnFloatingEmote(emoji, role);
    broadcastReaction(emoji);
  };

  const handleSendChat = (msg) => {
    const chatObj = {
      message: msg,
      senderRole: role,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, chatObj]);
    broadcastChat(msg);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* 1. Header Bar */}
      <Header
        roomId={roomId}
        role={role}
        peerStatus={peerStatus}
        hasRemotePeer={hasRemotePeer}
        currentLevel={currentLevel}
        setCurrentLevel={handleSelectLevel}
        levels={MATH_LEVELS}
        onGenerateInviteLink={generateInviteLink}
        isPointerActive={isPointerActive}
        setIsPointerActive={setIsPointerActive}
      />

      {/* Mobile Screen Segment Navigation (<lg screens) */}
      <div className="lg:hidden flex items-center justify-center p-1.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 w-full max-w-sm text-xs font-bold">
          <button
            onClick={() => setMobileTab('scale')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileTab === 'scale'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Math Balance Scale</span>
          </button>
          <button
            onClick={() => setMobileTab('video')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileTab === 'video'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live Class Feed</span>
            {chatMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Main 70% / 30% Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT 70%: GAMIFIED BALANCE SCALE & MATH PUZZLE */}
        <main 
          ref={scaleBoardRef}
          onMouseMove={handleScaleMouseMove}
          className={`w-full lg:w-[70%] h-full flex flex-col p-2.5 sm:p-4 md:p-5 overflow-y-auto gap-3 sm:gap-3.5 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/80 ${
            mobileTab !== 'scale' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Level Header / Objective Card */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-md shrink-0">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-purple-500 text-white font-mono">
                  {currentLevelData.grade}
                </span>
                <h2 className="font-extrabold text-xs sm:text-sm md:text-base text-purple-200">
                  {currentLevelData.title}
                </h2>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
                {currentLevelData.description}
              </p>
            </div>

            {/* Target Equation Pill */}
            <div className="hidden sm:flex flex-col items-end shrink-0">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                Puzzle Goal
              </span>
              <span className="font-mono text-xs sm:text-sm font-black text-amber-300">
                {currentLevelData.targetEquation}
              </span>
            </div>
          </div>

          {/* Feature 3: Live Mathematical Equation at the Top */}
          <EquationBanner
            leftPans={leftPans}
            rightPans={rightPans}
            secretX={secretX}
            isBalanced={isBalanced}
            tiltAngle={tiltAngle}
          />

          {/* Feature 1 & 2: Interactive Gamified Balance Scale */}
          <div className="flex-1 min-h-[300px] sm:min-h-[380px] rounded-3xl glass-panel relative p-1 sm:p-4 border border-slate-800 shadow-2xl flex flex-col items-center justify-center">
            <BalanceScale
              leftPans={leftPans}
              rightPans={rightPans}
              secretX={secretX}
              tiltAngle={tiltAngle}
              isBalanced={isBalanced}
              onAddBlock={handleAddBlock}
              onRemoveBlock={handleRemoveBlock}
              onTransferBlock={handleTransferBlock}
            />

            {/* Scale Celebration Alert Banner when Balanced */}
            {isBalanced && (
              <div className="absolute top-3 inset-x-4 sm:inset-x-8 max-w-md mx-auto py-1.5 sm:py-2 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 border-2 border-emerald-300 shadow-2xl text-center flex items-center justify-center gap-1.5 sm:gap-2 animate-bounce-subtle z-20">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                <span className="font-black text-xs sm:text-sm text-white drop-shadow">
                  🎉 EQUILIBRIUM ACHIEVED! Equation is Balanced!
                </span>
              </div>
            )}
          </div>

          {/* Controls: Weight Shelf & Pedagogical Operations */}
          <AlgebraControls
            leftPans={leftPans}
            rightPans={rightPans}
            secretX={secretX}
            setSecretX={(val) => {
              setSecretX(val);
              syncState(leftPans, rightPans, val);
            }}
            isSandbox={currentLevel === 6}
            currentLevelData={currentLevelData}
            onResetScale={handleResetScale}
            onAddBlock={handleAddBlock}
            onSubtractFromBothSides={handleSubtractFromBothSides}
            onDivideBothSides={handleDivideBothSides}
          />

          {/* Synchronized Laser Pointer from Peer */}
          {remotePointer && (
            <div
              className="absolute pointer-events-none transition-all duration-75 z-50 flex items-center gap-1.5"
              style={{
                left: `${remotePointer.x}%`,
                top: `${remotePointer.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                <MousePointer2 className="w-6 h-6 text-rose-500 fill-rose-500 drop-shadow-[0_0_10px_#f43f5e] animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-400 rounded-full animate-ping" />
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-950/90 text-rose-200 text-[10px] font-bold border border-rose-500/50 shadow-lg">
                {remotePointer.role || 'Teacher'}
              </span>
            </div>
          )}

          {/* Synchronized Floating Emotes */}
          {floatingEmotes.map((item) => (
            <div
              key={item.id}
              className="absolute pointer-events-none z-50 text-3xl sm:text-4xl animate-float-up flex flex-col items-center"
              style={{
                left: `${item.x}%`,
                bottom: '10%',
                animation: 'floatUp 2.8s ease-out forwards',
              }}
            >
              <span>{item.emoji}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-white mt-1">
                {item.sender}
              </span>
            </div>
          ))}
        </main>

        {/* RIGHT 30%: LIVE WEBRTC VIDEO FEEDS (TEACHER & STUDENT) */}
        <div className={`w-full lg:w-[30%] h-full flex flex-col border-t lg:border-t-0 ${
          mobileTab !== 'video' ? 'hidden lg:flex' : 'flex'
        }`}>
          <VideoConference
            role={role}
            setRole={setRole}
            isHost={isHost}
            peerStatus={peerStatus}
            hasRemotePeer={hasRemotePeer}
            localStream={localStream}
            remoteStream={remoteStream}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            isUsingVirtualCam={isUsingVirtualCam}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            toggleVirtualCam={toggleVirtualCam}
            onSendReaction={handleSendReaction}
            onSendChat={handleSendChat}
            chatMessages={chatMessages}
          />
        </div>

      </div>

      {/* Floating animation keyframes for reaction cheers */}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.6);
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1.2);
          }
          80% {
            opacity: 0.9;
            transform: translateY(-160px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-240px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
