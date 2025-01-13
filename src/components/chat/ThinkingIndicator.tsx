export const ThinkingIndicator = () => {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
        <span className="text-sm">🤖</span>
      </div>
      <div className="flex gap-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}; 