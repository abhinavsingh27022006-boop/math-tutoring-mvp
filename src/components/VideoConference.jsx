import React, { useRef, useEffect, useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Camera, 
  Sparkles, 
  Smile, 
  Send, 
  MessageSquare
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export function VideoConference({
  role,
  setRole,
  isHost,
  peerStatus,
  hasRemotePeer,
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoMuted,
  isUsingVirtualCam,
  toggleAudio,
  toggleVideo,
  toggleVirtualCam,
  onSendReaction,
  onSendChat,
  chatMessages,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  // Attach local stream to video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  };

  const reactionEmojis = ['🎉', '⭐', '💡', '🔥', '✋', '👍', '🧠'];

  // Determine who is Teacher and who is Student
  const isUserTeacher = role === 'Teacher';

  return (
    <aside className="w-full h-full flex flex-col bg-slate-900/90 border-l border-slate-800 backdrop-blur-xl p-3 sm:p-4 gap-3 overflow-y-auto">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
            <span>Live Class</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              WebRTC
            </span>
          </h2>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setRole('Teacher')}
            className={`px-2 py-1 rounded-md transition ${
              role === 'Teacher' 
                ? 'bg-purple-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Teacher
          </button>
          <button
            onClick={() => setRole('Student')}
            className={`px-2 py-1 rounded-md transition ${
              role === 'Student' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Student
          </button>
        </div>
      </div>

      {/* VIDEO FEEDS: SIDE-BY-SIDE ON MOBILE, STACKED ON DESKTOP */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 shrink-0">
        
        {/* VIDEO 1: TEACHER FEED */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-purple-500/30 shadow-xl aspect-video flex items-center justify-center group">
          <video
            ref={isUserTeacher ? localVideoRef : remoteVideoRef}
            autoPlay
            playsInline
            muted={isUserTeacher} // mute self
            className={`w-full h-full object-cover ${
              (!isUserTeacher && !hasRemotePeer) ? 'opacity-20' : 'opacity-100'
            }`}
          />

          {!isUserTeacher && !hasRemotePeer && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-purple-900/50 flex items-center justify-center text-lg sm:text-2xl mb-1 sm:mb-2 animate-pulse">
                👩‍🏫
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-300">Awaiting Teacher</p>
            </div>
          )}

          {/* Badge Overlay */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 text-[10px] sm:text-[11px] font-bold text-purple-200 shadow">
            <span>👩‍🏫</span>
            <span className="truncate max-w-[80px] sm:max-w-none">Teacher {isUserTeacher && '(You)'}</span>
          </div>

          {/* Status dot */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden sm:inline">LIVE</span>
          </div>

          {/* Controls Overlay (Only on user's own feed) */}
          {isUserTeacher && (
            <div className="absolute bottom-1.5 inset-x-1.5 sm:bottom-2 sm:inset-x-2 flex items-center justify-between px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleAudio}
                  className={`p-1 sm:p-1.5 rounded-lg text-xs font-semibold transition ${
                    isAudioMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isAudioMuted ? <MicOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-1 sm:p-1.5 rounded-lg text-xs font-semibold transition ${
                    isVideoMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoMuted ? <VideoOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                </button>
              </div>

              <button
                onClick={toggleVirtualCam}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center gap-1 transition ${
                  isUsingVirtualCam 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle animated avatar virtual camera"
              >
                <Camera className="w-3 h-3" />
                <span className="hidden sm:inline">{isUsingVirtualCam ? 'Avatar Cam' : 'Webcam'}</span>
              </button>
            </div>
          )}
        </div>

        {/* VIDEO 2: STUDENT FEED */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/30 shadow-xl aspect-video flex items-center justify-center group">
          <video
            ref={!isUserTeacher ? localVideoRef : remoteVideoRef}
            autoPlay
            playsInline
            muted={!isUserTeacher} // mute self
            className={`w-full h-full object-cover ${
              (isUserTeacher && !hasRemotePeer) ? 'opacity-20' : 'opacity-100'
            }`}
          />

          {isUserTeacher && !hasRemotePeer && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-950/60 flex items-center justify-center text-lg sm:text-2xl mb-1 sm:mb-2 animate-bounce-subtle">
                🧑‍🎓
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-300">Waiting for Student</p>
            </div>
          )}

          {/* Badge Overlay */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 text-[10px] sm:text-[11px] font-bold text-emerald-200 shadow">
            <span>🧑‍🎓</span>
            <span className="truncate max-w-[80px] sm:max-w-none">Student {!isUserTeacher && '(You)'}</span>
          </div>

          {/* Status dot */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-emerald-400">
            <span className={`w-1.5 h-1.5 rounded-full ${hasRemotePeer || !isUserTeacher ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="hidden sm:inline">{hasRemotePeer || !isUserTeacher ? 'ONLINE' : 'WAITING'}</span>
          </div>

          {/* Controls Overlay (Only on user's own feed) */}
          {!isUserTeacher && (
            <div className="absolute bottom-1.5 inset-x-1.5 sm:bottom-2 sm:inset-x-2 flex items-center justify-between px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleAudio}
                  className={`p-1 sm:p-1.5 rounded-lg text-xs font-semibold transition ${
                    isAudioMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isAudioMuted ? <MicOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-1 sm:p-1.5 rounded-lg text-xs font-semibold transition ${
                    isVideoMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoMuted ? <VideoOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                </button>
              </div>

              <button
                onClick={toggleVirtualCam}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center gap-1 transition ${
                  isUsingVirtualCam 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle animated avatar virtual camera"
              >
                <Camera className="w-3 h-3" />
                <span className="hidden sm:inline">{isUsingVirtualCam ? 'Avatar Cam' : 'Webcam'}</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* QUICK REACTIONS & TUTORING CHEERS */}
      <div className="glass-panel rounded-2xl p-2 sm:p-2.5 border border-slate-800 shrink-0">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Smile className="w-3 h-3 text-amber-400" />
            Live Cheers
          </span>
          <span className="text-[9px] text-slate-500">Instant Sync</span>
        </div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                soundFx.playChime();
                onSendReaction(emoji);
              }}
              className="p-1 sm:p-1.5 rounded-xl bg-slate-800/80 hover:bg-purple-600/30 hover:scale-125 active:scale-95 transition-transform text-base sm:text-lg shrink-0"
              title={`Send ${emoji} cheer`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* MINI LIVE CHAT & COACH NOTES */}
      <div className="flex-1 min-h-[140px] flex flex-col glass-panel rounded-2xl p-2.5 border border-slate-800 overflow-hidden">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center justify-between border-b border-slate-800/80 pb-1 shrink-0">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-purple-400" />
            Tutoring Chat & Notes
          </span>
          <span className="text-[9px] font-mono text-emerald-400">
            {hasRemotePeer ? '● Peer Online' : '○ Standby'}
          </span>
        </div>

        {/* Messages List */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs">
          {chatMessages.length === 0 ? (
            <div className="text-center text-slate-500 text-[11px] py-4">
              Send messages or notes here! Everything syncs in real-time.
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`p-2 rounded-xl text-xs ${
                  msg.senderRole === role 
                    ? 'bg-purple-950/60 border border-purple-500/30 text-purple-100 ml-4' 
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="font-bold text-purple-300">{msg.senderRole}</span>
                  <span className="text-[9px] opacity-70">{msg.timestamp}</span>
                </div>
                <div className="break-words leading-relaxed">{msg.message}</div>
              </div>
            ))
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="mt-2 flex gap-1.5 pt-1.5 border-t border-slate-800/80 shrink-0">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a note or hint..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition active:scale-95"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </aside>
  );
}
