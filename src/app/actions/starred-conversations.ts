'use server';

import { query } from '@/db';
import { Message } from '@/domain/chat/types';

export type StarredConversation = {
  id: number;
  userMessage: string;
  assistantMessage: string;
  upvotes: number;
  createdAt: Date;
};

type DbStarredConversation = {
  id: number;
  user_message: string;
  assistant_message: string;
  upvotes: number;
  created_at: Date;
};

export type PaginatedStarredConversations = {
  conversations: StarredConversation[];
  hasMore: boolean;
};

export async function upvoteConversation(id: number): Promise<number> {
  const result = await query(
    `UPDATE starred_conversations 
     SET upvotes = upvotes + 1 
     WHERE id = $1 
     RETURNING upvotes`,
    [id]
  );
  return result.rows[0].upvotes;
}

export async function getStarredConversations(language: string, page: number = 0, pageSize: number = 5): Promise<PaginatedStarredConversations> {
  const offset = page * pageSize;
  
  const result = await query(
    `SELECT id, user_message, assistant_message, upvotes, created_at 
     FROM starred_conversations 
     WHERE language = $1 AND is_starred = true 
     ORDER BY upvotes DESC, created_at DESC
     LIMIT $2 OFFSET $3`,
    [language, pageSize + 1, offset] // On demande un élément de plus pour savoir s'il y en a d'autres
  );

  const hasMore = result.rows.length > pageSize;
  const conversations = result.rows.slice(0, pageSize).map((row: DbStarredConversation) => ({
    id: row.id,
    userMessage: row.user_message,
    assistantMessage: row.assistant_message,
    upvotes: row.upvotes,
    createdAt: row.created_at
  }));

  return {
    conversations,
    hasMore
  };
}

export async function isConversationStarred(language: string, userMessage: Message, assistantMessage: Message): Promise<boolean> {
  const result = await query(
    'SELECT EXISTS(SELECT 1 FROM starred_conversations WHERE language = $1 AND user_message = $2 AND assistant_message = $3 AND is_starred = true)',
    [language, userMessage.content, assistantMessage.content]
  );
  return result.rows[0].exists;
}

export async function toggleStarredConversation(language: string, userMessage: Message, assistantMessage: Message): Promise<{id: number|null, isStarred: boolean}> {
  const isStarred = await isConversationStarred(language, userMessage, assistantMessage);
  let id = null;

  if (isStarred) {
    const result = await query(
      'UPDATE starred_conversations SET is_starred = false WHERE user_message = $1 AND assistant_message = $2 RETURNING id',
      [userMessage.content, assistantMessage.content]
    );
    id = result.rows[0].id;
  } else {
    const result = await query(
      `INSERT INTO starred_conversations (language, user_message, assistant_message, is_starred, upvotes) 
      VALUES ($1, $2, $3, true, 1) 
      ON CONFLICT (language, user_message, assistant_message) 
      DO UPDATE SET is_starred = true
      RETURNING id`,
      [language, userMessage.content, assistantMessage.content]
    );
    id = result.rows[0].id;
  }

  return {
    id,
    isStarred: !isStarred
  }
} 
