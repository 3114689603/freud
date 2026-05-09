import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

function TypewriterTitle({ text, speed = 80 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        setTimeout(() => setShowCursor(false), 600);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  useEffect(() => {
    if (done) return;
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, [done]);

  return (
    <span>
      {displayed}
      {!done && (
        <span
          className="inline-block w-[3px] h-[0.9em] bg-cream-500 ml-0.5 align-middle"
          style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
        />
      )}
    </span>
  );
}

export default function ChatPanel() {
  const { state, sendUserMessage } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isLoading]);

  const hasMessages = state.messages.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-cream-100 relative">
      {/* Header */}
      <div className="shrink-0 px-8 pt-8 pb-4">
        <h1 className="text-text-main text-[52px] font-serif font-bold tracking-[0.06em] leading-none uppercase">
          <TypewriterTitle text="SIGMUND FREUD" speed={60} />
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-text-muted text-[15px] font-serif italic tracking-wide">
            Founder of Psychoanalysis
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-online animate-pulse" />
            <span className="text-online text-[11px] font-medium tracking-wide">Online</span>
          </div>
        </div>
        <div className="mt-4 border-b border-cream-300/40" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-4 relative">
        {!hasMessages && (
          <div className="absolute inset-0 flex items-center justify-center px-8 py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-[640px]"
            >
              {/* Welcome card */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl pl-10 pr-8 py-7 shadow-sm border border-cream-300/30 border-l-[3px] border-l-cream-400">
                <p className="text-cream-500/40 text-[56px] font-serif leading-none mb-4 select-none">
                  &#8220;
                </p>
                <p className="text-text-main text-[17px] leading-relaxed italic">
                  Guten Tag。我是西格蒙德·弗洛伊德。请随意——在这里，没有什么是不能说的。每一个口误、每一个梦、每一种反复出现的模式，都可能是心灵在试图传达某些被压抑的真相。
                </p>
                <p className="text-cream-600 text-[14px] mt-5 font-medium font-serif">
                  What brings you here?
                </p>
              </div>

              {/* Quick topics */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="mt-6 grid grid-cols-3 gap-2.5"
              >
                {[
                  { label: '解析梦境', icon: '🌙' },
                  { label: '防御机制', icon: '🛡️' },
                  { label: '生死本能', icon: '⚡' },
                  { label: '童年固着', icon: '👶' },
                  { label: '重复模式', icon: '🔗' },
                ].map((topic) => (
                  <button
                    key={topic.label}
                    onClick={() => sendUserMessage(`我想聊聊${topic.label}...`)}
                    className="px-4 py-2.5 rounded-full bg-cream-200/60 border border-cream-300/40 text-text-main text-[13px] hover:bg-cream-300/60 hover:border-cream-400/50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-center"
                  >
                    {topic.icon} {topic.label}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        )}

        {state.messages.map((msg, idx) => (
          <MessageBubble key={msg.id} message={msg} index={idx} />
        ))}

        {state.isLoading && state.messages.length > 0 &&
          state.messages[state.messages.length - 1].role === 'user' && (
            <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Gradient fade above input */}
      <div className="shrink-0 h-10 pointer-events-none" style={{ background: 'linear-gradient(to top, #F5F0E8 0%, #F5F0E8 40%, transparent 100%)' }} />
      <ChatInput />
    </div>
  );
}
