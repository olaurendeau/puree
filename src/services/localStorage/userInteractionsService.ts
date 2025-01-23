const UPVOTED_CONVERSATIONS_KEY = 'upvotedConversations';

export const userInteractionsService = {
  hasUpvotedConversation: (conversationId: number): boolean => {
    const upvotedConversations = JSON.parse(localStorage.getItem(UPVOTED_CONVERSATIONS_KEY) || '[]');
    return upvotedConversations.includes(conversationId);
  },

  markConversationAsUpvoted: (conversationId: number): void => {
    const upvotedConversations = JSON.parse(localStorage.getItem(UPVOTED_CONVERSATIONS_KEY) || '[]');
    if (!upvotedConversations.includes(conversationId)) {
      upvotedConversations.push(conversationId);
      localStorage.setItem(UPVOTED_CONVERSATIONS_KEY, JSON.stringify(upvotedConversations));
    }
  }
}; 