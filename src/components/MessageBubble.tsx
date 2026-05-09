import { motion } from 'framer-motion';
import type { Message } from '../context/ChatContext';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
        delay: index * 0.03,
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-2`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-cream-300 flex items-center justify-center text-xs mr-2 shrink-0 self-end">🎅</div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? 'bg-user-bubble text-text-main rounded-2xl rounded-br-sm shadow-sm'
            : 'bg-freud-bubble text-text-main rounded-2xl rounded-tl-sm'
        }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {message.content || ' '}
      </div>
    </motion.div>
  );
}
