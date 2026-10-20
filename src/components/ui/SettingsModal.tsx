import React from 'react';
import { X, Settings, Volume2, Monitor, Eye, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { GraphicsQuality } from '../../types';

export const SettingsModal: React.FC = () => {
  const { setActiveModal, settings, updateSettings, resetProgress } = useGameStore();
  const isHindi = settings.language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c2430] to-[#0d141e] rounded-2xl border-2 border-amber-600/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#2c3e50] to-[#34495e] text-white">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold font-serif">
              {isHindi ? 'सेटिंग्स व प्राथमिकताएं' : 'Settings & Preferences'}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4 text-sm">
          {/* Graphics Quality */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs text-amber-200">
              <span className="font-semibold flex items-center space-x-1.5">
                <Monitor className="w-3.5 h-3.5" />
                <span>{isHindi ? 'ग्राफ़िक्स गुणवत्ता' : 'Graphics Quality'}</span>
              </span>
              <span className="capitalize font-mono text-amber-400">{settings.graphicsQuality}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => updateSettings({ graphicsQuality: q })}
                  className={`py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    settings.graphicsQuality === q
                      ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                      : 'bg-[#151e29] border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Volume */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs text-amber-200">
              <span className="font-semibold flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'ध्वनि प्रभाव (SFX)' : 'Sound Effects (SFX)'}</span>
              </span>
              <span className="font-mono text-amber-400">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => updateSettings({ soundVolume: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs text-amber-200">
              <span className="font-semibold flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'संगीत (Music)' : 'Background Music'}</span>
              </span>
              <span className="font-mono text-amber-400">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Ambience Volume */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs text-amber-200">
              <span className="font-semibold flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'मेले का वातावरण व ढोलक' : 'Mela Ambience & Dholak'}</span>
              </span>
              <span className="font-mono text-amber-400">{Math.round(settings.ambienceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.ambienceVolume}
              onChange={(e) => updateSettings({ ambienceVolume: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Camera Sensitivity */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs text-amber-200">
              <span className="font-semibold flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{isHindi ? 'कैमरा संवेदनशीलता' : 'Camera Sensitivity'}</span>
              </span>
              <span className="font-mono text-amber-400">{settings.cameraSensitivity}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.cameraSensitivity}
              onChange={(e) => updateSettings({ cameraSensitivity: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Reset progress */}
          <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {isHindi ? 'मेला प्रगति रीसेट करें' : 'Reset progress'}
            </span>
            <button
              onClick={() => {
                if (window.confirm(isHindi ? 'क्या आप सचमुच प्रगति रीसेट करना चाहते हैं?' : 'Reset game progress?')) {
                  resetProgress();
                  setActiveModal(null);
                }
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-700/50 rounded-xl text-red-300 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isHindi ? 'रीसेट' : 'Reset All'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
