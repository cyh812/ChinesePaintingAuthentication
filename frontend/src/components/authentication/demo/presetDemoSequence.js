import { LANG_EN } from "../../../i18n/texts";

export const PRESET_DEMO_SEQUENCE = {
  id: "hangzhou-landscape-guided-demo",
  title: {
    zh: "快速导览",
    en: "Quick Tour",
  },
  steps: [
    {
      id: "step-1-hangzhou-painting",
      intent: "find-hangzhou-painting",
      type: "qa",
      timing: {
        questionDelayMs: 450,
        answerDelayMs: 900,
      },
      suggestionLabel: {
        zh: "先从杭州山水问题开始",
        en: "Start from the Hangzhou landscape question",
      },
      question: {
        zh: "哪一幅是描绘杭州山水风光的作品？",
        en: "Which painting depicts the landscape scenery of Hangzhou?",
      },
      followupHint: {
        zh: "可以继续查看这幅画的切片相似结果。",
        en: "You can continue by checking segment-level similarity for this painting.",
      },
      knowledgePayload: [
        {
          编号: "D011518",
          总作品名: "余杭看山图",
          seals: [],
          考证: [],
        },
      ],
    },
    {
      id: "step-2-guided-segment-search",
      intent: "guide-segment-search",
      type: "guide",
      timing: {
        questionDelayMs: 250,
        answerDelayMs: 350,
      },
      suggestionLabel: {
        zh: "引导观众做一次切片检索",
        en: "Guide the visitor to run a segment search",
      },
      guideText: {
        zh: "引导操作：请点击《余杭看山图》节点，在详情里选择第一个切片，把“搜索相近切片”设为 1，然后点击搜索。预期会出现《搜尽奇峰打草稿》。",
        en: "Guided action: click the ‘Viewing the Mountains at Yuhang’ node, choose the first segment in the detail panel, set similar segment count to 1, then click search. Expected result: ‘Drafting from the Myriad Strange Peaks’ appears.",
      },
    },
    {
      id: "step-3-seals-of-target-painting",
      intent: "ask-seals",
      type: "qa",
      timing: {
        questionDelayMs: 450,
        answerDelayMs: 1100,
      },
      suggestionLabel: {
        zh: "追问这幅画有哪些印章",
        en: "Ask which seals are on this painting",
      },
      question: {
        zh: "搜尽奇峰打草稿有哪些印章？",
        en: "What seals appear on ‘Drafting from the Myriad Strange Peaks’?",
      },
      followupHint: {
        zh: "你也可以点击任一印章节点查看来源信息。",
        en: "You can also click any seal node to inspect provenance details.",
      },
      knowledgePayload: [
        {
          编号: "D004388",
          总作品名: "搜尽奇峰打草稿",
          seals: [
            {
              "seal id": "0004",
              similarity: 0.6991,
              name: "冰雪悟前身",
            },
            {
              "seal id": "0046",
              similarity: 0.6487,
              name: "苦瓜和尚2",
            },
            {
              "seal id": "0049",
              similarity: 0.6983,
              name: "老济1",
            },
            {
              "seal id": "0070",
              similarity: 0.7434,
              name: "石涛2",
            },
          ],
          考证: [],
        },
      ],
    },
    {
      id: "step-4-references-of-target-painting",
      intent: "ask-references",
      type: "qa",
      timing: {
        questionDelayMs: 450,
        answerDelayMs: 1200,
      },
      suggestionLabel: {
        zh: "再看这幅画有哪些参考文献",
        en: "Then check references mentioning this painting",
      },
      question: {
        zh: "有哪些参考资料提到了搜尽奇峰打草稿？",
        en: "Which references mention ‘Drafting from the Myriad Strange Peaks’?",
      },
      followupHint: {
        zh: "点击任意 P-R 连边可查看对应文本记录。",
        en: "Click any P-R link to view the related text record.",
      },
      knowledgePayload: [
        {
          编号: "D004388",
          总作品名: "搜尽奇峰打草稿",
          seals: [],
          考证: [
            {
              reference_id: "A2514",
              info: "Richard Vinograd. Reminiscences of Ch’in-huai",
              text_record:
                "这既是石涛继宣城、南京时期之后画风显著变迁所致，更是他北游以来感受北方山川，观览宋元收藏并与王原祁等正统派画家交往的结果。",
            },
            {
              reference_id: "A2507",
              info: "杨新．四僧绘画",
              text_record:
                "画面中段出现的“长城”是研究者所关注的话题之一，或以为所绘乃居庸关、八达岭附近的景色。",
            },
            {
              reference_id: "A2515",
              info: "石涛. 画语録·山川章第八",
              text_record:
                "画卷隶书标题“搜尽奇峰打草稿”自有其深意，石涛不仅在许多作品中使用该句，而且在晚年所撰着的《画语録》中对其内涵有专门的论述。",
            },
            {
              reference_id: "A2502",
              info: "乔迅．石涛：清初中国的绘画与现代性",
              text_record:
                "由此可见，本图乃石涛重要绘画主张的直接展现，而卷首标题则是对本图最好的自我诠释。",
            },
          ],
        },
      ],
    },
  ],
};

export const getLocalizedStepText = (step, language) => {
  const isEnglish = language === LANG_EN;
  return {
    title: isEnglish ? step?.title?.en : step?.title?.zh,
    suggestionLabel: isEnglish
      ? step?.suggestionLabel?.en
      : step?.suggestionLabel?.zh,
    question: isEnglish ? step?.question?.en : step?.question?.zh,
    guideText: isEnglish ? step?.guideText?.en : step?.guideText?.zh,
    followupHint: isEnglish ? step?.followupHint?.en : step?.followupHint?.zh,
  };
};

export const getTotalDemoSteps = () => PRESET_DEMO_SEQUENCE.steps.length;

export const getDemoStepByIndex = (index) => PRESET_DEMO_SEQUENCE.steps[index] || null;
