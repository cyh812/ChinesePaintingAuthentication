import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import SvgIcon from '@mui/material/SvgIcon';
import "./LLM.css";

// 初始化 Deepseek 客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com', // 使用 Deepseek 的基础 URL
  apiKey: "sk-d92a575188954a01b6a4fc4e2d231fe9", // 替换为您的 Deepseek API Key
  dangerouslyAllowBrowser: true, // 允许在浏览器中使用 OpenAI 客户端
});

function Send(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <path d="M27.6367 15.1132L1.19533 0.9765C0.812515 0.785094 0.347671 1.08587 0.402359 1.49603L2.45314 25.914C2.48048 26.2968 2.8633 26.5156 3.21876 26.3788L11.75 22.7968L16.4258 28.1015C16.7266 28.4296 17.2461 28.2929 17.3555 27.8827L19.5977 19.4882L27.6367 16.0976C28.0195 15.9062 28.0469 15.332 27.6367 15.1132ZM16.4258 25.5585L13.9649 21.1835L1.38673 1.76947L18.0664 18.996L16.4258 25.5585Z" fill="#FDFDFD" />
    </SvgIcon>
  );
}

const Segments = () => {
  const [message, setMessage] = useState(""); // 控制输入框内容
  const [loading, setLoading] = useState(false); // 控制加载状态
  const [reply, setReply] = useState(""); // 保存 GPT 的回复
  const [conversationHistory, setConversationHistory] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]); // 当前选中的图片索引
  const [selectedImages2, setSelectedImages2] = useState([]); // 当前选中的图片索引
  const [imagePaths, setImagePaths] = useState([
    "../../assets/img/left/1.png",
    "../../assets/img/left/2.png",
    "../../assets/img/left/3.png",
    "../../assets/img/left/4.png",
    "../../assets/img/left/5.png",
    "../../assets/img/left/6.png",
  ]); // 图片路径数组

  const [imagePaths2, setImagePaths2] = useState([
    "../../assets/img/right/2.jpg",
    "../../assets/img/right/1.png",
  ]); // 图片路径数组

  const [displayedImages, setDisplayedImages] = useState([]); // 动态展示的图片数组
  const [displayedImages2, setDisplayedImages2] = useState([]); // 动态展示的图片数组

  // 键盘监听事件：按下 "A" 键添加图片
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "1") {
        if (displayedImages.length < imagePaths.length) {
          setDisplayedImages((prev) => [...prev, imagePaths[prev.length]]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imagePaths, displayedImages]);

  // 键盘监听事件：按下 2 键添加图片
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "2") {
        if (displayedImages2.length < imagePaths2.length) {
          setDisplayedImages2((prev) => [...prev, imagePaths2[prev.length]]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imagePaths2, displayedImages2]);

  // 单击图片添加或移除选中状态
  const toggleImageSelection = (index) => {
    if (selectedImages.includes(index)) {
      setSelectedImages((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedImages((prev) => [...prev, index]);
    }
  };
  const toggleImageSelection2 = (index) => {
    if (selectedImages2.includes(index)) {
      setSelectedImages2((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedImages2((prev) => [...prev, index]);
    }
  };

  // 发送请求到 GPT API
  const sendMessageToGPT = async () => {
    setMessage("")
    if (!message.trim()) return; // 避免发送空消息

    setLoading(true); // 开始加载

    // 更新对话历史，将用户的消息添加到历史中
    const newConversationHistory = [
      ...conversationHistory,
      { role: "user", content: message }
    ];
    setConversationHistory(newConversationHistory);

    try {
      // 调用 Deepseek API
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat", // 使用 Deepseek 的模型
        messages: newConversationHistory, // 用户的消息
        // temperature: 0.7, // 控制结果随机性
        // max_tokens: 150, // 回复的最大字数
      });

      const deepseekReply = completion.choices[0]?.message?.content || "无回复";
      console.log("Deepseek 回复：", deepseekReply);
      setReply(deepseekReply); // 将 Deepseek 回复保存到状态中

      // 更新对话历史，将模型的回复添加到历史中
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: deepseekReply }
      ]);
    } catch (error) {
      console.error("请求 Deepseek 失败:", error);
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
    setSelectedImages([]);
    setSelectedImages2([]);
  };

  return (
    <div className="segments">
      {/* 上方菜单按钮 */}
      <div className="segments-menu">
        <div className="segments-menu1">
          {displayedImages.map((imagePath, index) => (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <div
                key={index}
                className={`menu-image ${selectedImages.includes(index) ? "selected" : ""}`}
                onClick={() => toggleImageSelection(index)}
              >
                <img src={imagePath} alt={`Menu ${index + 1}`} />
              </div>
              {selectedImages.includes(index) && <div key={index} style={{ display: "flex", flexDirection: "column", height: "75px", marginLeft: "10px", backgroundColor: "#FCFCFC", borderRadius: "5px", justifyContent: "space-around", alignItems: "center" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    marginBottom: "5px", // 按钮之间的间距
                  }}
                  onClick={(e) => {
                  }}
                >
                  <img src="../../assets/img/b1.png" alt="Button 1" style={{ width: "24px", height: "24px" }} />
                </button>
                <div
                  style={{
                    width: "80%",
                    height: "1px",
                    backgroundColor: "#DDD", // 分割线颜色
                    margin: "4px 0", // 分割线与按钮的间距
                  }}
                />
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                  }}
                >
                  <img src="../../assets/img/b2.png" alt="Button 2" style={{ width: "24px", height: "24px" }} />
                </button>
              </div>}
            </div>
          ))}
        </div>
        <div className="segments-menu2">
          {displayedImages2.map((imagePath, index) => (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <div
                key={index}
                className={`menu-image ${selectedImages2.includes(index) ? "selected" : ""}`}
                onClick={() => toggleImageSelection2(index)}
              >
                <img src={imagePath} alt={`Menu ${index + 1}`} />
              </div>
              {selectedImages2.includes(index) && <div key={index} style={{ display: "flex", flexDirection: "column", height: "75px", marginLeft: "10px", backgroundColor: "#FCFCFC", borderRadius: "5px", justifyContent: "space-around", alignItems: "center" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    marginBottom: "5px", // 按钮之间的间距
                  }}
                  onClick={(e) => {
                  }}
                >
                  <img src="../../assets/img/b1.png" alt="Button 1" style={{ width: "24px", height: "24px" }} />
                </button>
                <div
                  style={{
                    width: "80%",
                    height: "1px",
                    backgroundColor: "#DDD", // 分割线颜色
                    margin: "4px 0", // 分割线与按钮的间距
                  }}
                />
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                  }}
                >
                  <img src="../../assets/img/b2.png" alt="Button 2" style={{ width: "24px", height: "24px" }} />
                </button>
              </div>}
            </div>
          ))}
        </div>
      </div>


      {/* 下方输入区域 */}
      <div className="segments-input-container">
        <textarea
          className="segments-input"
          value={message}
          onChange={handleInputChange}
          placeholder="" // 填写“请输入消息”
          disabled={loading} /* 加载时禁用输入 */
        />
        <button style={{
          fontSize: 20
        }}
          className="send-button"
          onClick={handleSendClick}
          disabled={loading} /* 加载时禁用按钮 */
        >

            <Send sx={{ transform: 'scale(1.5) translateX(3px)' }} /> 
          
        </button>
      </div>
    </div>
  );
};

export default Segments;
