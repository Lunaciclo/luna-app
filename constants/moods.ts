export interface Mood {
  id: string;
  label: string;
  emoji: string;
}

export const MOODS: Mood[] = [
  { id: 'calm', label: 'Calma', emoji: '😌' },
  { id: 'happy', label: 'Feliz', emoji: '😊' },
  { id: 'energetic', label: 'Energizada', emoji: '⚡' },
  { id: 'sensitive', label: 'Sensível', emoji: '🥺' },
  { id: 'irritated', label: 'Irritada', emoji: '😤' },
  { id: 'anxious', label: 'Ansiosa', emoji: '😰' },
  { id: 'sad', label: 'Triste', emoji: '😢' },
  { id: 'mood_swings', label: 'Oscilando', emoji: '🎢' },
  { id: 'low_energy', label: 'Sem energia', emoji: '🪫' },
  { id: 'confident', label: 'Confiante', emoji: '💪' },
  { id: 'creative', label: 'Criativa', emoji: '✨' },
  { id: 'introspective', label: 'Introspectiva', emoji: '🌙' },
  { id: 'overwhelmed', label: 'Sobrecarregada', emoji: '😵' },
  { id: 'grateful', label: 'Grata', emoji: '🙏' },
  { id: 'frisky', label: 'Animada', emoji: '😏' },
];
