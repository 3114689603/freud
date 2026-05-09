import { useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import ChatPanel from './components/ChatPanel';
import PortraitPanel from './components/PortraitPanel';
import ApiSettings from './components/ApiSettings';
import BottomSheet from './components/BottomSheet';

function AppContent() {
  const { state } = useChat();

  // Listen for quote insert events from PortraitPanel
  useEffect(() => {
    const handleInsertQuote = (e: Event) => {
      const quote = (e as CustomEvent<string>).detail;
      // Dispatch to ChatInput via a custom input event
      const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputEl) {
        const separator = inputEl.value && !inputEl.value.endsWith(' ') ? ' ' : '';
        inputEl.value = inputEl.value + separator + `"${quote}" `;
        inputEl.focus();
        // Trigger input event for React state sync
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    window.addEventListener('insert-quote', handleInsertQuote);
    return () => window.removeEventListener('insert-quote', handleInsertQuote);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-cream-100 overflow-hidden">
      <div className="w-[67%] h-full"><ChatPanel /></div>
      <div className="w-[33%] h-full hidden lg:block"><PortraitPanel /></div>
      <ApiSettings />
      <BottomSheet />
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
