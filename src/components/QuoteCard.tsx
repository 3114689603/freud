import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Quote {
  text: string;
  source: string;
  tags: string[];
}

const quotes: Quote[] = [
  { text: '梦是通往无意识的康庄大道。', source: '《梦的解析》，1900', tags: ['梦', '无意识'] },
  { text: '认为自己完全掌控自身行为的人，生活在最大的幻觉之中。', source: '《精神分析引论》，1917', tags: ['无意识', '自我'] },
  { text: '每一个孩子都会在某个阶段成为俄狄浦斯——这是我们无法逃避的命运。', source: '《性学三论》，1905', tags: ['童年', '俄狄浦斯'] },
  { text: '焦虑是自我发出的危险信号——它在警告我们，某种不可接受的冲动即将闯入意识。', source: '《抑制、症状与焦虑》，1926', tags: ['焦虑', '防御机制'] },
  { text: '人并非追求快乐，而是追求快乐原则的满足——即避免不快乐和获得快乐的平衡。', source: '《超越快乐原则》，1920', tags: ['本能', '快乐'] },
  { text: '口误不是偶然——它们是被压抑愿望的精确表达。', source: '《日常生活精神病理学》，1901', tags: ['口误', '压抑'] },
  { text: '文明建立在压抑本能的基础之上，而压抑的代价就是普遍的不幸福感。', source: '《文明及其不满》，1930', tags: ['文明', '本能'] },
  { text: '移情不是治疗中的障碍——它正是治疗得以展开的土壤。', source: '临床笔记', tags: ['移情', '治疗'] },
  { text: '我们称那些被压抑的东西为无意识——但它们从未真正消失，只是等待被唤回。', source: '《精神分析引论》，1917', tags: ['压抑', '无意识'] },
  { text: '生死本能的永恒冲突，构成了人类存在最深层的动力学。', source: '《超越快乐原则》，1920', tags: ['生死本能', '冲突'] },
  { text: '防御机制是自我的精妙创造——它们保护我们免于焦虑，却也同时塑造了我们的症状。', source: '《防御性神经精神症》，1894', tags: ['防御机制', '自我'] },
  { text: '分析的过程不是揭示真理——而是让患者准备好去接受他自己发现的真理。', source: '临床笔记', tags: ['分析', '真理'] },
];

interface QuoteCardProps {
  onQuoteClick?: (text: string) => void;
  recentKeywords?: string[];
}

function useTypewriter(text: string, speed: number = 40, startDelay: number = 0) {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    indexRef.current = 0;

    const startTimer = setTimeout(() => {
      setIsTyping(true);
      const timer = setInterval(() => {
        indexRef.current++;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length) {
          clearInterval(timer);
          setIsTyping(false);
          setIsDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
    };
  }, [text, speed, startDelay]);

  return { displayed, isTyping, isDone };
}

export default function QuoteCard({ onQuoteClick, recentKeywords = [] }: QuoteCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [key, setKey] = useState(0); // Force re-render for typewriter

  const findBestQuote = useCallback(() => {
    if (recentKeywords.length === 0) return Math.floor(Math.random() * quotes.length);
    let bestIndex = 0;
    let bestScore = -1;
    quotes.forEach((quote, idx) => {
      const score = recentKeywords.reduce((acc, kw) => {
        return acc + quote.tags.filter(tag => tag.includes(kw) || kw.includes(tag)).length;
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    });
    return bestScore > 0 ? bestIndex : Math.floor(Math.random() * quotes.length);
  }, [recentKeywords]);

  const currentQuote = quotes[currentIndex];
  const { displayed, isDone } = useTypewriter(currentQuote.text, 45, 300);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = findBestQuote();
        if (next !== prev) {
          setKey((k) => k + 1);
          return next;
        }
        // If same, pick random different one
        let rand = Math.floor(Math.random() * quotes.length);
        while (rand === prev) {
          rand = Math.floor(Math.random() * quotes.length);
        }
        setKey((k) => k + 1);
        return rand;
      });
    }, 10000); // 10s including typing time

    return () => clearInterval(interval);
  }, [isHovered, findBestQuote]);

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuoteClick?.(currentQuote.text)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: isHovered ? -4 : 0, scale: isHovered ? 1.01 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative bg-white/40 backdrop-blur-sm border rounded-2xl px-5 py-4 w-full"
          style={{
            borderColor: isHovered ? 'rgba(212, 180, 120, 0.5)' : 'rgba(212, 180, 120, 0.25)',
            boxShadow: isHovered
              ? '0 8px 32px rgba(184, 134, 11, 0.12), 0 2px 8px rgba(0,0,0,0.04)'
              : '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <p className="text-text-main text-[14px] leading-relaxed italic font-serif min-h-[1.5em]">
            {displayed}
            {isDone && (
              <span className="inline-block w-[2px] h-[0.9em] bg-cream-400/60 ml-0.5 align-middle animate-pulse" />
            )}
          </p>

          <AnimatePresence>
            {isHovered && isDone && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="text-text-muted text-[11px] mt-2 pt-2 border-t border-cream-300/30"
              >
                ——{currentQuote.source}
              </motion.p>
            )}
          </AnimatePresence>

          {isHovered && isDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-cream-500 whitespace-nowrap"
            >
              点击引用到对话
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
