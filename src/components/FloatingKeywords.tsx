import { motion } from 'framer-motion';

interface FloatingKeywordsProps {
  isVisible: boolean;
}

const keywords = [
  { text: '梦', x: '8%', y: '12%', delay: 0, duration: 5, yRange: [-10, 10], xRange: [-4, 4], rotate: [-2, 2] },
  { text: '无意识', x: '72%', y: '8%', delay: 0.5, duration: 6, yRange: [-8, 12], xRange: [-6, 6], rotate: [-3, 3] },
  { text: '压抑', x: '4%', y: '38%', delay: 1, duration: 4.5, yRange: [-6, 8], xRange: [-3, 5], rotate: [-1, 3] },
  { text: '本我', x: '78%', y: '35%', delay: 0.3, duration: 5.5, yRange: [-12, 6], xRange: [-5, 3], rotate: [-2, 4] },
  { text: '超我', x: '12%', y: '65%', delay: 0.8, duration: 6.5, yRange: [-8, 10], xRange: [-4, 6], rotate: [-3, 1] },
  { text: '防御', x: '70%', y: '62%', delay: 0.2, duration: 4, yRange: [-10, 8], xRange: [-6, 4], rotate: [-1, 2] },
  { text: '移情', x: '42%', y: '5%', delay: 1.2, duration: 5, yRange: [-6, 12], xRange: [-3, 3], rotate: [-2, 2] },
  { text: '重复', x: '48%', y: '78%', delay: 0.6, duration: 5.8, yRange: [-8, 8], xRange: [-5, 5], rotate: [-3, 3] },
];

export default function FloatingKeywords({ isVisible }: FloatingKeywordsProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-700"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {keywords.map((kw) => (
        <motion.div
          key={kw.text}
          className="absolute"
          style={{ left: kw.x, top: kw.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? [1, 1.06, 1] : 0.8,
            y: kw.yRange,
            x: kw.xRange,
            rotate: kw.rotate,
          }}
          transition={{
            opacity: { duration: 0.6, delay: kw.delay * 0.5 },
            scale: { duration: kw.duration, repeat: Infinity, ease: 'easeInOut', delay: kw.delay },
            y: { duration: kw.duration, repeat: Infinity, ease: 'easeInOut', delay: kw.delay },
            x: { duration: kw.duration * 0.8, repeat: Infinity, ease: 'easeInOut', delay: kw.delay },
            rotate: { duration: kw.duration * 1.2, repeat: Infinity, ease: 'easeInOut', delay: kw.delay },
          }}
        >
          <span
            className="inline-block px-3 py-1.5 text-[11px] font-serif tracking-wider text-cream-700 whitespace-nowrap"
            style={{
              background: 'rgba(255, 252, 245, 0.55)',
              border: '1px solid rgba(212, 180, 120, 0.35)',
              borderRadius: '12px',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(139, 115, 85, 0.06)',
            }}
          >
            {kw.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
