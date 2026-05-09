import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useChat } from "../context/ChatContext";

const commonBaseUrls = [
  { label: "Anthropic", url: "https://api.anthropic.com/v1" },
  { label: "OpenAI", url: "https://api.openai.com/v1" },
];

const commonModels = [
  { label: "Sonnet 4.6", value: "claude-sonnet-4-6" },
  { label: "Opus 4.7", value: "claude-opus-4-7" },
  { label: "Haiku 4.5", value: "claude-haiku-4-5" },
  { label: "MiniMax-M2.7", value: "MiniMax-M2.7" },
];

export default function ApiSettings() {
  const { state, dispatch, testApiConnection } = useChat();
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState("idle");
  const [testMessage, setTestMessage] = useState("");

  const config = state.apiConfig;

  const updateConfig = (updates) => {
    dispatch({ type: "SET_API_CONFIG", payload: { ...config, ...updates } });
  };

  const handleTest = async () => {
    if (!config.apiKey) return;
    setTestStatus("testing");
    setTestMessage("");
    try {
      const result = await testApiConnection();
      setTestStatus(result.ok ? "success" : "error");
      setTestMessage(result.message);
    } catch {
      setTestStatus("error");
      setTestMessage("测试过程中发生未知错误");
    }
  };

  return (
    <AnimatePresence>
      {state.showSettings && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => dispatch({ type: "SET_SHOW_SETTINGS", payload: false })}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-0 m-auto z-50 w-[90%] max-w-[480px] h-fit max-h-[85vh] overflow-auto bg-cream-50 rounded-2xl shadow-2xl border border-cream-300/40"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300/30">
              <h2 className="text-text-main text-lg font-medium tracking-wide">API 配置</h2>
              <button
                onClick={() => dispatch({ type: "SET_SHOW_SETTINGS", payload: false })}
                className="w-8 h-8 rounded-full hover:bg-cream-200 flex items-center justify-center text-text-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <p className="text-text-muted text-sm leading-relaxed">
                默认按 Anthropic API 协议请求。支持任意兼容接口。填入 API Key 后即可与弗洛伊德对话。
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1.5">
                    <p className="text-amber-800 text-sm font-medium">关于在线部署的 CORS 限制</p>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      本网页部署到 GitHub Pages 后，由于浏览器安全策略（CORS），
                      <strong>无法直接连接 Anthropic / OpenAI 官方 API</strong>。
                      你需要使用支持 CORS 的 API 端点，或自行搭建代理。
                    </p>
                    <div className="bg-white/60 rounded-md p-2.5 space-y-1.5">
                      <p className="text-amber-800 text-xs font-medium">推荐方案：</p>
                      <ol className="text-amber-700 text-xs leading-relaxed list-decimal list-inside space-y-1">
                        <li>
                          使用支持 CORS 的第三方 API 端点（如 Cloudflare AI Gateway、
                          国内 API 转发服务等），将地址填入 Base URL
                        </li>
                        <li>
                          自行部署 CORS 代理：项目中提供了 <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800">proxy/cors-proxy.js</code>（Cloudflare Workers 脚本），
                          免费部署后可获得自己的代理地址
                        </li>
                      </ol>
                    </div>
                    <p className="text-amber-600 text-xs">
                      本地开发不受影响（Vite 内置代理会自动处理跨域）。
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-text-main text-sm font-medium">API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full px-4 py-2.5 rounded-lg bg-cream-100 border border-cream-300/50 text-text-main text-sm focus:outline-none focus:border-cream-400 transition-colors pr-10"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs hover:text-cream-500"
                  >{showKey ? "隐藏" : "显示"}</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-text-main text-sm font-medium">Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-cream-100 border border-cream-300/50 text-text-main text-sm focus:outline-none focus:border-cream-400 transition-colors"
                />
                <div className="flex gap-2 text-xs">
                  <span className="text-text-muted">常用地址:</span>
                  {commonBaseUrls.map((item) => (
                    <button key={item.label} onClick={() => updateConfig({ baseUrl: item.url })} className="text-cream-500 hover:text-cream-600 hover:underline">{item.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-text-main text-sm font-medium">Model</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => updateConfig({ model: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-cream-100 border border-cream-300/50 text-text-main text-sm focus:outline-none focus:border-cream-400 transition-colors"
                />
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="text-text-muted">常用模型:</span>
                  {commonModels.map((item) => (
                    <button key={item.value} onClick={() => updateConfig({ model: item.value })} className="text-cream-500 hover:text-cream-600 hover:underline">{item.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-text-main text-sm font-medium">Temperature</label>
                <input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={config.temperature}
                  onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) || 0.7 })}
                  className="w-full px-4 py-2.5 rounded-lg bg-cream-100 border border-cream-300/50 text-text-main text-sm focus:outline-none focus:border-cream-400 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleTest} disabled={testStatus === "testing" || !config.apiKey} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors disabled:opacity-50 ${testStatus === 'success' ? 'bg-green-50 border-green-300 text-green-700' : testStatus === 'error' ? 'bg-red-50 border-red-300 text-red-700' : 'border-cream-300 text-text-main hover:bg-cream-200'}`}>
                  {testStatus === "testing" ? <Loader2 size={16} className="animate-spin" /> : testStatus === "success" ? <Check size={16} /> : testStatus === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
                  {testStatus === "success" ? "连接成功" : testStatus === "error" ? "连接失败" : "测试连接"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => dispatch({ type: "SET_SHOW_SETTINGS", payload: false })} className="flex-1 px-4 py-2.5 rounded-lg bg-cream-500 text-white text-sm hover:bg-cream-600 transition-colors">
                  保存设置
                </motion.button>
              </div>
              {testMessage && (
                <p className={`text-xs mt-2 ${testStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {testMessage}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
