import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Settings, Plus } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { dispatch, sendUserMessage, state } = useChat();

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || state.isLoading) return;
    setInput('');
    await sendUserMessage(trimmed);
  }, [input, state.isLoading, sendUserMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-cream-300/30 bg-cream-100/90 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch({ type: 'TOGGLE_BOTTOM_SHEET' })}
          className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-cream-600 shrink-0 hover:bg-cream-300 transition-colors"
        >
          <Plus size={18} />
        </motion.button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="在这里倾诉..."
            disabled={state.isLoading}
            className="w-full px-5 py-3 rounded-full bg-white/70 text-text-main text-[15px] placeholder:text-text-muted/50 focus:outline-none transition-all duration-300 disabled:opacity-60"
            style={{
              boxShadow: isFocused
                ? '0 0 0 2px rgba(184, 134, 11, 0.25), 0 4px 12px rgba(139, 115, 85, 0.08)'
                : '0 2px 8px rgba(139, 115, 85, 0.04)',
            }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || state.isLoading}
          className="w-10 h-10 rounded-full bg-cream-500 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-600 transition-colors"
        >
          <Send size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-cream-600 shrink-0 hover:bg-cream-300 transition-colors"
        >
          <Settings size={16} />
        </motion.button>
      </div>
    </div>
  );
}
