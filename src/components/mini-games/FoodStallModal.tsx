import React, { useState } from 'react';
import { X, Utensils, Coins, Sparkles, Check } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { FOOD_ITEMS } from '../../data/melaContent';
import { FoodItem } from '../../types';
import { audioManager } from '../../services/audioManager';

export const FoodStallModal: React.FC = () => {
  const {
    setActiveModal,
    tokens,
    spendTokens,
    addItemToInventory,
    completeQuest,
    settings
  } = useGameStore();

  const [selectedItem, setSelectedItem] = useState<FoodItem>(FOOD_ITEMS[0]);
  const [lastEatenReaction, setLastEatenReaction] = useState<string | null>(null);

  const isHindi = settings.language === 'hi';

  const handleTaste = (item: FoodItem) => {
    const success = spendTokens(item.price);
    if (!success) return;

    audioManager.playEatSnack();
    completeQuest('food-quest');

    addItemToInventory({
      id: item.id,
      name: item.name,
      hindiName: item.hindiName,
      category: 'snack',
      description: item.description,
      hindiDescription: item.hindiDescription,
      icon: item.icon
    });

    const reaction = isHindi ? item.hindiTasteReaction : item.tasteReaction;
    setLastEatenReaction(reaction);
    setTimeout(() => {
      setLastEatenReaction(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#211a14] to-[#120d0a] rounded-2xl border-2 border-[#d35400] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#d35400] to-[#e67e22] text-white">
          <div className="flex items-center space-x-2.5">
            <Utensils className="w-6 h-6 text-amber-200" />
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'चाट और जलेबी का ठेला' : 'Chaat & Mithai Corner'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHindi ? 'मेले के असली स्वाद का गरमा-गरम मज़ा!' : 'Taste the authentic flavors of the Indian fair!'}
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

        {/* Tokens Status Bar */}
        <div className="flex items-center justify-between py-2 px-5 bg-[#17110c] border-b border-amber-900/30 text-sm">
          <span className="text-amber-200/80">
            {isHindi ? 'स्वादिष्ट पारंपरिक पकवान' : 'Traditional Street Delicacies'}
          </span>
          <div className="flex items-center space-x-1.5 bg-amber-950/60 border border-amber-600/40 px-3 py-1 rounded-full text-amber-300 font-bold text-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{tokens} {isHindi ? 'सिक्के' : 'Tokens'}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Menu Items List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {FOOD_ITEMS.map((item) => {
              const isSelected = selectedItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-600/30 border-amber-400 shadow-md translate-x-1'
                      : 'bg-[#1e150f] border-amber-900/40 hover:bg-amber-950/30 hover:border-amber-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-100">
                        {isHindi ? item.hindiName : item.name}
                      </h4>
                      <p className="text-[11px] text-amber-300/70">
                        {item.price} {isHindi ? 'सिक्के' : 'Tokens'}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />}
                </div>
              );
            })}
          </div>

          {/* Selected Item Detail & Dialogue */}
          <div className="flex flex-col justify-between bg-[#19110a] border border-amber-800/40 rounded-xl p-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-4xl">{selectedItem.icon}</span>
                <div>
                  <h3 className="font-bold text-base text-amber-200">
                    {isHindi ? selectedItem.hindiName : selectedItem.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{selectedItem.price} {isHindi ? 'सिक्के' : 'Tokens'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                {isHindi ? selectedItem.hindiDescription : selectedItem.description}
              </p>

              {/* Halwai / Vendor dialogue quote */}
              <div className="bg-amber-950/40 border-l-2 border-amber-500 p-2.5 rounded-r-lg mb-3">
                <p className="text-xs italic text-amber-300/90">
                  "{isHindi ? selectedItem.hindiDialogue : selectedItem.dialogue}"
                </p>
              </div>

              {/* Reaction badge if just eaten */}
              {lastEatenReaction && (
                <div className="bg-emerald-950/60 border border-emerald-500/50 p-2 rounded-lg text-emerald-300 text-xs flex items-center space-x-2 animate-bounce">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lastEatenReaction}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleTaste(selectedItem)}
              disabled={tokens < selectedItem.price}
              className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-[#d35400] to-[#f39c12] hover:brightness-110 active:scale-95 disabled:opacity-40 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Utensils className="w-4 h-4" />
              <span>
                {isHindi
                  ? `चखें (${selectedItem.price} सिक्के)`
                  : `Taste It (${selectedItem.price} Tokens)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
