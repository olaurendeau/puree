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
};

export type ChatContainerProps = {
  messages: Message[];
  isThinking: boolean;
}; 