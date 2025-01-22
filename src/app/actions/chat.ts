'use server';

import { Message } from '@/domain/chat/types';
import Anthropic from '@anthropic-ai/sdk';
import { getTranslations } from 'next-intl/server';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function generateAIResponse(messages: Message[]): Promise<string> {
    try {
        if (!process.env.CLAUDE_API_KEY) throw new Error('Claude API key is not configured');

        const t = await getTranslations('Prompts');
        const systemPrompt = t('system');

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            system: systemPrompt,
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
    const t = await getTranslations('Prompts');

    const msgs: Message[] = [
        ...messages,
        {
            role: 'user',
            content: t('shareSummaryPrompt'),
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
            system: t('shareSummarySystem'),
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
            summary.text = `${summary.text}\nhttps://puree.chat`;
        }

    } catch (error) {
        console.error('Error generating share summary:', error);
    }

    return summary as ShareSummary;
} 