export interface ConfettiPiece {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  hue: number;
  rotate: number;
  shape: number;
}

export interface ConfettiOptions {
  count?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
}

export const generateConfettiPieces = (options: ConfettiOptions = {}): ConfettiPiece[] => {
  const { count = 40, maxDelay = 2, minDuration = 4, maxDuration = 7 } = options;

  return Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * 6 + 6; // 6-12px
    const left = Math.random() * 100; // vw percent
    const delay = Math.random() * maxDelay; // 0-maxDelay s
    const duration = minDuration + Math.random() * (maxDuration - minDuration); // minDuration-maxDuration s
    const hue = Math.floor(Math.random() * 360);
    const rotate = Math.random() * 360;
    const shape = Math.random();
    return { id: i, size, left, delay, duration, hue, rotate, shape };
  });
};

export const confettiStyles = `
  @keyframes confetti-fall {
    0% { transform: translate3d(0, -10%, 0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: translate3d(0, 110vh, 0) rotate(720deg); opacity: 0; }
  }
`;
