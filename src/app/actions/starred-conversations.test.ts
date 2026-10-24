import { beforeEach, describe, expect, it, vi } from 'vitest';

// '@/db' throws on import when DATABASE_URL is not set, so it is always mocked.
vi.mock('@/db', () => ({ query: vi.fn() }));

import { query } from '@/db';
import {
  getStarredConversations,
  upvoteConversation,
} from './starred-conversations';

const mockQuery = vi.mocked(query);

const row = (id: number) => ({
  id,
  user_message: `question ${id}`,
  assistant_message: `answer ${id}`,
  upvotes: id * 10,
  created_at: new Date(`2025-01-0${id}T00:00:00Z`),
});

const rowsResult = (rows: ReturnType<typeof row>[]) =>
  ({ rows }) as unknown as Awaited<ReturnType<typeof query>>;

describe('getStarredConversations', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('queries with [language, pageSize + 1, page * pageSize]', async () => {
    mockQuery.mockResolvedValue(rowsResult([]));

    await getStarredConversations('fr', 2, 5);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][1]).toEqual(['fr', 6, 10]);
  });

  it('reports hasMore and drops the extra row when pageSize + 1 rows return', async () => {
    mockQuery.mockResolvedValue(rowsResult([row(1), row(2), row(3)]));

    const result = await getStarredConversations('en', 0, 2);

    expect(result.hasMore).toBe(true);
    expect(result.conversations.map((c) => c.id)).toEqual([1, 2]);
  });

  it('reports no more when exactly pageSize rows return', async () => {
    mockQuery.mockResolvedValue(rowsResult([row(1), row(2)]));

    const result = await getStarredConversations('en', 0, 2);

    expect(result.hasMore).toBe(false);
    expect(result.conversations).toHaveLength(2);
  });

  it('maps snake_case columns to camelCase fields', async () => {
    const first = row(1);
    mockQuery.mockResolvedValue(rowsResult([first]));

    const result = await getStarredConversations('en', 0, 5);

    expect(result.conversations).toEqual([
      {
        id: 1,
        userMessage: 'question 1',
        assistantMessage: 'answer 1',
        upvotes: 10,
        createdAt: first.created_at,
      },
    ]);
  });
});

describe('upvoteConversation', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('returns the upvotes it gets back', async () => {
    mockQuery.mockResolvedValue({
      rows: [{ upvotes: 7 }],
    } as unknown as Awaited<ReturnType<typeof query>>);

    await expect(upvoteConversation(42)).resolves.toBe(7);
    expect(mockQuery.mock.calls[0][1]).toEqual([42]);
  });
});
