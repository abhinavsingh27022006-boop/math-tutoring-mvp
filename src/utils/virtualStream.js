// Generates an animated test video stream (useful when camera is unavailable or testing on single device)
export function createVirtualStream(role = 'Teacher') {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  let animationFrameId;
  let angle = 0;

  const isTeacher = role.toLowerCase().includes('teacher');
  const primaryColor = isTeacher ? '#6366f1' : '#10b981';
  const label = isTeacher ? '👩‍🏫 Teacher (Live Feed)' : '🧑‍🎓 Student (Live Feed)';
  const badge = isTeacher ? 'MATH MENTOR' : 'SOLVER';

  function draw() {
    angle += 0.04;
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 480, 360);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 360);

    // Decorative grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 480; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 360);
      ctx.stroke();
    }
    for (let y = 0; y < 360; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(480, y);
      ctx.stroke();
    }

    // Animated glow ring
    const centerX = 240;
    const centerY = 160;
    const pulse = Math.sin(angle * 2) * 8;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.restore();

    // Avatar Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 62, 0, Math.PI * 2);
    ctx.fillStyle = isTeacher ? '#312e81' : '#064e3b';
    ctx.fill();
    ctx.restore();

    // Emoji icon
    ctx.font = '54px "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isTeacher ? '👩‍🏫' : '🧑‍🎓', centerX, centerY - 2);

    // Live wave indicator
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(centerX + 44, centerY + 44, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Role text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillText(label, centerX, 260);

    // Badge pill
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(centerX - 60, 280, 120, 24, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(badge, centerX, 296);

    // Live timestamp
    const now = new Date().toLocaleTimeString();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px monospace';
    ctx.fillText(`WebRTC 30fps • ${now}`, centerX, 335);

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();

  // Create stream
  const stream = canvas.captureStream(30);

  // Add silent audio track so WebRTC media connection has audio track
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  const tracks = dest.stream.getAudioTracks();
  if (tracks.length > 0) {
    stream.addTrack(tracks[0]);
  }

  // Cleanup helper attached to stream
  stream._cleanup = () => {
    cancelAnimationFrame(animationFrameId);
    try { audioCtx.close(); } catch {}
  };

  return stream;
}
