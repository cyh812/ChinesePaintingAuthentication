import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import "./LLM.css";

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: "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", // 替换为你的 GPT API Key
  dangerouslyAllowBrowser: true, // 允许在浏览器中使用 OpenAI 客户端
});

const Segments = () => {
  const [message, setMessage] = useState(""); // 控制输入框内容
  const [loading, setLoading] = useState(false); // 控制加载状态
  const [reply, setReply] = useState(""); // 保存 GPT 的回复

  const [selectedImages, setSelectedImages] = useState([]); // 当前选中的图片索引
  const [imagePaths, setImagePaths] = useState([
    "../../assets/img/test/D13647-06.png",
    "../../assets/img/test/D00214-04.png",
    "../../assets/img/test/D13456.png",
    "../../assets/img/test/T01.png",
    "../../assets/img/test/Y60.png",
  ]); // 图片路径数组

  const [displayedImages, setDisplayedImages] = useState([]); // 动态展示的图片数组

  // 键盘监听事件：按下 "A" 键添加图片
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "a" || e.key === "A") {
        if (displayedImages.length < imagePaths.length) {
          setDisplayedImages((prev) => [...prev, imagePaths[prev.length]]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imagePaths, displayedImages]);

  // 单击图片添加或移除选中状态
  const toggleImageSelection = (index) => {
    if (selectedImages.includes(index)) {
      setSelectedImages((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedImages((prev) => [...prev, index]);
    }
  };

  // 发送请求到 GPT API
  const sendMessageToGPT = async () => {
    setMessage("")
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
        {displayedImages.map((imagePath, index) => (
          <div
            key={index}
            className={`menu-image ${selectedImages.includes(index) ? "selected" : ""}`}
            onClick={() => toggleImageSelection(index)}
          >
            <img src={imagePath} alt={`Menu ${index + 1}`} />
          </div>
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
      {/* {reply && (
        <div className="segments-reply">
          <h3>GPT 回复：</h3>
          <p>{reply}</p>
        </div>
      )} */}
    </div>
  );
};

export default Segments;
