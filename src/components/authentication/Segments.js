import React, { useState } from "react";
// import axios from "axios";
import "./Segments.css";

const Segments = () => {
  const [message, setMessage] = useState(""); // 控制输入框内容
  const [loading, setLoading] = useState(false); // 控制加载状态

  // 发送请求到 GPT API
  const sendMessageToGPT = async () => {
    if (!message.trim()) return; // 避免发送空消息

    setLoading(true); // 开始加载

    try {
      const apiKey = "YOUR_OPENAI_API_KEY"; // 替换为你的 API Key
      const apiUrl = "https://api.openai.com/v1/chat/completions"; // GPT API 端点

      const response = await axios.post(
        apiUrl,
        {
          model: "gpt-3.5-turbo", // 模型，可以替换为其他模型如 "gpt-4"
          messages: [{ role: "user", content: message }],
          temperature: 0.7, // 控制生成结果的随机性
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`, // 在请求头中加入 API Key
          },
        }
      );

      const reply = response.data.choices[0]?.message?.content || "无回复";
      console.log("GPT回复：", reply); // 打印 GPT 回复到控制台
    } catch (error) {
      console.error("请求 GPT 失败:", error);
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
    </div>
  );
};

export default Segments;
