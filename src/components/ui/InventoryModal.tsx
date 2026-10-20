import React, { useState } from 'react';
import { X, ShoppingBag, Sparkles, Award } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const InventoryModal: React.FC = () => {
  const { setActiveModal, inventory, settings } = useGameStore();
  const [filter, setFilter] = useState<'all' | 'snack' | 'toy' | 'souvenir' | 'badge'>('all');

  const isHindi = settings.language === 'hi';

  const filteredItems = filter === 'all'
    ? inventory
    : inventory.filter((item) => item.category === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1c2430] to-[#0d141e] rounded-2xl border-2 border-amber-600/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#b9770e] to-[#d35400] text-white">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-6 h-6 text-yellow-200" />
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'मेला झोला (सामान संग्रह)' : 'Festival Bag (Inventory)'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHindi ? `${inventory.length} चीजें एकत्रित` : `${inventory.length} items collected in your bag`}
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

        {/* Category Tabs */}
        <div className="flex border-b border-amber-900/30 px-4 py-2 bg-[#141b24] space-x-2 overflow-x-auto text-xs">
          {[
            { id: 'all', label: isHindi ? 'सभी' : 'All' },
            { id: 'snack', label: isHindi ? 'पकवान' : 'Snacks' },
            { id: 'toy', label: isHindi ? 'खिलौने' : 'Toys' },
            { id: 'souvenir', label: isHindi ? 'यादगार' : 'Souvenirs' },
            { id: 'badge', label: isHindi ? 'पदक व पास' : 'Medals & Pass' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                filter === tab.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-black/30 text-amber-200/70 hover:bg-black/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-2 text-amber-500/30" />
              <p className="text-sm font-medium">
                {isHindi ? 'इस श्रेणी में अभी कोई सामान नहीं है।' : 'No items collected in this category yet.'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isHindi ? 'दुकानों और खेलों से चीजें खरीदें!' : 'Visit mela stalls to shop & win souvenirs!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-[#151e29] border border-amber-900/40 hover:border-amber-600/50 transition-all"
                >
                  <span className="text-3xl shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-amber-100 truncate">
                        {isHindi ? item.hindiName : item.name}
                      </h4>
                      {item.count > 1 && (
                        <span className="text-xs bg-amber-600/40 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                          x{item.count}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold block mt-0.5">
                      {item.category}
                    </span>
                    <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                      {isHindi ? item.hindiDescription : item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
