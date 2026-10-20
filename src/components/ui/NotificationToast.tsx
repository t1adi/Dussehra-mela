import React from 'react';
import { Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const NotificationToast: React.FC = () => {
  const { notification } = useGameStore();

  if (!notification || !notification.visible) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
      <div className="flex items-center space-x-2.5 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-md border-2 border-amber-400 text-amber-200 shadow-2xl">
        <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow shrink-0" />
        <div className="text-left">
          <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
            {notification.title}
          </div>
          {notification.subtitle && (
            <div className="text-[10px] text-amber-300 font-medium">
              {notification.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
