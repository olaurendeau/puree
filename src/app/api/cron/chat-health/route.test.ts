import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { generateAIResponse } = vi.hoisted(() => ({ generateAIResponse: vi.fn() }));

vi.mock('@/app/actions/chat', () => ({ generateAIResponse }));

import { GET } from './route';

const SECRET = 'a-cron-secret-of-16+chars';
const PULSE_URL = 'https://pulse.updown.io/abcd/EFGHIJKL';
const MODEL_TEXT = 'Ask your neighbour instead, SECRET-MODEL-TEXT.';
const ERROR_MESSAGE = 'SECRET-ERROR-DETAILS: upstream said no';

const call = (authorization?: string) =>
  GET(
    new Request('https://puree.chat/api/cron/chat-health', {
      headers: authorization === undefined ? {} : { authorization },
    }),
  );

describe('GET /api/cron/chat-health', () => {
  const fetchMock = vi.fn();
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    generateAIResponse.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('CRON_SECRET', SECRET);
    vi.stubEnv('UPDOWN_PULSE_URL', PULSE_URL);
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    generateAIResponse.mockResolvedValue(MODEL_TEXT);
    fetchMock.mockResolvedValue(new Response('OK: some-request-id'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    consoleError.mockRestore();
  });

  const expectNothingCalled = () => {
    expect(generateAIResponse).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  };

  describe('authorization', () => {
    it('returns 401 without an Authorization header', async () => {
      const response = await call();

      expect(response.status).toBe(401);
      expectNothingCalled();
    });

    it.each([
      ['a wrong secret', 'Bearer not-the-secret'],
      ['the secret without the Bearer scheme', SECRET],
      ['another scheme', `Basic ${SECRET}`],
      ['a secret that only starts like the right one', `Bearer ${SECRET}x`],
      ['a secret that is a prefix of the right one', `Bearer ${SECRET.slice(0, -1)}`],
    ])('returns 401 with %s', async (_label, header) => {
      const response = await call(header);

      expect(response.status).toBe(401);
      expectNothingCalled();
    });

    it.each([
      ['Bearer undefined', 'Bearer undefined'],
      ['an empty Bearer', 'Bearer '],
      ['Bearer without a space', 'Bearer'],
      ['an empty header', ''],
    ])('returns 401 when CRON_SECRET is unset and the header is %s', async (_label, header) => {
      vi.stubEnv('CRON_SECRET', undefined);

      const response = await call(header);

      expect(response.status).toBe(401);
      expectNothingCalled();
    });

    it('returns 401 when CRON_SECRET is empty, even with an empty Bearer', async () => {
      vi.stubEnv('CRON_SECRET', '');

      const response = await call('Bearer ');

      expect(response.status).toBe(401);
      expectNothingCalled();
    });
  });

  describe('when the chat answers', () => {
    it('asks the model one fixed user message through generateAIResponse', async () => {
      await call(`Bearer ${SECRET}`);

      expect(generateAIResponse).toHaveBeenCalledTimes(1);
      const [messages] = generateAIResponse.mock.calls[0];
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content.trim()).not.toBe('');
    });

    it('pings the pulse URL once and returns 200 { ok: true }', async () => {
      const response = await call(`Bearer ${SECRET}`);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe(PULSE_URL);
    });

    it('gives the pulse request a timeout', async () => {
      await call(`Bearer ${SECRET}`);

      expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('when the chat does not answer', () => {
    it.each([
      ['an empty string', ''],
      ['whitespace', ' \n\t  '],
    ])('does not ping and returns 503 for %s', async (_label, answer) => {
      generateAIResponse.mockResolvedValue(answer);

      const response = await call(`Bearer ${SECRET}`);

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({ ok: false });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });

    it('does not ping and returns 503 when generateAIResponse throws', async () => {
      generateAIResponse.mockRejectedValue(new Error(ERROR_MESSAGE));

      const response = await call(`Bearer ${SECRET}`);

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({ ok: false });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });
  });

  describe('when monitoring itself is broken', () => {
    it('returns 500 when UPDOWN_PULSE_URL is unset', async () => {
      vi.stubEnv('UPDOWN_PULSE_URL', undefined);

      const response = await call(`Bearer ${SECRET}`);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ ok: false });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });

    it('returns 500 when the pulse request rejects', async () => {
      fetchMock.mockRejectedValue(new Error(ERROR_MESSAGE));

      const response = await call(`Bearer ${SECRET}`);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ ok: false });
      expect(consoleError).toHaveBeenCalled();
    });

    it('returns 500 when the pulse endpoint answers with an error status', async () => {
      fetchMock.mockResolvedValue(new Response('nope', { status: 404 }));

      const response = await call(`Bearer ${SECRET}`);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ ok: false });
      expect(consoleError).toHaveBeenCalled();
    });
  });

  describe('response bodies and logs', () => {
    it('never contain the model text, the error message, the secret or the pulse URL', async () => {
      const bodies: string[] = [];
      const collect = async (response: Response) => bodies.push(await response.text());

      await collect(await call(`Bearer ${SECRET}`)); // success

      generateAIResponse.mockRejectedValue(new Error(ERROR_MESSAGE));
      await collect(await call(`Bearer ${SECRET}`)); // model throws

      generateAIResponse.mockResolvedValue(MODEL_TEXT);
      fetchMock.mockRejectedValue(new Error(ERROR_MESSAGE));
      await collect(await call(`Bearer ${SECRET}`)); // pulse fails

      vi.stubEnv('UPDOWN_PULSE_URL', undefined);
      await collect(await call(`Bearer ${SECRET}`)); // pulse not configured

      await collect(await call('Bearer wrong')); // unauthorized

      expect(bodies).toHaveLength(5);
      for (const body of bodies) {
        expect(body).not.toContain('SECRET-MODEL-TEXT');
        expect(body).not.toContain('SECRET-ERROR-DETAILS');
        expect(body).not.toContain(SECRET);
        expect(body).not.toContain(PULSE_URL);
      }
    });

    it('do not leak the secret or the pulse URL into the logs', async () => {
      generateAIResponse.mockRejectedValue(new Error(ERROR_MESSAGE));
      await call(`Bearer ${SECRET}`);
      generateAIResponse.mockResolvedValue(MODEL_TEXT);
      fetchMock.mockRejectedValue(new Error(`failed to reach ${PULSE_URL}`));
      await call(`Bearer ${SECRET}`);

      const logged = JSON.stringify(consoleError.mock.calls);
      expect(logged).not.toContain(SECRET);
      expect(logged).not.toContain('EFGHIJKL');
    });
  });
});
