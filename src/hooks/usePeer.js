import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { createVirtualStream } from '../utils/virtualStream';

export function usePeer({ onRemoteStateChange, onRemoteReaction, onRemotePointer, onRemoteChat }) {
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(true);
  const [role, setRole] = useState('Teacher'); // 'Teacher' or 'Student'
  const [peerStatus, setPeerStatus] = useState('initializing'); // initializing, ready, connecting, connected, disconnected, error
  const [peerId, setPeerId] = useState('');
  const [hasRemotePeer, setHasRemotePeer] = useState(false);
  const [remotePeerId, setRemotePeerId] = useState('');

  // Media
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isUsingVirtualCam, setIsUsingVirtualCam] = useState(false);

  // References
  const peerRef = useRef(null);
  const activeConnRef = useRef(null);
  const activeCallRef = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize Room ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let room = params.get('room');
    if (room) {
      setRoomId(room);
      setIsHost(false);
      setRole('Student');
    } else {
      room = 'eq-' + Math.random().toString(36).substring(2, 8);
      setRoomId(room);
      setIsHost(true);
      setRole('Teacher');
      // Update URL with room ID
      const newUrl = `${window.location.pathname}?room=${room}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  }, []);

  // Initialize Local Media Stream
  const initLocalStream = useCallback(async (preferVirtual = false) => {
    if (localStreamRef.current) {
      if (localStreamRef.current._cleanup) {
        localStreamRef.current._cleanup();
      }
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }

    if (preferVirtual) {
      const vStream = createVirtualStream(role);
      localStreamRef.current = vStream;
      setLocalStream(vStream);
      setIsUsingVirtualCam(true);
      return vStream;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsUsingVirtualCam(false);
      return stream;
    } catch {
      // Camera denied or busy -> fallback to high quality animated virtual avatar stream
      const vStream = createVirtualStream(role);
      localStreamRef.current = vStream;
      setLocalStream(vStream);
      setIsUsingVirtualCam(true);
      return vStream;
    }
  }, [role]);

  // Set up PeerJS
  useEffect(() => {
    if (!roomId) return;

    let destroyed = false;
    let peer = null;

    async function setupPeer() {
      const stream = await initLocalStream(false);
      if (destroyed) return;

      const myPeerId = isHost 
        ? `equa-${roomId}-host`
        : `equa-${roomId}-client-${Math.random().toString(36).substring(2, 6)}`;

      peer = new Peer(myPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        if (destroyed) return;
        setPeerId(id);
        setPeerStatus('ready');

        // If client, connect and call the host immediately
        if (!isHost) {
          const hostId = `equa-${roomId}-host`;
          setPeerStatus('connecting');

          // Data connection
          const conn = peer.connect(hostId, { reliable: true });
          setupDataConnection(conn);

          // Media call
          if (stream) {
            const call = peer.call(hostId, stream);
            setupMediaCall(call);
          }
        }
      });

      // When someone connects to us (incoming data connection)
      peer.on('connection', (conn) => {
        setupDataConnection(conn);
      });

      // When someone calls us (incoming media call)
      peer.on('call', (call) => {
        const currentStream = localStreamRef.current || stream;
        call.answer(currentStream);
        setupMediaCall(call);
      });

      peer.on('error', (err) => {
        // If host ID is already taken (e.g. host reloaded quickly), retry with fallback or connect as client
        if (err.type === 'unavailable-id' && isHost) {
          const fallbackHostId = `equa-${roomId}-host-${Math.random().toString(36).substring(2, 5)}`;
          peer.destroy();
          const altPeer = new Peer(fallbackHostId);
          peerRef.current = altPeer;
          setPeerId(fallbackHostId);
          setPeerStatus('ready');
          return;
        }
        setPeerStatus('error');
      });

      peer.on('disconnected', () => {
        setPeerStatus('disconnected');
        setHasRemotePeer(false);
      });
    }

    function setupDataConnection(conn) {
      activeConnRef.current = conn;

      conn.on('open', () => {
        setHasRemotePeer(true);
        setRemotePeerId(conn.peer);
        setPeerStatus('connected');

        // Request initial sync if not host
        if (!isHost) {
          conn.send({ type: 'REQUEST_INITIAL_SYNC', sender: myPeerIdOrRole() });
        }
      });

      conn.on('data', (data) => {
        if (!data || typeof data !== 'object') return;

        switch (data.type) {
          case 'STATE_SYNC':
            if (onRemoteStateChange) onRemoteStateChange(data.state);
            break;
          case 'REQUEST_INITIAL_SYNC':
            // Host sends state back
            if (window.__getScaleCurrentState) {
              conn.send({
                type: 'STATE_SYNC',
                state: window.__getScaleCurrentState()
              });
            }
            break;
          case 'REACTION':
            if (onRemoteReaction) onRemoteReaction(data);
            break;
          case 'POINTER_MOVE':
            if (onRemotePointer) onRemotePointer(data);
            break;
          case 'CHAT':
            if (onRemoteChat) onRemoteChat(data);
            break;
          default:
            break;
        }
      });

      conn.on('close', () => {
        setHasRemotePeer(false);
        setPeerStatus('disconnected');
      });

      conn.on('error', () => {
        setHasRemotePeer(false);
      });
    }

    function setupMediaCall(call) {
      activeCallRef.current = call;

      call.on('stream', (rStream) => {
        setRemoteStream(rStream);
        setHasRemotePeer(true);
      });

      call.on('close', () => {
        setRemoteStream(null);
      });

      call.on('error', () => {
        setRemoteStream(null);
      });
    }

    function myPeerIdOrRole() {
      return role;
    }

    setupPeer();

    return () => {
      destroyed = true;
      if (activeConnRef.current) activeConnRef.current.close();
      if (activeCallRef.current) activeCallRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) {
        if (localStreamRef.current._cleanup) localStreamRef.current._cleanup();
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [roomId, isHost, initLocalStream]);

  // Broadcast state to peer
  const broadcastState = useCallback((state) => {
    if (activeConnRef.current && activeConnRef.current.open) {
      try {
        activeConnRef.current.send({
          type: 'STATE_SYNC',
          state,
          senderRole: role
        });
      } catch {
        // Send failure
      }
    }
  }, [role]);

  // Broadcast reaction / emote
  const broadcastReaction = useCallback((emoji) => {
    if (activeConnRef.current && activeConnRef.current.open) {
      try {
        activeConnRef.current.send({
          type: 'REACTION',
          emoji,
          senderRole: role
        });
      } catch {}
    }
  }, [role]);

  // Broadcast laser pointer coordinates
  const broadcastPointer = useCallback((coords) => {
    if (activeConnRef.current && activeConnRef.current.open) {
      try {
        activeConnRef.current.send({
          type: 'POINTER_MOVE',
          ...coords,
          senderRole: role
        });
      } catch {}
    }
  }, [role]);

  // Broadcast chat message
  const broadcastChat = useCallback((msg) => {
    if (activeConnRef.current && activeConnRef.current.open) {
      try {
        activeConnRef.current.send({
          type: 'CHAT',
          message: msg,
          senderRole: role,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } catch {}
    }
  }, [role]);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setIsAudioMuted(!nextState);
      }
    }
  }, []);

  // Video Toggle
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks[0].enabled = nextState;
        setIsVideoMuted(!nextState);
      }
    }
  }, []);

  // Toggle between Real Camera and Animated Virtual Stream
  const toggleVirtualCam = useCallback(async () => {
    const nextVirtual = !isUsingVirtualCam;
    const newStream = await initLocalStream(nextVirtual);
    
    // Replace tracks in active call if connected
    if (activeCallRef.current && newStream) {
      const hostId = isHost ? remotePeerId : `equa-${roomId}-host`;
      if (peerRef.current && hostId) {
        try {
          const call = peerRef.current.call(hostId, newStream);
          setupMediaCall(call);
        } catch {}
      }
    }
  }, [isUsingVirtualCam, initLocalStream, isHost, remotePeerId, roomId]);

  // Generate Invite Link helper
  const generateInviteLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    return url;
  }, [roomId]);

  return {
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
  };
}
