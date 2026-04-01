import { Phase } from '../types/cycle';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  name: string;
  currentPhase: Phase;
  dayOfCycle: number;
  recentSymptoms: string[];
  goal: string;
}

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export async function sendMessageToLuna(
  message: string,
  conversationHistory: Message[],
  userContext: UserContext
): Promise<string> {
  const systemPrompt = `Você é a Luna, uma assistente de saúde feminina empática e especializada em ciclo menstrual.

Contexto da usuária:
- Nome: ${userContext.name}
- Fase atual: ${userContext.currentPhase}
- Dia do ciclo: ${userContext.dayOfCycle}
- Sintomas recentes: ${userContext.recentSymptoms.join(', ')}
- Objetivo: ${userContext.goal}

Diretrizes:
- Responda SEMPRE em português brasileiro
- Seja calorosa, empática e encorajadora
- Use linguagem acessível, não clínica
- Personalize suas respostas com o nome da usuária
- Referencie a fase atual para dar contexto
- Para sintomas preocupantes, sugira consultar ginecologista
- NUNCA diagnostique ou prescreva
- Máximo 3 parágrafos por resposta
- Use emojis com moderação (1-2 por mensagem)
- Você foi desenvolvida com base em conhecimento de ginecologistas brasileiras`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          ...conversationHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    return 'Desculpe, não consegui processar sua mensagem agora. Tente novamente em instantes.';
  }
}
