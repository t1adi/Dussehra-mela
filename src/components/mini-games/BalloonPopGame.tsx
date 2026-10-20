import React, { useState, useEffect, useRef } from 'react';
import { X, Target, Trophy, Clock, RotateCcw, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../services/audioManager';

interface Balloon {
  id: number;
  x: number; // Percentage
  y: number; // Percentage
  color: string;
  popped: boolean;
  speed: number;
}

const BALLOON_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e84393', '#e67e22'];

export const BalloonPopGame: React.FC = () => {
  const { setActiveModal, addTokens, addScore, completeQuest, settings } = useGameStore();

  const [score, setScore] = useState(0);
  const [popsCount, setPopsCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(1);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Balloons
  const initGame = () => {
    setScore(0);
    setPopsCount(0);
    setTimeLeft(30);
    setGameOver(false);
    setCombo(1);

    const initialList: Balloon[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: 10 + (i % 5) * 18 + (Math.random() * 6 - 3),
      y: 20 + Math.floor(i / 5) * 25 + (Math.random() * 6 - 3),
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      popped: false,
      speed: 1.5 + Math.random() * 2
    }));
    setBalloons(initialList);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameOver || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, timeLeft]);

  // Subtle floating motion of unpopped balloons
  useEffect(() => {
    if (gameOver) return;
    const anim = setInterval(() => {
      setBalloons((prev) =>
        prev.map((b) =>
          b.popped
            ? b
            : {
                ...b,
                y: Math.max(12, Math.min(80, b.y + Math.sin(Date.now() * 0.003 * b.speed) * 0.4))
              }
        )
      );
    }, 50);
    return () => clearInterval(anim);
  }, [gameOver]);

  const handleGameOver = () => {
    setGameOver(true);
    const tokensWon = Math.max(10, Math.floor(score / 20));
    addTokens(tokensWon);
    addScore(score);

    if (popsCount >= 5) {
      completeQuest('balloon-quest');
    }

    if (score >= 100) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Crosshair tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCrosshairPos({ x, y });
  };

  // Balloon click / tap
  const popBalloon = (id: number) => {
    if (gameOver) return;

    audioManager.playPop();

    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );

    const pointsEarned = 10 * combo;
    setScore((s) => s + pointsEarned);
    setPopsCount((p) => p + 1);
    setCombo((c) => Math.min(5, c + 1));

    // Respawn balloon after 2.5 seconds
    setTimeout(() => {
      setBalloons((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                popped: false,
                color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
              }
            : b
        )
      );
    }, 2400);
  };

  const isHindi = settings.language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c2833] to-[#0f171e] rounded-2xl border-2 border-[#f39c12] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#962d22] to-[#d35400] text-white">
          <div className="flex items-center space-x-2.5">
            <Target className="w-6 h-6 text-[#f1c40f]" />
            <div>
              <h2 className="text-lg font-bold font-serif tracking-wide">
                {isHindi ? 'गुब्बारे वाला (निशानेबाज़ी)' : 'Gubbare Wala (Balloon Pop)'}
              </h2>
              <p className="text-xs text-amber-200">
                {isHindi ? 'गुब्बारों पर टैप करें और फोड़ें!' : 'Tap or click moving balloons to pop them!'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-around py-2.5 px-4 bg-[#141d26] border-b border-amber-900/40 text-sm">
          <div className="flex items-center space-x-1.5 text-amber-300">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold">{isHindi ? 'अंक' : 'Score'}:</span>
            <span className="font-mono text-base font-bold text-white">{score}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="font-semibold">{isHindi ? 'कॉम्बो' : 'Combo'}:</span>
            <span className="font-mono text-base font-bold">{combo}x</span>
          </div>

          <div className="flex items-center space-x-1.5 text-rose-300">
            <Clock className="w-4 h-4 text-rose-400" />
            <span className="font-semibold">{isHindi ? 'समय' : 'Time'}:</span>
            <span className={`font-mono text-base font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Balloon Shooting Board */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative w-full h-[360px] sm:h-[400px] bg-gradient-to-b from-[#1a1c29] to-[#0c0d14] overflow-hidden cursor-crosshair"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 30%, rgba(243, 156, 18, 0.12) 0%, transparent 65%)`
          }}
        >
          {/* Wooden Backdrop Grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none grid grid-cols-6 grid-rows-4 border border-amber-500/20" />

          {/* Balloons */}
          {balloons.map((b) => (
            <div
              key={b.id}
              onClick={() => popBalloon(b.id)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                transform: `translate(-50%, -50%) scale(${b.popped ? 0 : 1})`,
                opacity: b.popped ? 0 : 1,
                transition: b.popped ? 'transform 0.12s ease-out, opacity 0.12s ease-out' : 'top 0.1s linear'
              }}
              className="absolute group cursor-pointer"
            >
              {!b.popped && (
                <div className="relative flex flex-col items-center">
                  {/* Balloon Oval */}
                  <div
                    style={{ backgroundColor: b.color }}
                    className="w-12 h-16 sm:w-14 sm:h-18 rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg border-2 border-white/30 relative flex items-center justify-center transform active:scale-95 transition-transform"
                  >
                    {/* Shiny Reflection */}
                    <div className="absolute top-2 left-2.5 w-3 h-5 rounded-full bg-white/40 rotate-[-25deg]" />
                  </div>
                  {/* Balloon Knot */}
                  <div
                    style={{ borderTopColor: b.color }}
                    className="w-0 h-0 border-x-4 border-x-transparent border-t-6 -mt-0.5"
                  />
                  {/* String */}
                  <div className="w-0.5 h-6 bg-white/30" />
                </div>
              )}
            </div>
          ))}

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
              <Trophy className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
              <h3 className="text-2xl font-bold text-amber-200 font-serif mb-1">
                {isHindi ? 'शानदार निशाना!' : 'Great Shooting!'}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {isHindi
                  ? `आपने ${popsCount} गुब्बारे फोड़े और ${score} अंक बनाए!`
                  : `You popped ${popsCount} balloons and scored ${score} points!`}
              </p>
              <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl px-4 py-2 mb-6">
                <span className="text-amber-300 text-sm font-semibold">
                  {isHindi
                    ? `+${Math.max(10, Math.floor(score / 20))} मेला सिक्के प्राप्त हुए`
                    : `+${Math.max(10, Math.floor(score / 20))} Mela Tokens Earned`}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={initGame}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isHindi ? 'फिर से खेलें' : 'Play Again'}</span>
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-all"
                >
                  {isHindi ? 'बाहर जाएं' : 'Back to Fair'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#141d26] text-xs text-gray-400">
          <span>{isHindi ? '🎯 निशाना लगाने के लिए गुब्बारे पर क्लिक करें' : '🎯 Click directly on balloons to shoot darts'}</span>
          <button
            onClick={initGame}
            className="flex items-center space-x-1 text-amber-400 hover:text-amber-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHindi ? 'रीसेट' : 'Restart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
