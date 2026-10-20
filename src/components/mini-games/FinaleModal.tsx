import React, { useState, useEffect } from 'react';
import { X, Flame, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../services/audioManager';
import { FinalePhase } from '../../types';

export const FinaleModal: React.FC = () => {
  const {
    setActiveModal,
    finalePhase,
    setFinalePhase,
    settings,
    addTokens,
    addScore
  } = useGameStore();

  const [countdown, setCountdown] = useState(3);
  const [cinematicText, setCinematicText] = useState({ title: '', subtitle: '' });

  const isHindi = settings.language === 'hi';

  const startFinaleSequence = () => {
    // Step 1: Countdown
    setFinalePhase('countdown');
    audioManager.playBell();
    setCinematicText({
      title: isHindi ? 'दीप जले · मन के अंधेरे मिटें' : 'Light Diyas · Dispel Darkness',
      subtitle: isHindi ? 'तैयारी... ३, २, १' : 'Prepare for victory... 3, 2, 1'
    });

    let count = 3;
    const countTimer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      audioManager.playBell();

      if (count <= 0) {
        clearInterval(countTimer);
        // Step 2: Fiery Arrow Launch
        setFinalePhase('arrow');
        audioManager.playConch();
        setTimeout(() => {
          audioManager.playFirework();
        }, 500);

        setCinematicText({
          title: isHindi ? 'धर्म की विजय' : 'Triumph of Righteousness',
          subtitle: isHindi ? 'श्री राम का दिव्य अग्नि-बाण चला!' : 'Lord Rama releases the sacred blazing arrow!'
        });

        // Step 3: Burning Effigy & Crackers
        setTimeout(() => {
          setFinalePhase('burn');
          audioManager.playFirework();
          audioManager.playCheer();

          setCinematicText({
            title: isHindi ? 'बुराई पर अच्छाई की जीत!' : 'Victory of Good over Evil!',
            subtitle: isHindi ? 'जय श्री राम! अधर्म का नाश हुआ।' : 'Jai Shri Ram! The effigy is engulfed in victory flames.'
          });

          // Step 4: Sky Fireworks Celebration
          setTimeout(() => {
            setFinalePhase('celebrate');
            audioManager.playCheer();
            audioManager.playFirework();

            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.5 }
            });

            addTokens(50);
            addScore(200);

            setCinematicText({
              title: isHindi ? 'हर दिल में उजाला · शुभ दशहरा!' : 'Light in Every Heart · Happy Dussehra!',
              subtitle: isHindi ? 'विशाल दशहरा मेला सम्पन्न हुआ। बधाई!' : 'Grand Dussehra Finale complete! Congratulations!'
            });
          }, 3500);
        }, 3000);
      }
    }, 1000);
  };

  const closeFinale = () => {
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#2e190d] to-[#140b06] rounded-2xl border-2 border-[#e67e22] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#d35400] to-[#e67e22] text-white">
          <div className="flex items-center space-x-2.5">
            <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'रावण दहन उत्सव' : 'Grand Ravana Dahan Finale'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHindi ? 'विजयादशमी का पावन पर्व' : 'The Sacred Festival of Vijaya Dashami'}
              </p>
            </div>
          </div>
          <button
            onClick={closeFinale}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {finalePhase === 'idle' && (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-600/20 border-2 border-amber-500/50 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(230,126,34,0.4)]">
                <Flame className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold font-serif text-amber-200 mb-2">
                {isHindi ? 'दशहरा मेला का मुख्य उत्सव' : 'The Grand Festival Climax'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mb-6">
                {isHindi
                  ? 'भगवान श्री राम के पावन अग्नि-बाण से दशानन रावण के पुतले का दहन करें और आकाश को भव्य आतिशबाजी से रोशन करें।'
                  : 'Witness the symbolic triumph of righteousness as the fiery arrow strikes Ravana, lighting the night sky in a burst of vibrant fireworks and cheers!'}
              </p>

              <button
                onClick={startFinaleSequence}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d35400] via-[#e67e22] to-[#f39c12] hover:brightness-110 active:scale-95 text-white font-bold text-base shadow-2xl transition-all flex items-center justify-center space-x-2"
              >
                <Flame className="w-5 h-5" />
                <span>{isHindi ? 'अग्नि-बाण चलाएं (रावण दहन)' : 'Ignite Fiery Arrow & Begin Finale'}</span>
              </button>
            </>
          )}

          {finalePhase === 'countdown' && (
            <div className="py-8 flex flex-col items-center animate-pulse">
              <span className="text-7xl font-bold font-serif text-amber-400 mb-4 drop-shadow-[0_0_20px_rgba(243,156,18,0.8)]">
                {countdown}
              </span>
              <h4 className="text-lg font-bold text-amber-200">{cinematicText.title}</h4>
              <p className="text-sm text-gray-300">{cinematicText.subtitle}</p>
            </div>
          )}

          {(finalePhase === 'arrow' || finalePhase === 'burn') && (
            <div className="py-6 flex flex-col items-center">
              <div className="relative mb-4">
                <Flame className="w-16 h-16 text-red-500 animate-bounce" />
                <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-spin-slow" />
              </div>
              <h4 className="text-xl font-bold font-serif text-amber-300 mb-1 glow-gold">
                {cinematicText.title}
              </h4>
              <p className="text-sm text-gray-200 italic mb-4">{cinematicText.subtitle}</p>
              <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse w-full" />
              </div>
            </div>
          )}

          {finalePhase === 'celebrate' && (
            <div className="py-4 flex flex-col items-center animate-fadeIn">
              <Trophy className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
              <h3 className="text-2xl font-bold font-serif text-amber-200 mb-1 glow-gold">
                {cinematicText.title}
              </h3>
              <p className="text-sm text-gray-200 mb-4 max-w-md">{cinematicText.subtitle}</p>

              <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-3 mb-6 w-full max-w-sm">
                <div className="text-amber-300 font-bold text-sm mb-1">
                  {isHindi ? '🎖️ विजयादशमी स्वर्ण पदक प्राप्त!' : '🎖️ Vijaya Dashami Golden Medal Awarded!'}
                </div>
                <div className="text-xs text-amber-100">
                  {isHindi ? '+५० सिक्के और +२०० अंक जोड़े गए' : '+50 Mela Tokens & +200 Score Added'}
                </div>
              </div>

              <div className="flex space-x-3 w-full justify-center">
                <button
                  onClick={closeFinale}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow transition-all"
                >
                  {isHindi ? 'मेले की सैर जारी रखें' : 'Continue Exploring Mela'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
