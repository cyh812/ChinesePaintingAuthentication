import { LANG_EN } from "../../../i18n/texts";
import { getLocalizedStepText } from "./presetDemoSequence";
import PaintingsZh from "../../../assets/Paintings.json";
import PaintingsEn from "../../../assets/Paintings_en.json";
import SealsZh from "../../../assets/Seals.json";
import SealsEn from "../../../assets/Seals_en.json";
import ReferencesZh from "../../../assets/References.json";
import ReferencesEn from "../../../assets/References_en.json";

const paintingNameZhMap = new Map(
  (PaintingsZh || []).map((item) => [item["编号"], item["总作品名"] || item["作品名"]])
);

const paintingNameEnMap = new Map(
  (PaintingsEn || []).map((item) => [item.id, item.overall_title || item.title])
);

const sealNameZhMap = new Map(
  (SealsZh || []).map((item) => [item.seal_code, item.name])
);

const sealNameEnMap = new Map(
  (SealsEn || []).map((item) => [item.seal_code, item.name])
);

const referenceInfoZhMap = new Map(
  (ReferencesZh || []).map((item) => [item.reference_id, item.info])
);

const referenceInfoEnMap = new Map(
  (ReferencesEn || []).map((item) => [item.reference_id, item.info])
);

function summarizeKnowledge(knowledgePayload = []) {
  const items = Array.isArray(knowledgePayload) ? knowledgePayload : [];

  const paintingIds = [];
  const paintingFallbackNames = [];
  const sealIds = [];
  const sealFallbackNames = [];
  const referenceIds = [];
  const referenceFallbackInfos = [];

  items.forEach((item) => {
    const paintingId = item["编号"] || item.id;
    const paintingName = item["总作品名"] || item.title || item.name;

    if (paintingId) {
      paintingIds.push(paintingId);
    }
    if (paintingName) {
      paintingFallbackNames.push(paintingName);
    }

    const seals = Array.isArray(item.seals)
      ? item.seals
      : Array.isArray(item["印章"])
        ? item["印章"]
        : [];

    seals.forEach((seal) => {
      const sealId = seal["seal id"] || seal.id || seal.seal_code;
      const sealName = seal.name || seal["印章名"];

      if (sealId) {
        sealIds.push(sealId);
      }
      if (sealName) {
        sealFallbackNames.push(sealName);
      }
    });

    const references = Array.isArray(item["考证"]) ? item["考证"] : [];
    references.forEach((ref) => {
      const refId = ref.reference_id || ref.id;
      const info = ref.info || ref.title;

      if (refId) {
        referenceIds.push(refId);
      }
      if (info) {
        referenceFallbackInfos.push(info);
      }
    });
  });

  return {
    paintingIds: [...new Set(paintingIds)],
    paintingFallbackNames: [...new Set(paintingFallbackNames)],
    sealIds: [...new Set(sealIds)],
    sealFallbackNames: [...new Set(sealFallbackNames)],
    referenceIds: [...new Set(referenceIds)],
    referenceFallbackInfos: [...new Set(referenceFallbackInfos)],
  };
}

function resolveLocalizedNames(language, summary) {
  const isEnglish = language === LANG_EN;

  const paintingMap = isEnglish ? paintingNameEnMap : paintingNameZhMap;
  const sealMap = isEnglish ? sealNameEnMap : sealNameZhMap;
  const referenceMap = isEnglish ? referenceInfoEnMap : referenceInfoZhMap;

  const paintingNames = summary.paintingIds
    .map((id, index) => paintingMap.get(id) || summary.paintingFallbackNames[index])
    .filter(Boolean);

  const sealNames = summary.sealIds
    .map((id, index) => sealMap.get(id) || summary.sealFallbackNames[index])
    .filter(Boolean);

  const referenceInfos = summary.referenceIds
    .map((id, index) => referenceMap.get(id) || summary.referenceFallbackInfos[index])
    .filter(Boolean);

  // 若 payload 中没有 id，兜底保留原始文本
  if (paintingNames.length === 0 && summary.paintingFallbackNames.length > 0) {
    paintingNames.push(...summary.paintingFallbackNames);
  }

  if (sealNames.length === 0 && summary.sealFallbackNames.length > 0) {
    sealNames.push(...summary.sealFallbackNames);
  }

  if (referenceInfos.length === 0 && summary.referenceFallbackInfos.length > 0) {
    referenceInfos.push(...summary.referenceFallbackInfos);
  }

  return {
    paintingNames: [...new Set(paintingNames)],
    sealNames: [...new Set(sealNames)],
    referenceInfos: [...new Set(referenceInfos)],
  };
}

export function composePresetAnswer(step, language) {
  const localized = getLocalizedStepText(step, language);
  const isEnglish = language === LANG_EN;
  const summary = summarizeKnowledge(step?.knowledgePayload);
  const { paintingNames, sealNames, referenceInfos } = resolveLocalizedNames(
    language,
    summary
  );

  const targetPainting = paintingNames[0] || (isEnglish ? "the target painting" : "该目标画作");

  if (step?.intent === "find-hangzhou-painting") {
    if (isEnglish) {
      return `From the current curated knowledge, the painting most directly aligned with Hangzhou landscape context is ${targetPainting}. I have added its node into the graph so you can continue exploration through segment retrieval and related evidence.`;
    }

    return `从当前知识条目来看，与杭州山水语境最匹配的作品是《${targetPainting}》。我已将对应节点加入图谱，你可以继续通过切片检索和关联证据展开讲解。`;
  }

  if (step?.intent === "ask-seals") {
    const topSeals = sealNames.slice(0, 4);

    if (isEnglish) {
      const sealText = topSeals.length > 0 ? topSeals.join(", ") : "multiple seals";
      return `For ${targetPainting}, the key seal evidence includes ${sealText}. The related seal nodes and P-S relations are now visible in the graph, so visitors can click each seal for provenance details.`;
    }

    const sealText = topSeals.length > 0 ? topSeals.map((name) => `“${name}”`).join("、") : "多枚印章";
    return `关于《${targetPainting}》，目前可见的关键印章包括${sealText}。对应的印章节点与 P-S 连边已经展示在图中，观众可继续点开查看来源细节。`;
  }

  if (step?.intent === "ask-references") {
    const topRefs = referenceInfos.slice(0, 3);

    if (isEnglish) {
      const refText = topRefs.length > 0 ? topRefs.join("; ") : "several references";
      return `The painting ${targetPainting} is supported by multiple references, including ${refText}. I have injected the matching R nodes and P-R links so the audience can open link details and read the corresponding text records.`;
    }

    const refText = topRefs.length > 0 ? topRefs.join("；") : "多条参考文献";
    return `《${targetPainting}》目前可关联到多条参考文献，例如：${refText}。我已注入对应的 R 节点与 P-R 连边，接下来可点击连边查看具体文本记录。`;
  }

  if (localized?.guideText) {
    return localized.guideText;
  }

  return isEnglish
    ? "Preset answer generated from curated exhibition data."
    : "已根据展览预设数据生成回答。";
}
