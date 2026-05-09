import { useState, useCallback } from "react";
import ParticleCanvas from "./ParticleCanvas";
import QuoteCard from "./QuoteCard";
import FloatingKeywords from "./FloatingKeywords";
import { useChat } from "../context/ChatContext";

function extractKeywords(text) {
  const keywords = ["梦", "无意识", "童年", "焦虑", "防御", "压抑", "本能", "冲突", "俄狄浦斯", "移情", "口误", "生死", "重复", "症状", "治疗"];
  return keywords.filter((kw) => text.includes(kw));
}

export default function PortraitPanel() {
  const { state, dispatch } = useChat();
  const [isHovered, setIsHovered] = useState(false);
  const [customPortrait, setCustomPortrait] = useState(() => {
    try {
      return localStorage.getItem('freud_portrait') || '';
    } catch {
      return '';
    }
  });

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        localStorage.setItem('freud_portrait', dataUrl);
        setCustomPortrait(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleResetImage = useCallback(() => {
    localStorage.removeItem('freud_portrait');
    setCustomPortrait('');
  }, []);

  const lastUserMsg = [...state.messages].reverse().find((m) => m.role === "user");
  const currentKeywords = lastUserMsg ? extractKeywords(lastUserMsg.content) : [];

  const handleQuoteClick = useCallback(
    (quote) => {
      const event = new CustomEvent("insert-quote", { detail: quote });
      window.dispatchEvent(event);
    },
    []
  );

  return (
    <div className="hidden lg:flex w-full h-full relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #EDE5D0 0%, #E0D4B8 50%, #F5F0E8 100%)' }}
    >
      <ParticleCanvas />

      {/* Glow behind portrait */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(212, 180, 120, 0.2) 0%, rgba(212, 180, 120, 0.05) 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center h-full py-6 px-4 w-full">
        {/* Portrait card with keywords */}
        <div className="relative w-full flex-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Card container */}
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500"
            style={{
              border: `2px solid ${isHovered ? 'rgba(212, 180, 120, 0.5)' : 'rgba(212, 180, 120, 0.2)'}`,
              boxShadow: isHovered
                ? '0 12px 40px rgba(139, 115, 85, 0.2), inset 0 2px 8px rgba(255,255,255,0.3)'
                : '0 8px 24px rgba(139, 115, 85, 0.12), inset 0 2px 8px rgba(255,255,255,0.2)',
              transform: isHovered ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            {/* Portrait image */}
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${customPortrait || '/freud-portrait.jpg'})`,
                backgroundSize: 'auto 105%',
                backgroundPosition: '40% 18%',
                backgroundRepeat: 'no-repeat',
                filter: 'drop-shadow(0 4px 16px rgba(139, 115, 85, 0.15))',
              }}
            />

            {/* Floating keywords overlay */}
            <FloatingKeywords isVisible={isHovered} />

            {/* Upload button - visible on hover */}
            <div className={`absolute top-3 right-3 z-20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="portrait-upload" />
              <label htmlFor="portrait-upload" className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-text-main text-xs cursor-pointer hover:bg-white transition-colors shadow-sm border border-cream-300/40">
                更换图片
              </label>
            </div>

            {/* Reset button - visible on hover if custom image exists */}
            {customPortrait && (
              <div className={`absolute top-3 left-3 z-20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={handleResetImage} className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-text-main text-xs hover:bg-white transition-colors shadow-sm border border-cream-300/40">
                  恢复默认
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quote card - below portrait */}
        <div className="mt-4 w-full flex flex-col items-center px-2">
          <div className="flex gap-1.5 mb-2 self-start">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-cream-400/50" />
            ))}
          </div>
          <QuoteCard onQuoteClick={handleQuoteClick} recentKeywords={currentKeywords} />
        </div>

        {/* API config link */}
        <div className="mt-3">
          <button
            onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
            className="text-text-muted/40 hover:text-cream-500 transition-colors text-xs flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2V10M6 10L3 7M6 10L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            API 配置
          </button>
        </div>
      </div>
    </div>
  );
}
