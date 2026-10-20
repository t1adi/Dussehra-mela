import React, { useState, useEffect, useRef } from 'react';
import { X, Circle, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../services/audioManager';

interface TargetBottle {
  id: number;
  name: string;
  hindiName: string;
  points: number;
  x: number; // percentage
  y: number; // percentage
  isRung: boolean;
  color: string;
}

const TARGETS: TargetBottle[] = [
  // Front Row (Easier)
  { id: 1, name: 'Brass Diya', hindiName: 'पीतल दीया', points: 20, x: 25, y: 55, isRung: false, color: '#f39c12' },
  { id: 2, name: 'Clay Pot', hindiName: 'मटका', points: 15, x: 50, y: 55, isRung: false, color: '#d35400' },
  { id: 3, name: 'Glass Soda', hindiName: 'बंता बोतल', points: 20, x: 75, y: 55, isRung: false, color: '#27ae60' },
  // Middle Row
  { id: 4, name: 'Golden Trophy', hindiName: 'स्वर्ण पात्र', points: 40, x: 35, y: 38, isRung: false, color: '#f1c40f' },
  { id: 5, name: 'Plush Elephant', hindiName: 'खिलौना हाथी', points: 35, x: 65, y: 38, isRung: false, color: '#9b59b6' },
  // Back Row (Hardest, high points)
  { id: 6, name: 'Royal Kalash', hindiName: 'शाही कलश', points: 60, x: 50, y: 22, isRung: false, color: '#e74c3c' }
];

export const RingTossGame: React.FC = () => {
  const { setActiveModal, addTokens, addScore, completeQuest, settings } = useGameStore();

  const [ringsLeft, setRingsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [power, setPower] = useState(50);
  const [aimAngle, setAimAngle] = useState(0); // -30 to +30 degrees
  const [isPowerIncreasing, setIsPowerIncreasing] = useState(true);
  const [isTossing, setIsTossing] = useState(false);
  const [flyingRing, setFlyingRing] = useState<{ x: number; y: number; scale: number; opacity: number } | null>(null);
  const [targets, setTargets] = useState<TargetBottle[]>(TARGETS);
  const [gameOver, setGameOver] = useState(false);

  // Power meter oscillation
  useEffect(() => {
    if (gameOver || isTossing) return;
    const interval = setInterval(() => {
      setPower((prev) => {
        if (prev >= 95) setIsPowerIncreasing(false);
        if (prev <= 15) setIsPowerIncreasing(true);
        return isPowerIncreasing ? prev + 3 : prev - 3;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [gameOver, isTossing, isPowerIncreasing]);

  const tossRing = () => {
    if (isTossing || ringsLeft <= 0 || gameOver) return;

    audioManager.playRingThrow();
    setIsTossing(true);
    setRingsLeft((r) => r - 1);

    // Calculate destination based on aim angle and power
    // Power (15 to 95) maps to y coordinate (from 60% down to 20%)
    const targetY = 65 - (power / 100) * 45;
    const targetX = 50 + (aimAngle / 30) * 35;

    // Animate ring toss
    let progress = 0;
    const animInterval = setInterval(() => {
      progress += 0.05;
      if (progress >= 1) {
        clearInterval(animInterval);
        resolveToss(targetX, targetY);
      } else {
        const currentX = 50 + (targetX - 50) * progress;
        // Parabolic arc for y
        const arcHeight = Math.sin(progress * Math.PI) * 25;
        const currentY = 85 - (85 - targetY) * progress - arcHeight;
        const scale = 1.6 - progress * 0.7;
        setFlyingRing({ x: currentX, y: currentY, scale, opacity: 1 });
      }
    }, 25);
  };

  const resolveToss = (landX: number, landY: number) => {
    // Check if ring landed close enough to any target
    let hitTarget: TargetBottle | null = null;
    let minDistance = 999;

    targets.forEach((t) => {
      if (t.isRung) return;
      const d = Math.hypot(landX - t.x, landY - t.y);
      if (d < 8 && d < minDistance) {
        minDistance = d;
        hitTarget = t;
      }
    });

    if (hitTarget) {
      audioManager.playRingHit(true);
      const points = (hitTarget as TargetBottle).points;
      setScore((s) => s + points);
      setTargets((prev) =>
        prev.map((t) => (t.id === (hitTarget as TargetBottle).id ? { ...t, isRung: true } : t))
      );
      completeQuest('ring-quest');
    } else {
      audioManager.playRingHit(false);
    }

    setFlyingRing(null);
    setIsTossing(false);

    if (ringsLeft <= 1) {
      setTimeout(() => {
        setGameOver(true);
        const tokens = Math.max(10, Math.floor(score / 15));
        addTokens(tokens);
        addScore(score);
        if (score >= 40) {
          confetti({ particleCount: 70, spread: 60 });
        }
      }, 500);
    }
  };

  const resetGame = () => {
    setRingsLeft(5);
    setScore(0);
    setGameOver(false);
    setIsTossing(false);
    setTargets(TARGETS.map((t) => ({ ...t, isRung: false })));
  };

  const isHindi = settings.language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1a252f] to-[#0f171e] rounded-2xl border-2 border-[#f39c12] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#d35400] to-[#b7950b] text-white">
          <div className="flex items-center space-x-2.5">
            <Circle className="w-6 h-6 text-amber-200" />
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'छल्ला फेंको (रिंग टॉस)' : 'Chhalla Phenko (Ring Toss)'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHindi ? 'निशाना साधें और सुनहरी बोतल पर छल्ला चढ़ाएं!' : 'Aim and toss rings over prizes to win tokens!'}
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

        {/* Stats */}
        <div className="flex items-center justify-around py-2.5 px-4 bg-[#141d26] border-b border-amber-900/40 text-sm">
          <div className="flex items-center space-x-1.5 text-amber-300">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>{isHindi ? 'अंक' : 'Score'}:</span>
            <span className="font-mono text-base font-bold text-white">{score}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-cyan-300">
            <span>{isHindi ? 'छल्ले शेष' : 'Rings Left'}:</span>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border border-amber-400 ${
                    idx < ringsLeft ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,176,65,0.6)]' : 'bg-transparent opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Toss Table Arena */}
        <div className="relative w-full h-[320px] sm:h-[360px] bg-gradient-to-b from-[#1b2631] to-[#0b1016] overflow-hidden flex flex-col justify-between p-4">
          {/* Target Bottles Tiered Display */}
          <div className="relative w-full h-full">
            {targets.map((t) => (
              <div
                key={t.id}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  // Direct click to aim
                  setAimAngle(((t.x - 50) / 35) * 30);
                }}
              >
                {/* Ring on bottle if caught */}
                {t.isRung && (
                  <div className="absolute top-2 w-10 h-3 rounded-full border-2 border-yellow-300 bg-yellow-400/30 z-10 animate-bounce" />
                )}

                {/* Bottle / Prize Shape */}
                <div
                  style={{ backgroundColor: t.color }}
                  className="w-8 h-16 rounded-t-lg rounded-b-md shadow-lg border border-white/20 relative flex items-center justify-center transition-transform group-hover:scale-105"
                >
                  <div className="w-3 h-4 bg-white/40 rounded-sm -mt-10" />
                  <span className="text-[10px] font-bold text-white/90 drop-shadow">
                    +{t.points}
                  </span>
                </div>
                <span className="text-[10px] mt-1 text-amber-200 font-semibold bg-black/50 px-1.5 py-0.5 rounded">
                  {isHindi ? t.hindiName : t.name}
                </span>
              </div>
            ))}

            {/* Flying Ring */}
            {flyingRing && (
              <div
                style={{
                  left: `${flyingRing.x}%`,
                  top: `${flyingRing.y}%`,
                  transform: `translate(-50%, -50%) scale(${flyingRing.scale})`,
                  opacity: flyingRing.opacity
                }}
                className="absolute w-12 h-6 rounded-[50%] border-4 border-amber-300 bg-amber-400/20 shadow-[0_0_15px_rgba(243,156,18,0.8)] pointer-events-none z-20"
              />
            )}
          </div>

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30 animate-fadeIn">
              <Trophy className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
              <h3 className="text-2xl font-bold text-amber-200 font-serif mb-1">
                {isHindi ? 'खेल समाप्त!' : 'Round Finished!'}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {isHindi ? `आपका कुल स्कोर: ${score} अंक!` : `Total Score: ${score} points!`}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={resetGame}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isHindi ? 'फिर से खेलें' : 'Play Again'}</span>
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-all"
                >
                  {isHindi ? 'मेले में वापस' : 'Back to Fair'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls: Aim Slider & Power Toss */}
        <div className="p-4 bg-[#141d26] border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Aim Angle */}
          <div className="w-full sm:w-1/2 flex flex-col">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>{isHindi ? 'दिशा (Aim)' : 'Aim Angle'}:</span>
              <span className="font-mono text-amber-300">{Math.round(aimAngle)}°</span>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              value={aimAngle}
              disabled={isTossing || gameOver}
              onChange={(e) => setAimAngle(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Power Meter & Toss Button */}
          <div className="w-full sm:w-1/2 flex items-center space-x-3">
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>{isHindi ? 'ताकत (Power)' : 'Throw Power'}:</span>
                <span className="font-mono text-amber-300">{power}%</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                <div
                  style={{ width: `${power}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75"
                />
              </div>
            </div>

            <button
              onClick={tossRing}
              disabled={isTossing || ringsLeft <= 0 || gameOver}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d35400] to-[#f39c12] hover:brightness-110 active:scale-95 disabled:opacity-40 text-white font-bold shadow-lg transition-all"
            >
              {isHindi ? 'छल्ला फेंकें' : 'Toss Ring'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
