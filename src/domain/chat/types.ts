export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatInputProps = {
  onSubmit: (message: string) => void;
  isThinking: boolean;
};

export type ChatMessageProps = {
  message: Message;
  previousMessage?: Message;
};

export type ShareButtonProps = {
  userMessage: Message;
  assistantMessage: Message;
};