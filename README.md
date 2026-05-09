# Sigmund Freud — 精神分析对话

与西格蒙德·弗洛伊德进行沉浸式精神分析对话的交互式网页应用。基于 Claude API 驱动，以弗洛伊德的思维框架回应你的梦境、焦虑、人格与关系问题。

![预览](public/freud-portrait.jpg)

## 功能特性

- **沉浸式对话体验** — 左侧对话区 + 右侧弗洛伊德肖像区，杂志风格排版
- **流式回复** — 弗洛伊德的话逐字呈现，模拟真实对话节奏
- **名言卡片** — 右侧自动轮播经典语录，支持点击填入输入框
- **图片上传** — 可自定义右侧肖像图片
- **API 自由切换** — 支持 Anthropic、OpenAI 及任意兼容接口
- **话题速启** — 内置「解析梦境」「防御机制」「生死本能」等快速话题
- **背景粒子动画** — Canvas 驱动的金色微粒飘动效果

## 技术栈

- Vite 8 + React 19 + TypeScript 6
- Tailwind CSS v4
- Framer Motion
- 原生 Fetch + SSE 流式输出

## 本地搭建

### 1. 克隆仓库

```bash
git clone https://github.com/3114689603/freud.git
cd freud
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

默认在 http://localhost:5173 打开。开发服务器内置了 API 代理，可直接连接 Anthropic / OpenAI 官方接口，无需额外配置 CORS。

### 4. 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 使用说明

首次打开网页后，点击底部 ⚙️ 按钮进入 **API 配置面板**：

| 配置项 | 说明 |
|---|---|
| API Key | 你的 Claude / OpenAI API Key |
| Base URL | API 端点地址，默认 Anthropic 官方接口 |
| Model | 模型名称，如 `claude-sonnet-4-6`、`claude-opus-4-7` |
| Temperature | 温度参数，默认 0.7 |

填写完成后点击「测试连接」验证，再点击「保存设置」即可开始对话。配置会自动保存在浏览器本地存储中。

### 关于 CORS（在线部署必看）

本项目部署到 GitHub Pages 等静态托管平台后，由于浏览器安全策略限制，**无法直接连接 Anthropic / OpenAI 官方 API**。

**解决方案：**

1. **使用支持 CORS 的第三方 API 端点** — 填入代理地址作为 Base URL
2. **自行部署 CORS 代理** — 项目中提供了 `proxy/cors-proxy.js`（Cloudflare Workers 脚本），免费部署后可获得自己的代理地址

本地开发不受影响（Vite 内置代理会自动处理跨域）。

## 项目结构

```
src/
  api/chat.ts           # API 封装（Anthropic / OpenAI 协议兼容）
  components/           # UI 组件
  context/ChatContext.tsx  # 全局状态管理
  prompts/              # System Prompt（弗洛伊德角色设定）
  App.tsx               # 根布局
```

## 弗洛伊德 System Prompt

本项目的核心在于 `src/prompts/freudSystemPrompt.ts`，完整提炼了弗洛伊德精神分析体系的 6 个心智模型、5 条决策启发式、表达 DNA 与诚实边界，让 Claude 以精神分析的透镜回应每一个问题。

---

**在线访问**：https://3114689603.github.io/freud/
