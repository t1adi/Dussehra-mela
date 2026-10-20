import React from 'react';
import {
  Volume2,
  VolumeX,
  Languages,
  Settings,
  ShoppingBag,
  HelpCircle,
  Coins,
  Trophy
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const TopBar: React.FC = () => {
  const {
    tokens,
    score,
    settings,
    toggleLanguage,
    toggleMute,
    setActiveModal
  } = useGameStore();

  const isHindi = settings.language === 'hi';
  const isMuted = settings.soundVolume === 0 && settings.musicVolume === 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-2 sm:p-4 pointer-events-none flex items-center justify-between">
      {/* Brand Badge */}
      <div className="pointer-events-auto flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-lg text-white">
        <span className="text-xl">🎡</span>
        <div>
          <h1 className="text-xs sm:text-sm font-bold font-festive text-amber-200 tracking-wide">
            {isHindi ? 'मेला चलोगे?' : 'Mela Chaloge'}
          </h1>
          <p className="text-[9px] text-amber-300/70 hidden sm:block">
            {isHindi ? 'दशहरा मेला' : '3D Indian Fair'}
          </p>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="pointer-events-auto flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Token Counter */}
        <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md border border-amber-500/40 px-2.5 sm:px-3 py-1.5 rounded-full text-amber-300 text-xs sm:text-sm font-bold shadow">
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
          <span>{tokens}</span>
        </div>

        {/* Score Counter */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-black/60 backdrop-blur-md border border-yellow-500/30 px-3 py-1.5 rounded-full text-yellow-300 text-xs font-semibold shadow">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>{score}</span>
        </div>

        {/* Inventory Bag Button */}
        <button
          onClick={() => setActiveModal('inventory')}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white transition-all shadow active:scale-95"
          title={isHindi ? 'मेला थैला (सामान)' : 'Festival Bag (Inventory)'}
        >
          <ShoppingBag className="w-4 h-4" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white transition-all shadow active:scale-95"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Language Toggle (EN / HI) */}
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white text-xs font-bold transition-all shadow active:scale-95 flex items-center space-x-1"
          title="Toggle Hindi / English"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{settings.language === 'en' ? 'हिन्दी' : 'EN'}</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setActiveModal('settings')}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white transition-all shadow active:scale-95"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Tutorial Button */}
        <button
          onClick={() => setActiveModal('tutorial')}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white transition-all shadow active:scale-95"
          title="Controls & Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
