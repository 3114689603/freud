import { freudSystemPrompt } from '../prompts/freudSystemPrompt';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
}

function isAnthropicProtocol(baseUrl: string, model: string): boolean {
  return baseUrl.includes('anthropic') || model.includes('claude');
}

export async function* sendMessage(
  messages: ChatMessage[],
  config: ApiConfig
): AsyncGenerator<string, void, unknown> {
  const { apiKey, baseUrl, model, temperature } = config;
  const isAnthropic = isAnthropicProtocol(baseUrl, model);
  const systemMessage = freudSystemPrompt;

  if (isAnthropic) {
    const anthropicMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        temperature,
        system: systemMessage,
        messages: anthropicMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  } else {
    const openaiMessages = [
      { role: 'system', content: systemMessage },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: openaiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) yield text;
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

export interface TestResult {
  ok: boolean;
  message: string;
}

export async function testConnection(config: ApiConfig): Promise<TestResult> {
  try {
    const { apiKey, baseUrl, model } = config;
    const isAnthropic = isAnthropicProtocol(baseUrl, model);

    if (isAnthropic) {
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (response.ok) {
        return { ok: true, message: '连接成功' };
      }
      const errorText = await response.text().catch(() => '未知错误');
      return { ok: false, message: `API 错误 (${response.status}): ${errorText.slice(0, 200)}` };
    } else {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (response.ok) {
        return { ok: true, message: '连接成功' };
      }
      const errorText = await response.text().catch(() => '未知错误');
      return { ok: false, message: `API 错误 (${response.status}): ${errorText.slice(0, 200)}` };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('fetch') || msg.includes('CORS') || msg.includes('Failed to fetch')) {
      return { ok: false, message: '网络错误：可能是 CORS 限制，请检查 API 地址是否正确，或使用支持跨域的接口' };
    }
    return { ok: false, message: `请求失败: ${msg}` };
  }
}
