import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import SvgIcon from "@mui/material/SvgIcon";
import "./LLM.css";

// 仅供本地测试，正式部署不要把 key 放在前端
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-c0cc496d16e6413c8e04a0ffcb9ddb21",
  dangerouslyAllowBrowser: true,
});

function Send(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <path
        d="M27.6367 15.1132L1.19533 0.9765C0.812515 0.785094 0.347671 1.08587 0.402359 1.49603L2.45314 25.914C2.48048 26.2968 2.8633 26.5156 3.21876 26.3788L11.75 22.7968L16.4258 28.1015C16.7266 28.4296 17.2461 28.2929 17.3555 27.8827L19.5977 19.4882L27.6367 16.0976C28.0195 15.9062 28.0469 15.332 27.6367 15.1132ZM16.4258 25.5585L13.9649 21.1835L1.38673 1.76947L18.0664 18.996L16.4258 25.5585Z"
        fill="#FDFDFD"
      />
    </SvgIcon>
  );
}

const Segments = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "assistant",
      content: "你好，我是你的 AI 助手。请输入你的问题。",
    },
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, loading]);

  // 自动调整输入框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const resetTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
  };

  const sendMessageToGPT = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;

    const newHistory = [
      ...conversationHistory,
      { role: "user", content: trimmedMessage },
    ];

    setConversationHistory(newHistory);
    setMessage("");
    resetTextareaHeight();
    setLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: newHistory,
      });

      const deepseekReply =
        completion.choices[0]?.message?.content || "无回复";

      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: deepseekReply },
      ]);
    } catch (error) {
      console.error("请求 Deepseek 失败:", error);

      let errorText = "请求失败，请稍后重试。";

      if (
        error?.status === 402 ||
        String(error?.message).includes("Insufficient Balance")
      ) {
        errorText = "DeepSeek API 余额不足，请检查账户额度。";
      }

      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: errorText },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    requestAnimationFrame(adjustTextareaHeight);
  };

  const handleSendClick = () => {
    sendMessageToGPT();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageToGPT();
    }
  };

  return (
    <div className="segments">
      <div className="chat-header">AI Assistant</div>

      <div className="chat-messages">
        {conversationHistory.map((item, index) => (
          <div
            key={index}
            className={`message-row ${
              item.role === "user"
                ? "message-row-user"
                : "message-row-assistant"
            }`}
          >
            <div
              className={`message-bubble ${
                item.role === "user" ? "message-user" : "message-assistant"
              }`}
            >
              {item.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row message-row-assistant">
            <div className="message-bubble message-assistant typing">
              正在思考...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="segments-input-container">
        <textarea
          ref={textareaRef}
          className="segments-input"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
          disabled={loading}
          rows={1}
        />

        <button
          className="send-button"
          onClick={handleSendClick}
          disabled={loading}
          aria-label="发送"
          title="发送"
        >
          <Send sx={{ transform: "scale(1.3)" }} />
        </button>
      </div>
    </div>
  );
};

export default Segments;