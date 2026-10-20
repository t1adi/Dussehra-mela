import React, { useState } from 'react';
import { X, Gamepad2, Coins, Sparkles, Play } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { TOY_ITEMS } from '../../data/melaContent';
import { ToyItem } from '../../types';
import { audioManager } from '../../services/audioManager';

export const ToyStallModal: React.FC = () => {
  const {
    setActiveModal,
    tokens,
    spendTokens,
    addItemToInventory,
    completeQuest,
    settings
  } = useGameStore();

  const [selectedToy, setSelectedToy] = useState<ToyItem>(TOY_ITEMS[0]);
  const [isToyActive, setIsToyActive] = useState(false);

  const isHindi = settings.language === 'hi';

  const handlePlayWithToy = (toy: ToyItem) => {
    audioManager.playToySound(toy.interactiveType);
    setIsToyActive(true);
    setTimeout(() => {
      setIsToyActive(false);
    }, 1800);
  };

  const handleBuy = (toy: ToyItem) => {
    const success = spendTokens(toy.price);
    if (!success) return;

    audioManager.playRingHit(true);
    completeQuest('toy-quest');

    addItemToInventory({
      id: toy.id,
      name: toy.name,
      hindiName: toy.hindiName,
      category: 'toy',
      description: toy.description,
      hindiDescription: toy.hindiDescription,
      icon: toy.icon
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#25192e] to-[#120d18] rounded-2xl border-2 border-[#9b59b6] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#8e44ad] to-[#9b59b6] text-white">
          <div className="flex items-center space-x-2.5">
            <Gamepad2 className="w-6 h-6 text-purple-200" />
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'देसी खिलौनों की दुकान' : 'Desi Khilone (Traditional Toys)'}
              </h2>
              <p className="text-xs text-purple-200">
                {isHindi ? 'बचपन की यादें और लकड़ी के पारंपरिक खिलौने!' : 'Nostalgic handmade toys from Indian fairs!'}
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

        {/* Status Bar */}
        <div className="flex items-center justify-between py-2 px-5 bg-[#170e1f] border-b border-purple-900/30 text-sm">
          <span className="text-purple-200/80">
            {isHindi ? 'पारंपरिक हस्तशिल्प खिलौने' : 'Handcrafted Cultural Playthings'}
          </span>
          <div className="flex items-center space-x-1.5 bg-purple-950/60 border border-purple-500/40 px-3 py-1 rounded-full text-amber-300 font-bold text-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{tokens} {isHindi ? 'सिक्के' : 'Tokens'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toy List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {TOY_ITEMS.map((toy) => {
              const isSelected = selectedToy.id === toy.id;
              return (
                <div
                  key={toy.id}
                  onClick={() => setSelectedToy(toy)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-900/40 border-purple-400 shadow-md translate-x-1'
                      : 'bg-[#1b1224] border-purple-950 hover:bg-purple-950/40 hover:border-purple-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{toy.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-100">
                        {isHindi ? toy.hindiName : toy.name}
                      </h4>
                      <p className="text-[11px] text-amber-300">
                        {toy.price} {isHindi ? 'सिक्के' : 'Tokens'}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />}
                </div>
              );
            })}
          </div>

          {/* Interactive Inspection & Purchase */}
          <div className="flex flex-col justify-between bg-[#181021] border border-purple-800/40 rounded-xl p-4">
            <div>
              <div className="flex flex-col items-center justify-center p-6 bg-purple-950/30 rounded-xl border border-purple-900/30 mb-3">
                <span
                  className={`text-6xl mb-2 transition-transform duration-500 ${
                    isToyActive
                      ? selectedToy.interactiveType === 'lattu' || selectedToy.interactiveType === 'phirki'
                        ? 'animate-spin'
                        : 'animate-bounce'
                      : 'hover:scale-110'
                  }`}
                >
                  {selectedToy.icon}
                </span>

                <button
                  onClick={() => handlePlayWithToy(selectedToy)}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-700/60 hover:bg-purple-600 rounded-full text-xs text-white font-medium shadow transition-all active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>
                    {isHindi
                      ? selectedToy.interactiveType === 'lattu'
                        ? 'लट्टू घुमाएं'
                        : selectedToy.interactiveType === 'dholak'
                        ? 'ताल बजाएं'
                        : 'चला कर देखें'
                      : 'Try Toy Interaction'}
                  </span>
                </button>
              </div>

              <h3 className="font-bold text-base text-purple-200 mb-1">
                {isHindi ? selectedToy.hindiName : selectedToy.name}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {isHindi ? selectedToy.hindiDescription : selectedToy.description}
              </p>
            </div>

            <button
              onClick={() => handleBuy(selectedToy)}
              disabled={tokens < selectedToy.price}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#8e44ad] to-[#e84393] hover:brightness-110 active:scale-95 disabled:opacity-40 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Coins className="w-4 h-4" />
              <span>
                {isHindi
                  ? `थैले में रखें (${selectedToy.price} सिक्के)`
                  : `Add to Bag (${selectedToy.price} Tokens)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
