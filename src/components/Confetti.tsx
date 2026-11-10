import confetti from 'canvas-confetti';

export function fireConfetti() {
  // Center high blast
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#34d399', '#6ee7b7', '#38bdf8', '#fbbf24', '#f43f5e'],
  });

  // Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
    });
  }, 150);

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
    });
  }, 300);
}

export function fireGrandConfetti() {
  // Used for "All Levels Cleared"
  const end = Date.now() + 2.5 * 1000;
  const colors = ['#10b981', '#6ee7b7', '#f59e0b', '#38bdf8', '#ec4899', '#a855f7'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
