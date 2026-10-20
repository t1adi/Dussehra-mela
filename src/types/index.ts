export type Language = 'en' | 'hi';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface StallInfo {
  id: string;
  name: string;
  hindiName: string;
  tagline: string;
  hindiTagline: string;
  position: [number, number, number];
  rotationY?: number;
  icon: string;
  color: string;
  actionLabel: string;
  hindiActionLabel: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  hindiName: string;
  category: 'snack' | 'toy' | 'souvenir' | 'badge';
  description: string;
  hindiDescription: string;
  icon: string;
  count: number;
}

export interface Quest {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  completed: boolean;
  rewardTokens: number;
  icon: string;
}

export type ModalType = 
  | null
  | 'balloon-pop'
  | 'ring-toss'
  | 'food-stall'
  | 'toy-stall'
  | 'souvenir-stall'
  | 'ram-leela'
  | 'ferris-wheel'
  | 'ferris-wheel-ride'
  | 'finale'
  | 'finale-cinematic'
  | 'inventory'
  | 'settings'
  | 'tutorial'
  | 'celebration';

export type FinalePhase = 'idle' | 'countdown' | 'arrow' | 'burn' | 'celebrate' | 'completed';

export interface GameSettings {
  graphicsQuality: GraphicsQuality;
  soundVolume: number;
  musicVolume: number;
  ambienceVolume: number;
  cameraSensitivity: number;
  language: Language;
}

export interface FoodItem {
  id: string;
  name: string;
  hindiName: string;
  price: number;
  description: string;
  hindiDescription: string;
  dialogue: string;
  hindiDialogue: string;
  icon: string;
  tasteReaction: string;
  hindiTasteReaction: string;
}

export interface ToyItem {
  id: string;
  name: string;
  hindiName: string;
  price: number;
  description: string;
  hindiDescription: string;
  icon: string;
  interactiveType: 'lattu' | 'kathputli' | 'phirki' | 'dholak' | 'bow';
}
