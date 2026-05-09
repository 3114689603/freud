import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../context/ChatContext';

const quickTopics = [
  { icon: '🌙', label: '解析一个梦', prompt: '我最近做了一个梦，想请你帮我解析。梦里...' },
  { icon: '🛡️', label: '我的防御机制', prompt: '我想了解一下自己常用的防御机制。我最近注意到...' },
  { icon: '⚡', label: '谈谈生死本能', prompt: '我想深入理解生死本能的概念，以及它如何影响我的行为...' },
  { icon: '👶', label: '童年与固着', prompt: '我想探讨童年经历对我现在人格的影响...' },
  { icon: '😶‍🌫️', label: '压抑与阻抗', prompt: '我觉得自己可能在压抑某些东西，但不确定是什么...' },
  { icon: '🔗', label: '重复的模式', prompt: '我注意到自己在关系中不断重复某种模式...' },
];

export default function BottomSheet() {
  const { state, dispatch, sendUserMessage } = useChat();

  const handleTopicClick = async (prompt: string) => {
    dispatch({ type: 'SET_SHOW_BOTTOM_SHEET', payload: false });
    await sendUserMessage(prompt);
  };

  return (
    <AnimatePresence>
      {state.showBottomSheet && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => dispatch({ type: 'SET_SHOW_BOTTOM_SHEET', payload: false })}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-cream-100 rounded-t-2xl z-50 max-h-[60vh] overflow-auto lg:max-w-[45%] lg:min-w-[380px]"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-cream-300" />
            </div>
            <div className="px-4 py-3">
              <h3 className="text-text-muted text-sm mb-3 font-medium">快速话题</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickTopics.map((topic) => (
                  <motion.button
                    key={topic.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTopicClick(topic.prompt)}
                    className="flex items-center gap-2 px-3 py-3 bg-cream-200/60 hover:bg-cream-300/60 rounded-xl text-left transition-colors"
                  >
                    <span className="text-lg">{topic.icon}</span>
                    <span className="text-text-main text-sm">{topic.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
