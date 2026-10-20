import React, { useState } from 'react';
import { Target, CheckCircle2, ChevronRight, ChevronLeft, Gift } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const ObjectivePanel: React.FC = () => {
  const { quests, settings } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  const isHindi = settings.language === 'hi';
  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="fixed top-14 sm:top-16 right-2 sm:right-4 z-30 pointer-events-auto">
      {/* Drawer Toggle Tab */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-lg hover:border-amber-400 transition-all ml-auto"
      >
        <Target className="w-3.5 h-3.5 text-yellow-400" />
        <span>
          {isHindi ? 'लक्ष्य' : 'Quests'}: {completedCount}/{quests.length}
        </span>
        {isOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Objective List */}
      {isOpen && (
        <div className="mt-2 w-72 sm:w-80 bg-black/80 backdrop-blur-md border-2 border-amber-600/50 rounded-2xl p-3.5 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2 mb-2.5">
            <h3 className="text-xs font-bold text-amber-200 font-serif uppercase tracking-wider flex items-center space-x-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>{isHindi ? 'मेला अभियान व लक्ष्य' : 'Festival Quests'}</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              {completedCount}/{quests.length}
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {quests.map((q) => (
              <div
                key={q.id}
                className={`p-2 rounded-xl border flex items-start space-x-2.5 transition-all ${
                  q.completed
                    ? 'bg-emerald-950/30 border-emerald-500/30 opacity-75'
                    : 'bg-[#151d26]/80 border-amber-900/40'
                }`}
              >
                <span className="text-base shrink-0">{q.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-bold truncate ${
                        q.completed ? 'line-through text-emerald-300' : 'text-amber-100'
                      }`}
                    >
                      {isHindi ? q.hindiTitle : q.title}
                    </h4>
                    {q.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-amber-300 font-semibold font-mono shrink-0">
                        +{q.rewardTokens} 🪙
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-300 mt-0.5 leading-snug">
                    {isHindi ? q.hindiDescription : q.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
