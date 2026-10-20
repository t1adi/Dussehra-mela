import { create } from 'zustand';
import { GameSettings, InventoryItem, ModalType, Quest, StallInfo, FinalePhase } from '../types';
import { INITIAL_QUESTS } from '../data/melaContent';
import { audioManager } from '../services/audioManager';

interface GameState {
  isLoaded: boolean;
  gameStarted: boolean;
  activeModal: ModalType;
  nearbyStall: StallInfo | null;
  tokens: number;
  score: number;
  quests: Quest[];
  inventory: InventoryItem[];
  visitedStalls: string[];
  settings: GameSettings;
  isRidingFerrisWheel: boolean;
  finalePhase: FinalePhase;
  playerPosition: [number, number, number];
  playerRotation: number;
  joystickInput: { x: number; y: number; active: boolean };
  notification: { title: string; subtitle?: string; visible: boolean } | null;

  // Actions
  setLoaded: (val: boolean) => void;
  startGame: () => void;
  setActiveModal: (modal: ModalType) => void;
  setNearbyStall: (stall: StallInfo | null) => void;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  addScore: (points: number) => void;
  completeQuest: (questId: string) => void;
  addItemToInventory: (item: Omit<InventoryItem, 'count'>) => void;
  markStallVisited: (stallId: string) => void;
  setPlayerPosition: (pos: [number, number, number], rot: number) => void;
  setJoystickInput: (x: number, y: number, active: boolean) => void;
  startFerrisRide: () => void;
  stopFerrisRide: () => void;
  setFinalePhase: (phase: FinalePhase) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  toggleLanguage: () => void;
  toggleMute: () => void;
  showNotification: (title: string, subtitle?: string) => void;
  resetProgress: () => void;
}

const STORAGE_KEY = 'mela_chaloge_save_v1';

const getInitialStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed reading save state from localStorage', e);
  }
  return null;
};

const savedData = getInitialStorage();

export const useGameStore = create<GameState>((set, get) => ({
  isLoaded: false,
  gameStarted: false,
  activeModal: null,
  nearbyStall: null,
  tokens: savedData?.tokens ?? 40,
  score: savedData?.score ?? 0,
  quests: savedData?.quests ?? INITIAL_QUESTS,
  inventory: savedData?.inventory ?? [
    {
      id: 'mela-pass',
      name: 'Mela Welcome Pass',
      hindiName: 'मेला प्रवेश पत्र',
      category: 'badge',
      description: 'Your lucky golden ticket to the grand Dussehra Mela!',
      hindiDescription: 'विशाल दशहरा मेले का आपका शुभ प्रवेश पत्र!',
      icon: '🎫',
      count: 1
    }
  ],
  visitedStalls: savedData?.visitedStalls ?? [],
  settings: savedData?.settings ?? {
    graphicsQuality: 'high',
    soundVolume: 0.8,
    musicVolume: 0.55,
    ambienceVolume: 0.65,
    cameraSensitivity: 1.0,
    language: 'en'
  },
  isRidingFerrisWheel: false,
  finalePhase: 'idle',
  playerPosition: [0, 0, 24],
  playerRotation: Math.PI,
  joystickInput: { x: 0, y: 0, active: false },
  notification: null,

  setLoaded: (val: boolean) => set({ isLoaded: val }),

  startGame: () => {
    audioManager.resume();
    audioManager.startBackgroundMusic();
    set({ gameStarted: true });
  },

  setActiveModal: (modal: ModalType) => {
    audioManager.playClick();
    set({ activeModal: modal });
  },

  setNearbyStall: (stall: StallInfo | null) => set({ nearbyStall: stall }),

  addTokens: (amount: number) => {
    set((state) => {
      const newTokens = state.tokens + amount;
      saveToLocalStorage({ ...state, tokens: newTokens });
      return { tokens: newTokens };
    });
    get().showNotification(`+${amount} Mela Tokens!`, 'Coins added to your pouch');
  },

  spendTokens: (amount: number) => {
    const state = get();
    if (state.tokens >= amount) {
      const newTokens = state.tokens - amount;
      set({ tokens: newTokens });
      saveToLocalStorage({ ...state, tokens: newTokens });
      return true;
    }
    get().showNotification('Not enough tokens!', 'Play mini-games to win more tokens');
    return false;
  },

  addScore: (points: number) => {
    set((state) => {
      const newScore = state.score + points;
      saveToLocalStorage({ ...state, score: newScore });
      return { score: newScore };
    });
  },

  completeQuest: (questId: string) => {
    set((state) => {
      let rewarded = false;
      let rewardAmount = 0;
      let questTitle = '';

      const updated = state.quests.map((q) => {
        if (q.id === questId && !q.completed) {
          rewarded = true;
          rewardAmount = q.rewardTokens;
          questTitle = state.settings.language === 'hi' ? q.hindiTitle : q.title;
          return { ...q, completed: true };
        }
        return q;
      });

      if (rewarded) {
        audioManager.playRingHit(true);
        const newTokens = state.tokens + rewardAmount;
        saveToLocalStorage({ ...state, quests: updated, tokens: newTokens });
        setTimeout(() => {
          get().showNotification(`Quest Complete: ${questTitle}!`, `+${rewardAmount} Tokens Earned`);
        }, 150);
        return { quests: updated, tokens: newTokens };
      }
      return state;
    });
  },

  addItemToInventory: (item) => {
    set((state) => {
      const existing = state.inventory.find((i) => i.id === item.id);
      let updated: InventoryItem[];
      if (existing) {
        updated = state.inventory.map((i) =>
          i.id === item.id ? { ...i, count: i.count + 1 } : i
        );
      } else {
        updated = [...state.inventory, { ...item, count: 1 }];
      }
      saveToLocalStorage({ ...state, inventory: updated });
      get().showNotification(
        state.settings.language === 'hi' ? `नया सामान मिला: ${item.hindiName}` : `Item Collected: ${item.name}!`,
        'Saved in your festival bag'
      );
      return { inventory: updated };
    });
  },

  markStallVisited: (stallId: string) => {
    set((state) => {
      if (!state.visitedStalls.includes(stallId)) {
        const updated = [...state.visitedStalls, stallId];
        saveToLocalStorage({ ...state, visitedStalls: updated });
        return { visitedStalls: updated };
      }
      return state;
    });
  },

  setPlayerPosition: (pos, rot) => set({ playerPosition: pos, playerRotation: rot }),

  setJoystickInput: (x, y, active) => set({ joystickInput: { x, y, active } }),

  startFerrisRide: () => {
    audioManager.playClick();
    set({ isRidingFerrisWheel: true, activeModal: 'ferris-wheel-ride' });
    get().completeQuest('wheel-quest');
  },

  stopFerrisRide: () => {
    audioManager.playClick();
    set({ isRidingFerrisWheel: false, activeModal: null });
  },

  setFinalePhase: (phase: FinalePhase) => {
    set({ finalePhase: phase });
    if (phase === 'celebrate') {
      get().completeQuest('finale-quest');
      get().addItemToInventory({
        id: 'vijay-badge',
        name: 'Vijaya Dashami Golden Medal',
        hindiName: 'विजयादशमी स्वर्ण पदक',
        category: 'badge',
        description: 'Awarded for igniting the Ravana Dahan and celebrating the triumph of righteousness!',
        hindiDescription: 'सत्य और धर्म की विजय का साक्षी बनने पर प्राप्त दिव्य स्वर्ण पदक!',
        icon: '🎖️'
      });
    }
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      if (newSettings.soundVolume !== undefined) audioManager.setSfxVolume(newSettings.soundVolume);
      if (newSettings.musicVolume !== undefined) audioManager.setMusicVolume(newSettings.musicVolume);
      if (newSettings.ambienceVolume !== undefined) audioManager.setAmbienceVolume(newSettings.ambienceVolume);
      saveToLocalStorage({ ...state, settings: updated });
      return { settings: updated };
    });
  },

  toggleLanguage: () => {
    set((state) => {
      const newLang: import('../types').Language = state.settings.language === 'en' ? 'hi' : 'en';
      const updated: import('../types').GameSettings = { ...state.settings, language: newLang };
      saveToLocalStorage({ ...state, settings: updated });
      return { settings: updated };
    });
    audioManager.playClick();
  },

  toggleMute: () => {
    set((state) => {
      const isMuted = state.settings.soundVolume === 0 && state.settings.musicVolume === 0;
      const updated = {
        ...state.settings,
        soundVolume: isMuted ? 0.8 : 0,
        musicVolume: isMuted ? 0.45 : 0
      };
      audioManager.setMuted(!isMuted);
      saveToLocalStorage({ ...state, settings: updated });
      return { settings: updated };
    });
  },

  showNotification: (title: string, subtitle?: string) => {
    set({ notification: { title, subtitle, visible: true } });
    setTimeout(() => {
      set((state) =>
        state.notification?.title === title ? { notification: null } : state
      );
    }, 3200);
  },

  resetProgress: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      tokens: 40,
      score: 0,
      quests: INITIAL_QUESTS,
      inventory: [
        {
          id: 'mela-pass',
          name: 'Mela Welcome Pass',
          hindiName: 'मेला प्रवेश पत्र',
          category: 'badge',
          description: 'Your lucky golden ticket to the grand Dussehra Mela!',
          hindiDescription: 'विशाल दशहरा मेले का आपका शुभ प्रवेश पत्र!',
          icon: '🎫',
          count: 1
        }
      ],
      visitedStalls: [],
      finalePhase: 'idle'
    });
    get().showNotification('Progress reset', 'Started a fresh mela exploration');
  }
}));

function saveToLocalStorage(state: GameState) {
  try {
    const toSave = {
      tokens: state.tokens,
      score: state.score,
      quests: state.quests,
      inventory: state.inventory,
      visitedStalls: state.visitedStalls,
      settings: state.settings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed saving state to localStorage', e);
  }
}
