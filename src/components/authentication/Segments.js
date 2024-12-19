import React, { useState } from "react";
import OpenAI from "openai";
import "./Segments.css";

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: "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", // 替换为你的 GPT API Key
  dangerouslyAllowBrowser: true, // 允许在浏览器中使用 OpenAI 客户端
});

const Segments = () => {
  const [message, setMessage] = useState(""); // 控制输入框内容
  const [loading, setLoading] = useState(false); // 控制加载状态
  const [reply, setReply] = useState(""); // 保存 GPT 的回复

  // 发送请求到 GPT API
  const sendMessageToGPT = async () => {
    if (!message.trim()) return; // 避免发送空消息

    setLoading(true); // 开始加载

    try {
      // 调用 OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // 模型名
        messages: [{ role: "user", content: message }],
        temperature: 0.7, // 控制结果随机性
        max_tokens: 150, // 回复的最大字数
      });

      const gptReply = completion.choices[0]?.message?.content || "无回复";
      console.log("GPT 回复：", gptReply);
      setReply(gptReply); // 将 GPT 回复保存到状态中
    } catch (error) {
      console.error("请求 GPT 失败:", error);
      setReply("请求失败，请稍后重试。");
    } finally {
      setLoading(false); // 停止加载
      setMessage(""); // 清空输入框
    }
  };

  // 输入框内容更新
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // 点击发送按钮
  const handleSendClick = () => {
    sendMessageToGPT();
  };

  return (
    <div className="segments">
      {/* 上方菜单按钮 */}
      <div className="segments-menu">
        {Array.from({ length: 5 }).map((_, index) => (
          <button key={index} className="menu-button">
            菜单{index + 1}
          </button>
        ))}
      </div>

      {/* 下方输入区域 */}
      <div className="segments-input-container">
        <textarea
          className="segments-input"
          value={message}
          onChange={handleInputChange}
          placeholder="请输入消息..."
          disabled={loading} /* 加载时禁用输入 */
        />
        <button
          className="send-button"
          onClick={handleSendClick}
          disabled={loading} /* 加载时禁用按钮 */
        >
          {loading ? "发送中..." : "发送"}
        </button>
      </div>

      {/* 显示 GPT 的回复 */}
      {reply && (
        <div className="segments-reply">
          <h3>GPT 回复：</h3>
          <p>{reply}</p>
        </div>
      )}
    </div>
  );
};

export default Segments;
