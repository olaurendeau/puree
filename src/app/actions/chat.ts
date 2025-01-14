'use server';

import { Message } from '@/domain/chat/types';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function generateAIResponse(messages: Message[]): Promise<string> {
    try {
        if (!process.env.CLAUDE_API_KEY) throw new Error('Claude API key is not configured');

        const response = await anthropic.messages.create({
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
        });

        return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw new Error('Failed to generate AI response');
    }
}

interface ShareSummary {
    filename: string;
    title: string;
    text: string;
}

export async function generateShareSummary(messages: Message[]): Promise<ShareSummary> {

    const msgs: Message[] = [
        ...messages,
        {
            role: 'user',
            content: 'Résume cette conversation en un titre court et un texte de synthèse',
        }
    ];

    let summary: ShareSummary = {
        filename: 'puree-conversation',
        title: 'Conversation purée',
        text: 'Une conversation avec purée',
      };
    try {
        if (!process.env.CLAUDE_API_KEY) throw new Error('Claude API key is not configured');

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            system: `Vous devez générer un titre court et accrocheur ainsi qu'un texte de synthèse pour partager cet échange.
                    Le nom du fichier doit être court (max 30 caractères) et le titre doit être court (max 50 caractères) 
                    et le texte doit être une synthèse concise (max 100 caractères).
                    Répondez uniquement avec un objet JSON contenant trois propriétés :
                    - filename: le nom du fichier à générer
                    - title: le titre de l'échange
                    - text: le texte de synthèse`,
            messages: msgs.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            max_tokens: 1024,
            temperature: 0.7,
        });


        const jsonResponse = response.content[0]?.type === 'text' ? response.content[0].text : null;
        if (jsonResponse) {
            summary = JSON.parse(jsonResponse);
            summary.filename = `puree-${summary.filename}`;
            summary.title = `puree.chat - ${summary.title}`;
            summary.text = `${summary.text}\n Généré par puree.chat`;
        }

    } catch (error) {
        console.error('Error generating share summary:', error);
    }

    return summary as ShareSummary;
} 