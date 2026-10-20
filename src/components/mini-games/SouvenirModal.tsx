import React, { useState } from 'react';
import { X, Sparkles, Coins, Gift } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { SOUVENIR_ITEMS } from '../../data/melaContent';
import { audioManager } from '../../services/audioManager';

export const SouvenirModal: React.FC = () => {
  const {
    setActiveModal,
    tokens,
    spendTokens,
    addItemToInventory,
    settings
  } = useGameStore();

  const [selectedItem, setSelectedItem] = useState(SOUVENIR_ITEMS[0]);
  const isHindi = settings.language === 'hi';

  const handleBuy = (item: typeof SOUVENIR_ITEMS[0]) => {
    const success = spendTokens(item.price);
    if (!success) return;

    audioManager.playRingHit(true);

    addItemToInventory({
      id: item.id,
      name: item.name,
      hindiName: item.hindiName,
      category: 'souvenir',
      description: item.description,
      hindiDescription: item.hindiDescription,
      icon: item.icon
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#142823] to-[#0c1815] rounded-2xl border-2 border-[#16a085] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#16a085] to-[#1abc9c] text-white">
          <div className="flex items-center space-x-2.5">
            <Gift className="w-6 h-6 text-emerald-100" />
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'मेला हाट (दस्तकारी व यादें)' : 'Mela Haat (Souvenirs & Crafts)'}
              </h2>
              <p className="text-xs text-emerald-100">
                {isHindi ? 'हस्तशिल्प और मेले की सुंदर यादगार चीजें!' : 'Handcrafted festival souvenirs and cultural keepsakes!'}
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
        <div className="flex items-center justify-between py-2 px-5 bg-[#0e1d19] border-b border-teal-900/40 text-sm">
          <span className="text-teal-200/80">
            {isHindi ? 'भारतीय उत्सव धरोहर' : 'Festive Indian Heritage'}
          </span>
          <div className="flex items-center space-x-1.5 bg-teal-950/60 border border-teal-500/40 px-3 py-1 rounded-full text-amber-300 font-bold text-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{tokens} {isHindi ? 'सिक्के' : 'Tokens'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {SOUVENIR_ITEMS.map((item) => {
              const isSelected = selectedItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-900/40 border-teal-400 shadow-md translate-x-1'
                      : 'bg-[#10201c] border-teal-950 hover:bg-teal-950/40 hover:border-teal-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-teal-100">
                        {isHindi ? item.hindiName : item.name}
                      </h4>
                      <p className="text-[11px] text-amber-300">
                        {item.price} {isHindi ? 'सिक्के' : 'Tokens'}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Sparkles className="w-4 h-4 text-teal-300 animate-spin-slow" />}
                </div>
              );
            })}
          </div>

          {/* Item details */}
          <div className="flex flex-col justify-between bg-[#0f1d19] border border-teal-800/40 rounded-xl p-4">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-5xl">{selectedItem.icon}</span>
                <div>
                  <h3 className="font-bold text-base text-teal-200">
                    {isHindi ? selectedItem.hindiName : selectedItem.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{selectedItem.price} {isHindi ? 'सिक्के' : 'Tokens'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                {isHindi ? selectedItem.hindiDescription : selectedItem.description}
              </p>
            </div>

            <button
              onClick={() => handleBuy(selectedItem)}
              disabled={tokens < selectedItem.price}
              className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-[#16a085] to-[#1abc9c] hover:brightness-110 active:scale-95 disabled:opacity-40 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Gift className="w-4 h-4" />
              <span>
                {isHindi
                  ? `खरीदें (${selectedItem.price} सिक्के)`
                  : `Purchase (${selectedItem.price} Tokens)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
