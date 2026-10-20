import React from 'react';
import { X, Keyboard, Smartphone, Compass, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const TutorialOverlay: React.FC = () => {
  const { setActiveModal, settings } = useGameStore();
  const isHindi = settings.language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1c2430] to-[#0d141e] rounded-2xl border-2 border-amber-600/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#d35400] to-[#b9770e] text-white">
          <div className="flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-yellow-300" />
            <h2 className="text-base font-bold font-serif">
              {isHindi ? 'मेले का दिशा-निर्देश' : 'Fair Guide & Controls'}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm text-gray-200">
          {/* Desktop Controls */}
          <div className="p-3 bg-[#151e29] rounded-xl border border-amber-900/40">
            <h3 className="font-bold text-amber-300 mb-2 flex items-center space-x-2">
              <Keyboard className="w-4 h-4" />
              <span>{isHindi ? 'डेस्कटॉप नियंत्रण (Desktop)' : 'Desktop Controls'}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li><strong className="text-amber-200">W, A, S, D / तीर कुंजियाँ:</strong> {isHindi ? 'मेले में आगे-पीछे व दाएं-बाएं घूमें' : 'Walk around the fair'}</li>
              <li><strong className="text-amber-200">Shift:</strong> {isHindi ? 'तेज़ दौड़ें' : 'Sprint faster'}</li>
              <li><strong className="text-amber-200">माउस ड्रैग:</strong> {isHindi ? 'कैमरा चारों ओर घुमाएं' : 'Orbit & look around in 360°'}</li>
              <li><strong className="text-amber-200">[E] या Space:</strong> {isHindi ? 'स्टॉल या खेल में प्रवेश करें' : 'Interact with stalls & attractions'}</li>
            </ul>
          </div>

          {/* Mobile Controls */}
          <div className="p-3 bg-[#151e29] rounded-xl border border-amber-900/40">
            <h3 className="font-bold text-amber-300 mb-2 flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>{isHindi ? 'मोबाइल नियंत्रण (Mobile)' : 'Mobile Controls'}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li><strong className="text-amber-200">{isHindi ? 'वर्चुअल जॉयस्टिक:' : 'Touch Joystick:'}</strong> {isHindi ? 'स्क्रीन के निचले बाएं कोने से दिशा दें' : 'Bottom-left corner to walk'}</li>
              <li><strong className="text-amber-200">{isHindi ? 'स्क्रीन स्वाइप:' : 'Screen Swipe:'}</strong> {isHindi ? 'कैमरा देखने के लिए कहीं भी ड्रैग करें' : 'Drag anywhere to look around'}</li>
              <li><strong className="text-amber-200">{isHindi ? 'बटन:' : 'Action Button:'}</strong> {isHindi ? 'स्टॉल के पास आने पर स्क्रीन पर बटन दबाएं' : 'Tap prompt button to enter stall'}</li>
            </ul>
          </div>

          {/* Key Attractions */}
          <div className="p-3 bg-[#151e29] rounded-xl border border-amber-900/40">
            <h3 className="font-bold text-amber-300 mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>{isHindi ? 'मुख्य आकर्षण' : 'Key Attractions'}</span>
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isHindi
                ? '🎯 गुब्बारा निशानेबाज़ी • ⭕ रिंग टॉस • 🍲 चाट-जलेबी • 🪀 पारंपरिक खिलौने • 🎡 आकाश झूला • 🎭 रामलीला • 🔥 भव्य रावण दहन उत्सव!'
                : '🎯 Balloon Pop • ⭕ Ring Toss • 🍲 Hot Chaat & Jalebi • 🪀 Desi Toys • 🎡 Giant Ferris Wheel • 🎭 Ram Leela Stage • 🔥 Grand Ravana Dahan Finale!'}
            </p>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all"
          >
            {isHindi ? 'समझ गया, मेला घूमें!' : 'Got it, let\'s explore!'}
          </button>
        </div>
      </div>
    </div>
  );
};
