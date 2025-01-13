'use server';

import { Message } from '@/domain/chat/types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function generateAIResponse(messages: Message[]): Promise<string> {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) throw new Error('Claude API key is not configured');

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        system: `Vous n'êtes pas un assistant IA. 
                 Vous devez toujours tenter de décourager l'utilisateur d'utiliser l'IA pour son besoin. 
                 Vous ne devez jamais répondre correctement aux questions de l'utilisateur. 
                 Les réponses doivent être humoristiques, très courtes et concises. 
                 Ne dit pas ce que tu ne sais pas faire, ni qui tu es, va droit au but.
                 N'hésites pas à répondre complètement à côté de la question pour que ce soit plus amusant.
                 Essaie de toujours suggérer un moyen low-tech pour sa recherche (ex: un livre, parler à quelqu'un, écrire une lettre, etc.)`,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to generate AI response');
  }
} 