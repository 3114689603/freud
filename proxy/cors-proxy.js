/**
 * Cloudflare Workers CORS 代理脚本
 *
 * 部署步骤：
 * 1. 登录 https://dash.cloudflare.com/，注册/登录账号（免费）
 * 2. 进入 Workers & Pages → 创建 Worker
 * 3. 替换为下方代码，保存并部署
 * 4. 获得 Worker 地址（如 https://your-proxy.your-subdomain.workers.dev）
 * 5. 在本网页的 API 设置中，Base URL 填入：https://your-proxy.your-subdomain.workers.dev/v1
 *
 * 这个代理会转发请求到 Anthropic API，并添加 CORS 响应头，
 * 让浏览器可以正常访问。
 */

export default {
  async fetch(request, env) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization, anthropic-version',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);

    // 提取目标 API（默认 Anthropic）
    const targetHost = env.TARGET_API || 'https://api.anthropic.com';
    const targetUrl = targetHost + url.pathname + url.search;

    // 创建新的请求，透传方法和 body
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // 发送请求到目标 API
    const response = await fetch(modifiedRequest);

    // 复制响应头并添加 CORS
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization, anthropic-version');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
