import { createHash, timingSafeEqual } from 'node:crypto';
import { generateAIResponse } from '@/app/actions/chat';

// Called once a day by Vercel Cron (see vercel.json). It runs a real chat request
// and, only if the model answers, pings the updown.io pulse URL. No ping within the
// pulse period makes updown alert. See "Monitoring" in the README.

export const dynamic = 'force-dynamic';

const PULSE_TIMEOUT_MS = 10_000;

const HEALTH_CHECK_MESSAGE = 'Hello, are you there?';

// Responses carry no detail: this endpoint is public once the secret leaks, and
// the model's text and the errors stay in the logs only.
const reply = (ok: boolean, status: number) => Response.json({ ok }, { status });

// Vercel sends `Authorization: Bearer ${CRON_SECRET}`. Hashing both sides gives
// equal-length buffers, so the comparison is constant-time whatever the input.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(
    digest(request.headers.get('authorization') ?? ''),
    digest(`Bearer ${secret}`),
  );
}

// Returns why the pulse could not be sent, or null once it was. The reason never
// quotes the error message: the pulse URL is a secret and some fetch errors contain it.
async function pingPulse(): Promise<string | null> {
  const url = process.env.UPDOWN_PULSE_URL;
  if (!url) return 'UPDOWN_PULSE_URL is not configured';

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(PULSE_TIMEOUT_MS) });
    return response.ok ? null : `the pulse endpoint answered ${response.status}`;
  } catch (error) {
    return `the pulse request failed (${error instanceof Error ? error.name : 'unknown error'})`;
  }
}

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  try {
    const answer = await generateAIResponse([{ role: 'user', content: HEALTH_CHECK_MESSAGE }]);
    if (answer.trim() === '') {
      console.error('Chat health check failed: the model returned an empty answer');
      return reply(false, 503);
    }
  } catch (error) {
    // generateAIResponse already logged the cause; its message is generic.
    console.error('Chat health check failed:', error instanceof Error ? error.message : error);
    return reply(false, 503);
  }

  const pulseFailure = await pingPulse();
  if (pulseFailure !== null) {
    console.error(`Chat health check: the chat answered but ${pulseFailure}`);
    return reply(false, 500);
  }

  return reply(true, 200);
}
