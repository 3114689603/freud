import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { sendMessage, testConnection, loadSkillPrompt, type ChatMessage, type ApiConfig, type TestResult } from '../api/chat';

export interface Message extends ChatMessage {
  id: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  apiConfig: ApiConfig;
  showSettings: boolean;
  showBottomSheet: boolean;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; id: string; content: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_API_CONFIG'; payload: ApiConfig }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SHOW_SETTINGS'; payload: boolean }
  | { type: 'TOGGLE_BOTTOM_SHEET' }
  | { type: 'SET_SHOW_BOTTOM_SHEET'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' };

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadApiConfig(): ApiConfig {
  try {
    const saved = localStorage.getItem('freud_api_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return {
    apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-sonnet-4-6',
    temperature: 0.7,
  };
}

function saveApiConfig(config: ApiConfig) {
  localStorage.setItem('freud_api_config', JSON.stringify(config));
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.id ? { ...m, content: m.content + action.content } : m
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_API_CONFIG':
      saveApiConfig(action.payload);
      return { ...state, apiConfig: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'SET_SHOW_SETTINGS':
      return { ...state, showSettings: action.payload };
    case 'TOGGLE_BOTTOM_SHEET':
      return { ...state, showBottomSheet: !state.showBottomSheet };
    case 'SET_SHOW_BOTTOM_SHEET':
      return { ...state, showBottomSheet: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendUserMessage: (content: string) => Promise<void>;
  testApiConnection: () => Promise<TestResult>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isLoading: false,
    apiConfig: loadApiConfig(),
    showSettings: false,
    showBottomSheet: false,
  });

  useEffect(() => {
    loadSkillPrompt().catch(() => {});
  }, []);

  const sendUserMessage = useCallback(async (content: string) => {
    if (!state.apiConfig.apiKey) {
      dispatch({ type: 'SET_SHOW_SETTINGS', payload: true });
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

    try {
      const apiMessages: ChatMessage[] = [
        ...state.messages.filter(m => m.content.trim()).map(m => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content },
      ];

      let rawBuffer = '';
      let lastDispatchedLength = 0;
      let inThinkMode = false;

      for await (const chunk of sendMessage(apiMessages, state.apiConfig)) {
        rawBuffer += chunk;

        while (true) {
          if (!inThinkMode) {
            const thinkStart = rawBuffer.indexOf('<think>', lastDispatchedLength);
            if (thinkStart === -1) break;
            if (thinkStart > lastDispatchedLength) {
              const visible = rawBuffer.slice(lastDispatchedLength, thinkStart);
              dispatch({ type: 'UPDATE_MESSAGE', id: assistantMessage.id, content: visible });
            }
            lastDispatchedLength = thinkStart;
            inThinkMode = true;
          } else {
            const thinkEnd = rawBuffer.indexOf('</think>', lastDispatchedLength);
            if (thinkEnd === -1) break;
            lastDispatchedLength = thinkEnd + 8;
            inThinkMode = false;
          }
        }

        if (!inThinkMode && rawBuffer.length > lastDispatchedLength) {
          const visible = rawBuffer.slice(lastDispatchedLength);
          dispatch({ type: 'UPDATE_MESSAGE', id: assistantMessage.id, content: visible });
          lastDispatchedLength = rawBuffer.length;
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      dispatch({
        type: 'UPDATE_MESSAGE',
        id: assistantMessage.id,
        content: `\n\n[连接错误：${errorMsg}]`,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.apiConfig, state.messages]);

  const testApiConnection = useCallback(async () => {
    return testConnection(state.apiConfig);
  }, [state.apiConfig]);

  return (
    <ChatContext.Provider value={{ state, dispatch, sendUserMessage, testApiConnection }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
