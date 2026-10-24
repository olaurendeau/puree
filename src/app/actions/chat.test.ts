import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create };
  },
}));

// The mocked translator returns the key, so prompts are easy to recognise.
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

import { generateAIResponse, generateShareSummary } from './chat';

const messages = [{ role: 'user' as const, content: 'Comment faire une omelette ?' }];

const text = (value: string) => ({ type: 'text', text: value });
const thinking = () => ({ type: 'thinking', thinking: '', signature: 'sig' });

const reply = (
  content: unknown[],
  stop_reason = 'end_turn',
  _request_id = 'req_123',
) => ({ content, stop_reason, _request_id });

describe('chat actions', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    create.mockReset();
    vi.stubEnv('CLAUDE_API_KEY', 'test-key');
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    consoleError.mockRestore();
  });

  describe('generateAIResponse', () => {
    it('returns the text that follows a thinking block', async () => {
      create.mockResolvedValue(reply([thinking(), text('Battez les oeufs.')]));

      await expect(generateAIResponse(messages)).resolves.toBe('Battez les oeufs.');
    });

    it('joins every text block', async () => {
      create.mockResolvedValue(
        reply([thinking(), text('Battez les oeufs.'), text(' Salez.')]),
      );

      await expect(generateAIResponse(messages)).resolves.toBe('Battez les oeufs. Salez.');
    });

    it('keeps the text of a truncated answer', async () => {
      create.mockResolvedValue(reply([text('Battez les')], 'max_tokens'));

      await expect(generateAIResponse(messages)).resolves.toBe('Battez les');
    });

    it('throws, and logs stop_reason, block types and request id, when only thinking comes back', async () => {
      create.mockResolvedValue(reply([thinking()], 'max_tokens', 'req_abc'));

      await expect(generateAIResponse(messages)).rejects.toThrow('Failed to generate AI response');

      expect(consoleError).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          stop_reason: 'max_tokens',
          block_types: ['thinking'],
          request_id: 'req_abc',
        }),
      );
    });

    it('throws when the content is empty', async () => {
      create.mockResolvedValue(reply([], 'end_turn'));

      await expect(generateAIResponse(messages)).rejects.toThrow('Failed to generate AI response');
    });

    it('throws on a refusal, even when it carries text', async () => {
      create.mockResolvedValue(reply([text('I cannot help with that.')], 'refusal'));

      await expect(generateAIResponse(messages)).rejects.toThrow('Failed to generate AI response');
      expect(consoleError).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ stop_reason: 'refusal', block_types: ['text'] }),
      );
    });
  });

  describe('request parameters', () => {
    const summary = JSON.stringify({ filename: 'f', title: 't', text: 'x' });

    it.each([
      ['generateAIResponse', () => generateAIResponse(messages), 'ok'],
      ['generateShareSummary', () => generateShareSummary(messages), summary],
    ])('%s disables thinking and sends no sampling parameter', async (_name, call, body) => {
      create.mockResolvedValue(reply([text(body)]));

      await call();

      expect(create).toHaveBeenCalledTimes(1);
      const params = create.mock.calls[0][0];
      expect(params.thinking).toEqual({ type: 'disabled' });
      expect(params.max_tokens).toBe(1024);
      expect(params).not.toHaveProperty('temperature');
      expect(params).not.toHaveProperty('top_p');
      expect(params).not.toHaveProperty('top_k');
    });
  });

  describe('generateShareSummary', () => {
    const summary = { filename: 'omelette', title: 'Omelette', text: 'Une omelette' };
    const expected = {
      filename: 'puree-omelette',
      title: 'puree.chat - Omelette',
      text: 'Une omelette\nhttps://puree.chat',
    };
    const fallback = {
      filename: 'puree-conversation',
      title: 'Conversation purée',
      text: 'Une conversation avec purée',
    };

    it('parses plain JSON', async () => {
      create.mockResolvedValue(reply([text(JSON.stringify(summary))]));

      await expect(generateShareSummary(messages)).resolves.toEqual(expected);
    });

    it('parses JSON wrapped in a ```json fence, after a thinking block', async () => {
      create.mockResolvedValue(
        reply([thinking(), text('```json\n' + JSON.stringify(summary) + '\n```')]),
      );

      await expect(generateShareSummary(messages)).resolves.toEqual(expected);
    });

    it('parses JSON surrounded by prose', async () => {
      create.mockResolvedValue(
        reply([text('Voici le résumé :\n' + JSON.stringify(summary) + '\nBonne journée.')]),
      );

      await expect(generateShareSummary(messages)).resolves.toEqual(expected);
    });

    it('returns the default summary and logs why when the answer is not JSON', async () => {
      create.mockResolvedValue(reply([text('Désolé, je ne peux pas.')], 'end_turn', 'req_xyz'));

      await expect(generateShareSummary(messages)).resolves.toEqual(fallback);
      expect(consoleError).toHaveBeenCalledTimes(1);
    });

    it('returns the default summary and logs the response shape when no text comes back', async () => {
      create.mockResolvedValue(reply([thinking()], 'max_tokens', 'req_abc'));

      await expect(generateShareSummary(messages)).resolves.toEqual(fallback);
      expect(consoleError).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          stop_reason: 'max_tokens',
          block_types: ['thinking'],
          request_id: 'req_abc',
        }),
      );
    });

    it('returns the default summary when the JSON lacks the expected fields', async () => {
      create.mockResolvedValue(reply([text('{"foo": 1}')]));

      await expect(generateShareSummary(messages)).resolves.toEqual(fallback);
      expect(consoleError).toHaveBeenCalledTimes(1);
    });
  });
});
