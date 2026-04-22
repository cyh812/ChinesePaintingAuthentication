import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import SvgIcon from "@mui/material/SvgIcon";
import "./LLM.css";
import { detectInputLanguage, LANG_EN, LANG_ZH, t } from "../../i18n/texts";
import {
  PRESET_DEMO_SEQUENCE,
  getDemoStepByIndex,
  getLocalizedStepText,
  getTotalDemoSteps,
} from "./demo/presetDemoSequence";
import { composePresetAnswer } from "./demo/presetAnswerComposer";

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeSealItem(seal) {
  if (!seal || typeof seal !== "object") return null;

  const sealId = seal["seal id"] || seal["seal_id"] || seal["seal_code"] || seal["id"];
  const sealName = seal["name"] || seal["seal_name"] || seal["印章名"];

  if (!sealId || !sealName) return null;

  return {
    "seal id": String(sealId),
    similarity: seal["similarity"] ?? 0,
    name: sealName,
  };
}

function normalizeReferenceItem(ref) {
  if (!ref || typeof ref !== "object") return null;

  const refId = ref["reference_id"] || ref["reference id"];
  const refInfo = ref["info"] || ref["title"] || ref["name"];

  if (!refId || !refInfo) return null;

  return {
    reference_id: String(refId),
    info: refInfo,
    text_record: ref["text_record"] || ref["text record"] || ref["statement"] || "",
  };
}

function normalizePaintingItem(painting) {
  if (!painting || typeof painting !== "object") return null;

  const paintingId = painting["编号"] || painting["id"];
  const paintingName = painting["总作品名"] || painting["作品名"] || painting["title"] || painting["name"];

  if (!paintingId || !paintingName) return null;

  const sealsRaw = Array.isArray(painting["seals"])
    ? painting["seals"]
    : Array.isArray(painting["印章"])
      ? painting["印章"]
      : [];

  const refsRaw = Array.isArray(painting["考证"])
    ? painting["考证"]
    : Array.isArray(painting["references"])
      ? painting["references"]
      : [];

  const seals = sealsRaw.map(normalizeSealItem).filter(Boolean);
  const references = refsRaw.map(normalizeReferenceItem).filter(Boolean);

  return {
    编号: String(paintingId),
    总作品名: paintingName,
    seals,
    考证: references,
  };
}

function extractTargetPaintingFromQuestion(questionZh, activeKgData) {
  if (!questionZh || !Array.isArray(activeKgData)) return null;

  const candidates = activeKgData
    .map((item) => {
      const id = item["编号"] || item["id"];
      const name = item["总作品名"] || item["作品名"] || item["title"] || item["name"];
      return id && name ? { id: String(id), name, raw: item } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.name.length - a.name.length);

  return candidates.find((item) => questionZh.includes(item.name)) || null;
}

function normalizeAndFilterKnowledge(rawKnowledge, questionZh, activeKgData) {
  const sealIntentPattern = /印章|印鉴|印文|钤|印谱|seal/i;
  const referenceIntentPattern = /参考|文献|考证|资料|出处|记载|reference|citation/i;

  const isSealQuestion = sealIntentPattern.test(questionZh || "");
  const isReferenceQuestion = referenceIntentPattern.test(questionZh || "");

  const pruneByIntent = (item) => {
    if (!item) return item;

    if (isSealQuestion && !isReferenceQuestion) {
      return {
        ...item,
        考证: [],
      };
    }

    if (isReferenceQuestion && !isSealQuestion) {
      return {
        ...item,
        seals: [],
      };
    }

    return item;
  };

  const normalizedList = toArray(rawKnowledge)
    .map(normalizePaintingItem)
    .map(pruneByIntent)
    .filter(Boolean);

  const byPaintingId = new Map();
  normalizedList.forEach((item) => {
    if (!byPaintingId.has(item["编号"])) {
      byPaintingId.set(item["编号"], item);
    }
  });

  const deduped = Array.from(byPaintingId.values());
  const target = extractTargetPaintingFromQuestion(questionZh, activeKgData);

  if (!target) {
    return {
      items: deduped.slice(0, 3),
      targetPaintingId: null,
      targetPaintingName: null,
      rawCount: normalizedList.length,
      keptCount: Math.min(deduped.length, 3),
    };
  }

  let filtered = deduped.filter(
    (item) => item["编号"] === target.id || item["总作品名"] === target.name
  );

  if (filtered.length === 0) {
    const normalizedTarget = normalizePaintingItem(target.raw);
    if (normalizedTarget) {
      filtered = [normalizedTarget];
    }
  }

  return {
    items: filtered,
    targetPaintingId: target.id,
    targetPaintingName: target.name,
    rawCount: normalizedList.length,
    keptCount: filtered.length,
  };
}

const Segments = (props) => {
  const { onKnowledgeRetrieved, language = LANG_ZH } = props;
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [presetTyping, setPresetTyping] = useState(false);
  const [isPresetPlaying, setIsPresetPlaying] = useState(false);
  const [kgData, setKgData] = useState(null);

  const [exhibitionEnabled, setExhibitionEnabled] = useState(false);
  const [exhibitionMode, setExhibitionMode] = useState("guided");
  const [guidedStepIndex, setGuidedStepIndex] = useState(0);
  const [guidedStepReadyForNext, setGuidedStepReadyForNext] = useState(false);

  // 展示用历史：按用户输入语言显示
  const [conversationHistory, setConversationHistory] = useState([]);
  // 模型用历史：统一中文语境，保证检索稳定
  const [modelHistory, setModelHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const playbackTokenRef = useRef(0);
  const totalSteps = getTotalDemoSteps();

  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: t(language, "chatGreeting"),
      meta: { language },
    };
    setConversationHistory([greeting]);
    setModelHistory([
      {
        role: "assistant",
        content: t(LANG_ZH, "chatGreeting"),
      },
    ]);
  }, [language]);

  useEffect(() => {
    const loadKgData = async () => {
      const preferredFile = language === LANG_EN ? "KG_en.json" : "KG.json";

      try {
        const res = await fetch(`./assets/data/${preferredFile}`);
        if (res.ok) {
          const data = await res.json();
          setKgData(data);
          return;
        }

        const fallbackRes = await fetch("./assets/data/KG.json");
        if (!fallbackRes.ok) {
          throw new Error("KG load failed");
        }
        const fallbackData = await fallbackRes.json();
        setKgData(fallbackData);
      } catch (err) {
        console.error("KG 数据加载失败:", err);
        setKgData(null);
      }
    };

    loadKgData();
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, loading]);

  const cancelPresetPlayback = () => {
    playbackTokenRef.current += 1;
    setPresetTyping(false);
    setIsPresetPlaying(false);
  };

  useEffect(() => {
    return () => {
      cancelPresetPlayback();
    };
  }, []);

  const appendMessage = (item) => {
    setConversationHistory((prev) => [...prev, item]);
  };

  const runPresetStep = async (step, stepIndex) => {
    if (!step) return;

    const token = playbackTokenRef.current + 1;
    playbackTokenRef.current = token;
    setIsPresetPlaying(true);
    setPresetTyping(false);

    const { question, guideText, followupHint } = getLocalizedStepText(step, language);
    const questionDelayMs = step?.timing?.questionDelayMs ?? 450;
    const answerDelayMs = step?.timing?.answerDelayMs ?? 1000;

    await wait(questionDelayMs);
    if (playbackTokenRef.current !== token) return;

    if (step.type === "guide") {
      const guideContent = `${guideText || t(language, "demoGuideFallback")}${
        followupHint ? `\n\n${followupHint}` : ""
      }`;

      appendMessage({
        role: "assistant",
        content: guideContent,
        meta: {
          source: "preset",
          stepType: "guide",
          stepIndex,
          totalSteps,
          language,
        },
      });

      setIsPresetPlaying(false);
      return;
    }

    appendMessage({
      role: "user",
      content: question || t(language, "demoQuestionFallback"),
      meta: {
        source: "preset",
        stepType: "qa",
        stepIndex,
        totalSteps,
        language,
      },
    });

    setPresetTyping(true);
    await wait(answerDelayMs);

    if (playbackTokenRef.current !== token) return;

    setPresetTyping(false);

    if (
      typeof onKnowledgeRetrieved === "function" &&
      Array.isArray(step.knowledgePayload)
    ) {
      onKnowledgeRetrieved(step.knowledgePayload);
    }

    const generatedAnswer = composePresetAnswer(step, language);
    const assistantContent = `${generatedAnswer}${
      followupHint ? `\n\n${followupHint}` : ""
    }`;

    appendMessage({
      role: "assistant",
      content: assistantContent,
      meta: {
        source: "preset",
        stepType: "qa",
        stepIndex,
        totalSteps,
        language,
      },
    });

    if (question && generatedAnswer) {
      setModelHistory((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: generatedAnswer },
      ]);
    }

    setIsPresetPlaying(false);
  };

  const startExhibition = () => {
    cancelPresetPlayback();
    setExhibitionEnabled(true);
    setGuidedStepIndex(0);
    setGuidedStepReadyForNext(false);
    appendMessage({
      role: "assistant",
      content: t(language, "exhibitionStarted"),
      meta: { source: "system", language },
    });
  };

  const stopExhibition = (autoEnded = false) => {
    cancelPresetPlayback();
    setExhibitionEnabled(false);
    setGuidedStepIndex(0);
    setGuidedStepReadyForNext(false);
    appendMessage({
      role: "assistant",
      content: autoEnded
        ? t(language, "exhibitionGuideEnded")
        : t(language, "exhibitionStopped"),
      meta: { source: "system", language },
    });
  };

  const handleGuidedNext = async () => {
    if (!guidedStepReadyForNext) {
      return;
    }

    if (guidedStepIndex >= totalSteps - 1) {
      stopExhibition(true);
      return;
    }

    setGuidedStepIndex((prev) => {
      if (prev >= totalSteps - 1) {
        return prev;
      }
      return prev + 1;
    });

    setGuidedStepReadyForNext(false);
  };

  const handlePickStep = async (index) => {
    if (!exhibitionEnabled) {
      startExhibition();
    }

    if (exhibitionMode === "guided") {
      setGuidedStepIndex(index);
      await runPresetStep(getDemoStepByIndex(index), index);
      setGuidedStepReadyForNext(true);
      return;
    }

    await runPresetStep(getDemoStepByIndex(index), index);
  };

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
  const translateQuestionToChinese = async (questionInEnglish) => {
    const completion = await retrieverClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是翻译助手。把用户输入的英文问题翻译成自然、准确、简洁的中文问题。只输出中文问题，不要解释。",
        },
        { role: "user", content: questionInEnglish },
      ],
      temperature: 0,
    });

    return completion.choices[0]?.message?.content?.trim() || questionInEnglish;
  };

  const translateAnswerToEnglish = async (answerInChinese) => {
    const completion = await answerClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a translation assistant. Translate the Chinese answer into fluent, faithful English. Output only the translated answer.",
        },
        { role: "user", content: answerInChinese },
      ],
      temperature: 0,
    });

    return completion.choices[0]?.message?.content?.trim() || answerInChinese;
  };

  const retrieveKnowledge = async (userQuestion, activeKgData) => {
    if (!activeKgData) {
      throw new Error(t(language, "kgNotLoaded"));
    }

    const retrieverSystemPrompt = `
  你是一个知识库条目抽取助手。
  你的任务是：根据用户问题，从提供的 JSON 知识库中抽取与问题相关的条目。

  严格规则：
  1. 每次请求都是独立任务，不要假设任何历史上下文；
  2. 只使用知识库中真实存在的字段和值，不要编造；
  3. 只依据本次提供的问题和 JSON 内容进行判断；
  4. 返回回答该问题所需的字段；
  5. 不要编造 JSON 中不存在的信息；
  6. 删除与当前问题无关的字段和子条目；
  7. 如果没有找到相关条目，返回 []；
  8. 不要输出解释文字。

  输出要求：
  1. 只输出合法 JSON；
  2. 优先输出 JSON 数组；
  3. 保证可被 JSON.parse 解析。
  `;

    const retrieverUserPrompt = `
用户问题：
${userQuestion}

知识库 JSON：
${JSON.stringify(activeKgData, null, 2)}
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

    return completion.choices[0]?.message?.content || t(language, "noReply");
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;

    // 用户插入真实提问时，中断当前预设播放，继续当前 KG 的真实问答链路。
    if (isPresetPlaying || presetTyping) {
      cancelPresetPlayback();
    }

    // 先把用户消息放进对话区
    const inputLanguage = detectInputLanguage(trimmedMessage);

    const nextHistory = [
      ...conversationHistory,
      { role: "user", content: trimmedMessage, meta: { language: inputLanguage } },
    ];
    setConversationHistory(nextHistory);

    setMessage("");
    resetTextareaHeight();
    setLoading(true);

    try {
      let normalizedQuestionZh = trimmedMessage;
      if (inputLanguage === LANG_EN) {
        normalizedQuestionZh = await translateQuestionToChinese(trimmedMessage);
      }

      const nextModelHistory = [
        ...modelHistory,
        { role: "user", content: normalizedQuestionZh },
      ];

      // ===== 第一阶段：检索 =====
      const rawKnowledge = await retrieveKnowledge(normalizedQuestionZh, kgData);
      const filteredKnowledgePack = normalizeAndFilterKnowledge(
        rawKnowledge,
        normalizedQuestionZh,
        kgData
      );
      const knowledge = filteredKnowledgePack.items;

      console.log("第一阶段抽取出的 JSON（原始）:", rawKnowledge);
      console.log("第一阶段入图 JSON（过滤后）:", filteredKnowledgePack);
      // 传给父组件或其他 component
      if (typeof onKnowledgeRetrieved === "function") {
        onKnowledgeRetrieved(filteredKnowledgePack);
      }

      // ===== 第二阶段：回答 =====
      const answerZh = await answerWithKnowledge(
        normalizedQuestionZh,
        knowledge,
        nextModelHistory
      );

      let finalAnswer = answerZh;
      if (inputLanguage === LANG_EN) {
        try {
          finalAnswer = await translateAnswerToEnglish(answerZh);
        } catch (translateError) {
          console.error("英文答案翻译失败，回退中文答案:", translateError);
        }
      }

      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: finalAnswer,
          meta: {
            originalLanguage: inputLanguage,
            originalQuestion: trimmedMessage,
            normalizedQuestionZh,
            answerZh,
            answerDisplayed: finalAnswer,
          },
        },
      ]);

      setModelHistory((prev) => [...prev, { role: "assistant", content: answerZh }]);
    } catch (error) {
      console.error("两阶段 LLM 处理失败:", error);

      let errorText = t(language, "requestFailed");

      if (
        error?.status === 402 ||
        String(error?.message).includes("Insufficient Balance")
      ) {
        errorText = t(language, "insufficientBalance");
      } else if (String(error?.message).includes("合法 JSON")) {
        errorText = t(language, "invalidJson");
      } else if (String(error?.message).includes(t(language, "kgNotLoaded"))) {
        errorText = t(language, "kgNotLoaded");
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
      <div className="exhibition-rail">
        <div className="rail-top">
          <div className="rail-title-wrap">
            <div className="rail-title">{t(language, "exhibitionTitle")}</div>
          </div>

          <div className="rail-actions">
            <button
              className={`rail-btn ${exhibitionEnabled ? "danger" : "success"}`}
              onClick={exhibitionEnabled ? stopExhibition : startExhibition}
            >
              {exhibitionEnabled ? t(language, "exhibitionStop") : t(language, "exhibitionStart")}
            </button>
          </div>
        </div>

        {exhibitionEnabled && (() => {
          const activeIndex = Math.min(guidedStepIndex, Math.max(totalSteps - 1, 0));
          const activeStep = getDemoStepByIndex(activeIndex);
          const localized = getLocalizedStepText(activeStep, language);
          const cardTitle =
            localized?.suggestionLabel || localized?.question || localized?.guideText;

          return (
            <>
              <div className="mode-switch">
                <button
                  className={`mode-btn ${exhibitionMode === "guided" ? "active" : ""}`}
                  onClick={() => {
                    cancelPresetPlayback();
                    setExhibitionMode("guided");
                    setGuidedStepReadyForNext(false);
                  }}
                >
                  {t(language, "modeGuided")}
                </button>
                <button
                  className={`mode-btn ${exhibitionMode === "free" ? "active" : ""}`}
                  onClick={() => {
                    cancelPresetPlayback();
                    setExhibitionMode("free");
                    setGuidedStepReadyForNext(false);
                  }}
                >
                  {t(language, "modeFree")}
                </button>

                {exhibitionMode === "guided" && (
                  <button
                    className="rail-btn"
                    onClick={handleGuidedNext}
                    disabled={isPresetPlaying || loading || !guidedStepReadyForNext}
                  >
                    {t(language, "guidedNext")} ({Math.min(guidedStepIndex + 1, totalSteps)}/{totalSteps})
                  </button>
                )}
              </div>

              <div className="single-step-card-wrap">
                <div className={`suggestion-card single-card ${
                  exhibitionMode === "guided" ? "current" : ""
                }`}>
                  <div className="suggestion-head">
                    <span className="suggestion-index">{activeIndex + 1}</span>
                    <span className="suggestion-type">
                      {activeStep?.type === "guide"
                        ? t(language, "stepTypeGuide")
                        : t(language, "stepTypeQA")}
                    </span>
                  </div>
                  <div className="suggestion-title">{cardTitle}</div>
                  <button
                    className="suggestion-cta"
                    onClick={() => handlePickStep(activeIndex)}
                    disabled={isPresetPlaying || loading}
                  >
                    {t(language, "tryThisQuestion")}
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </div>

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
              {item?.meta?.source === "preset" && (
                <div className="message-badge preset">{t(language, "badgePreset")}</div>
              )}
              {item?.meta?.source === "system" && (
                <div className="message-badge system">{t(language, "badgeSystem")}</div>
              )}
              {item.content}
            </div>
          </div>
        ))}

        {presetTyping && (
          <div className="message-row message-row-assistant">
            <div className="message-bubble message-assistant typing">
              {t(language, "presetTyping")}
            </div>
          </div>
        )}

        {loading && (
          <div className="message-row message-row-assistant">
            <div className="message-bubble message-assistant typing">
              {t(language, "chatTyping")}
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
          placeholder={t(language, "chatPlaceholder")}
          disabled={loading}
          rows={1}
        />

        <button
          className="send-button"
          onClick={handleSendClick}
          disabled={loading}
          aria-label={t(language, "send")}
          title={t(language, "send")}
        >
          <Send sx={{ transform: "scale(1.3)" }} />
        </button>
      </div>
    </div>
  );
};

export default Segments;