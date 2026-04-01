export interface Symptom {
  id: string;
  label: string;
  emoji: string;
}

export const SYMPTOMS: Record<string, Symptom[]> = {
  menstrual_only: [
    { id: 'flow_light', label: 'Fluxo leve', emoji: '🩸' },
    { id: 'flow_medium', label: 'Fluxo médio', emoji: '🩸🩸' },
    { id: 'flow_heavy', label: 'Fluxo intenso', emoji: '🩸🩸🩸' },
    { id: 'flow_clots', label: 'Com coágulos', emoji: '⚠️' },
  ],
  always: [
    { id: 'cramps', label: 'Cólicas', emoji: '😣' },
    { id: 'headache', label: 'Dor de cabeça', emoji: '🤕' },
    { id: 'bloating', label: 'Inchaço', emoji: '🎈' },
    { id: 'breast_tenderness', label: 'Dor nos seios', emoji: '💔' },
    { id: 'acne', label: 'Acne', emoji: '😶' },
    { id: 'backache', label: 'Dor nas costas', emoji: '🪑' },
    { id: 'fatigue', label: 'Cansaço', emoji: '😴' },
    { id: 'nausea', label: 'Enjoo', emoji: '🤢' },
    { id: 'discharge', label: 'Corrimento', emoji: '💧' },
    { id: 'sex_drive_high', label: 'Libido alta', emoji: '🔥' },
    { id: 'sex_drive_low', label: 'Libido baixa', emoji: '❄️' },
  ],
};
