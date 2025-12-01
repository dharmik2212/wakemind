export enum ChallengeType {
  MATH = 'MATH',
  AI_TYPING = 'AI_TYPING',
}

export enum SoundType {
  CLASSIC = 'CLASSIC',
  GENTLE = 'GENTLE',
  SIREN = 'SIREN',
  CUSTOM = 'CUSTOM',
}

export interface SoundSettings {
  type: SoundType;
  customData?: string; // Data URI for the file
  name?: string; // Filename for display
}

export interface Alarm {
  id: string;
  time: string; // Format "HH:mm" 24h
  label: string;
  enabled: boolean;
  challengeType: ChallengeType;
  days: number[]; // 0 = Sunday, 1 = Monday, etc. Empty = Once
  soundSettings: SoundSettings;
}

export interface MathChallengeData {
  question: string;
  answer: string;
}

export interface TypingChallengeData {
  phrase: string;
}

export const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];