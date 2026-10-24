'use server';

import { Message } from '@/domain/chat/types';
import Anthropic from '@anthropic-ai/sdk';
import { getTranslations } from 'next-intl/server';

const CLAUDE_MODEL = 'claude-haiku-5-5';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Stop reasons after which the response is not an answer, even if it carries text.
const UNUSABLE_STOP_REASONS = ['refusal'];

// What claude-haiku-5-5 can send back is wider than what SDK 0.33.1 types:
// thinking blocks (it thinks by default) and the `refusal` stop reason.
interface ClaudeResponse {
    content: Array<{ type: string; text?: string }>;
    stop_reason: string | null;
    _request_id?: string | null;
}

// Concatenates every text block. Returns null when the response holds no usable
// text, after logging what came back so the next occurrence can be diagnosed.
function extractText(response: ClaudeResponse, context: string): string | null {
    const text = response.content
        .map(block => (block.type === 'text' ? block.text ?? '' : ''))
        .join('');

    if (text.trim() !== '' && !UNUSABLE_STOP_REASONS.includes(response.stop_reason ?? '')) {
        return text;
    }

    console.error(`Claude returned no usable text (${context}):`, {
        stop_reason: response.stop_reason,
        block_types: response.content.map(block => block.type),
        request_id: response._request_id ?? null,
    });
    return null;
}

// The model may wrap the JSON in a ```json fence or add a sentence around it.
function parseShareSummary(text: string): ShareSummary {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end < start) throw new Error('No JSON object in the response');

    const parsed = JSON.parse(text.slice(start, end + 1));
    for (const key of ['filename', 'title', 'text'] as const) {
        if (typeof parsed?.[key] !== 'string') throw new Error(`Missing "${key}" in the summary`);
    }
    return { filename: parsed.filename, title: parsed.title, text: parsed.text };
}

export async function generateAIResponse(messages: Message[]): Promise<string> {
    try {
        if (!process.env.CLAUDE_API_KEY) throw new Error('Claude API key is not configured');

        const t = await getTranslations('Prompts');
        const systemPrompt = t('system');

        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            system: systemPrompt,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            max_tokens: 1024,
        });

        const text = extractText(response, 'answer');
        if (text === null) throw new Error('Claude returned no usable text');
        return text;
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
            model: CLAUDE_MODEL,
            system: t('shareSummarySystem'),
            messages: msgs.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            max_tokens: 1024,
        });

        const jsonResponse = extractText(response, 'share summary');
        if (jsonResponse !== null) {
            const parsed = parseShareSummary(jsonResponse);
            summary = {
                filename: `puree-${parsed.filename}`,
                title: `puree.chat - ${parsed.title}`,
                text: `${parsed.text}\nhttps://puree.chat`,
            };
        }

    } catch (error) {
        console.error('Error generating share summary:', error);
    }

    return summary as ShareSummary;
} 