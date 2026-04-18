import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import SvgIcon from "@mui/material/SvgIcon";
import "./LLM.css";
import KGData from "../../assets/data/KG.json";

// =========================
// 第一阶段 LLM：负责检索 JSON 条目
// =========================
const retrieverClient = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-569bccdbc77a46d789eabb3c72a402b3",
  dangerouslyAllowBrowser: true,
});

// =========================
// 第二阶段 LLM：负责自然语言对话
// 这里你可以接另一个 API，也可以先继续用 DeepSeek 做测试
// =========================
const answerClient = new OpenAI({
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

// 尝试从 LLM 返回文本中解析 JSON
function safeParseJson(text) {
  if (!text) return null;

  // 1. 直接尝试整体解析
  try {
    return JSON.parse(text);
  } catch (_) { }

  // 2. 尝试提取 ```json ... ``` 代码块
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch?.[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (_) { }
  }

  // 3. 尝试提取普通 ``` ... ```
  const plainCodeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/i);
  if (plainCodeBlockMatch?.[1]) {
    try {
      return JSON.parse(plainCodeBlockMatch[1]);
    } catch (_) { }
  }

  // 4. 尝试截取最外层数组
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch?.[0]) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (_) { }
  }

  // 5. 尝试截取最外层对象
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch (_) { }
  }

  return null;
}

const Segments = (props) => {
  const { onKnowledgeRetrieved } = props;
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 给第二阶段 LLM 用的历史对话
  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "assistant",
      content:
        "你好，我是你的 AI 助手。请输入问题，我会先检索知识库，再结合历史对话进行回答。",
    },
  ]);

  // 第一阶段检索出的结构化知识
  const [retrievedKnowledge, setRetrievedKnowledge] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, loading]);

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

  // =========================
  // 第一阶段：知识检索
  // 输入：用户问题 + KG.json
  // 输出：抽取后的 JSON
  // =========================
  const retrieveKnowledge = async (userQuestion) => {
    const retrieverSystemPrompt = `
你是一个知识库条目抽取助手。
你的任务是：根据用户的问题，从我提供的 JSON 知识库中抽取与问题相关的条目。

要求：
1. 每次请求都是独立任务，不要假设任何历史上下文；
2. 只依据本次提供的问题和 JSON 内容进行判断；
3. 返回与问题相关的条目；
4. 不要编造 JSON 中不存在的信息；
5. 可以删除与当前问题无关的字段和子条目；
6. 如果没有找到相关条目，返回 []；

输出要求：
1. 只输出 JSON；
2. 不要输出解释文字；
3. 优先输出 JSON 数组；
4. 保证 JSON 格式合法，可被 JSON.parse 解析。
`;

    const retrieverUserPrompt = `
用户问题：
${userQuestion}

知识库 JSON：
${JSON.stringify(KGData, null, 2)}
`;

    const completion = await retrieverClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: retrieverSystemPrompt },
        { role: "user", content: retrieverUserPrompt },
      ],
      temperature: 0,
    });

    const rawReply = completion.choices[0]?.message?.content || "[]";
    const parsed = safeParseJson(rawReply);

    if (!parsed) {
      throw new Error("第一阶段 LLM 返回内容不是合法 JSON");
    }

    return parsed;
  };

  // =========================
  // 第二阶段：自然语言回答
  // 输入：用户问题 + 检索结果 + 历史对话
  // 输出：自然语言回答
  // =========================
  const answerWithKnowledge = async (userQuestion, knowledgeJson, history) => {
    const answerSystemPrompt = `
你是一个中国古画知识问答助手。
你的任务是基于“用户问题 + 外部知识 + 历史对话上下文”，组织自然、准确、简洁的回答。

要求：
1. 优先依据提供的外部知识回答；
2. 可以结合历史对话理解用户的省略指代、追问和上下文；
3. 不要编造外部知识中不存在的事实；
4. 当外部知识不足时，可以明确说明信息不足；
5. 回答风格自然，不要机械复述 JSON。
`;

    const answerUserPrompt = `
当前用户问题：
${userQuestion}

本轮检索到的外部知识：
${JSON.stringify(knowledgeJson, null, 2)}
`;

    const messages = [
      { role: "system", content: answerSystemPrompt },
      ...history,
      { role: "user", content: answerUserPrompt },
    ];

    const completion = await answerClient.chat.completions.create({
      model: "deepseek-chat",
      messages,
      temperature: 0.6,
    });

    return completion.choices[0]?.message?.content || "无回复";
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;

    // 先把用户消息放进对话区
    const nextHistory = [
      ...conversationHistory,
      { role: "user", content: trimmedMessage },
    ];
    setConversationHistory(nextHistory);

    setMessage("");
    resetTextareaHeight();
    setLoading(true);

    try {
      // ===== 第一阶段：检索 =====
      const knowledge = await retrieveKnowledge(trimmedMessage);

      setRetrievedKnowledge(knowledge);
      console.log("第一阶段抽取出的 JSON：", knowledge);
      // 传给父组件或其他 component
      if (typeof onKnowledgeRetrieved === "function") {
        onKnowledgeRetrieved(knowledge);
      }

      // ===== 第二阶段：回答 =====
      const finalAnswer = await answerWithKnowledge(
        trimmedMessage,
        knowledge,
        nextHistory
      );

      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: finalAnswer },
      ]);
    } catch (error) {
      console.error("两阶段 LLM 处理失败:", error);

      let errorText = "请求失败，请稍后重试。";

      if (
        error?.status === 402 ||
        String(error?.message).includes("Insufficient Balance")
      ) {
        errorText = "API 余额不足，请检查账户额度。";
      } else if (String(error?.message).includes("合法 JSON")) {
        errorText = "第一阶段检索结果无法解析为 JSON，请检查提示词或模型输出。";
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
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="segments">
      <div className="chat-header">Two-Stage KG Assistant</div>

      <div className="chat-messages">
        {conversationHistory.map((item, index) => (
          <div
            key={index}
            className={`message-row ${item.role === "user"
                ? "message-row-user"
                : "message-row-assistant"
              }`}
          >
            <div
              className={`message-bubble ${item.role === "user" ? "message-user" : "message-assistant"
                }`}
            >
              {item.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row message-row-assistant">
            <div className="message-bubble message-assistant typing">
              正在先检索知识，再组织回答...
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
          placeholder="请输入问题。"
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