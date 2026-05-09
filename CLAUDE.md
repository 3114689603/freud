# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

You are a senior frontend web designer with expertise in:

- **Typography**: Grid systems, visual hierarchy, and whitespace techniques for clear information architecture
- **Layout**: Flexbox and CSS Grid for responsive, modular page structures
- **Color**: Color psychology and building harmonious, professional palettes
- **Interaction**: CSS animations and native JavaScript interactions with strong UX intuition

Design requirements when modifying this project:
1. Clear code structure with semantic HTML5 elements
2. Modern CSS (Tailwind v4 or native CSS3) for refined styling
3. Responsive design for desktop and mobile
4. Smooth, intuitive animations
5. Accessibility and performance considerations

## Project Overview

An interactive chat webapp themed around Sigmund Freud / psychoanalysis. Users chat with a Freud persona powered by Claude API (or any OpenAI-compatible API). The UI is magazine-style with a cream/beige color palette, featuring a left chat panel (67%) and right portrait panel (33%).

## Common Commands

```bash
# Development server (Vite)
npm run dev

# Production build (tsc + vite build)
npm run build

# Lint (ESLint)
npm run lint

# Preview production build
npm run preview
```

No test suite exists in this project.

## Technology Stack

- **Build**: Vite 8 + React 19 + TypeScript 6
- **Styling**: Tailwind CSS v4 (uses `@theme` directive in `src/index.css` — no `tailwind.config.js`)
- **Animation**: Framer Motion
- **Icons**: lucide-react
- **API**: Native `fetch` with SSE streaming (no SDK dependency)

## Architecture

### Layout (`src/App.tsx`)

Fixed 67%/33% split: left `ChatPanel`, right `PortraitPanel` (hidden below `lg` breakpoint). Both `ApiSettings` and `BottomSheet` are global overlays rendered as siblings.

### State Management (`src/context/ChatContext.tsx`)

Single React Context + `useReducer`. State includes: messages array, isLoading, apiConfig, showSettings, showBottomSheet. API config is auto-persisted to `localStorage` under key `freud_api_config`.

Key actions: `ADD_MESSAGE`, `UPDATE_MESSAGE` (for streaming chunks), `SET_LOADING`, `SET_API_CONFIG`, `TOGGLE_SETTINGS`, `TOGGLE_BOTTOM_SHEET`, `CLEAR_MESSAGES`.

`sendUserMessage()` is the primary flow: adds user message → adds empty assistant message → streams API response via `UPDATE_MESSAGE` chunks.

### API Layer (`src/api/chat.ts`)

`sendMessage(messages, config)` returns an `AsyncGenerator<string>` yielding text chunks.

Protocol auto-detection via `isAnthropicProtocol(baseUrl, model)`: checks if URL or model name contains "anthropic" or "claude". Anthropic protocol uses `/messages` endpoint with `x-api-key` header; OpenAI-compatible uses `/chat/completions` with `Authorization: Bearer` header. Both use SSE streaming.

`testConnection(config)` sends a minimal non-streaming request to validate the API key.

### Cross-Component Communication

QuoteCard → ChatInput uses `window.dispatchEvent(new CustomEvent("insert-quote", { detail: quote }))`. `App.tsx` listens and directly mutates the DOM input element, then fires a synthetic `input` event to sync React state. This is intentional to avoid prop drilling through the component tree.

### Tailwind v4 Theme (`src/index.css`)

Custom colors defined via `@theme` block:
- `cream-50` through `cream-700` — beige palette
- `text-main` (#3D3D3D), `text-muted` (#8B8175)
- `user-bubble` (white), `freud-bubble` (#F0E6D3)

No separate `tailwind.config.js` exists.

### TypeScript Configuration

`tsconfig.app.json` is intentionally relaxed for rapid prototyping: `strict: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `verbatimModuleSyntax: false`. Do not tighten these without confirming with the user first.

## Key Implementation Notes

- **Portrait cropping**: `PortraitPanel` uses `object-fit: cover` with `object-position` to frame Freud's face in the narrow 33% panel. The exact percentage depends on the source image composition and may need iterative adjustment.
- **Welcome card centering**: When `hasMessages` is false, the welcome content uses absolute positioning (`absolute inset-0 flex items-center justify-center`) inside the scrollable messages container to achieve true vertical centering.
- **Streaming**: The assistant message is added empty to the message list, then `UPDATE_MESSAGE` appends chunks character-by-character. The bubble displays `message.content || ' '` to prevent layout collapse while streaming.
- **System prompt**: Located in `src/prompts/freudSystemPrompt.ts`. The persona uses "we" ("Psychoanalysis believes..."), German terms with Chinese translation, clinical record style + theoretical elevation.
