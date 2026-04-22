import React, { useMemo, useState } from "react";
import "./PaintingNodeDetail.css";
import PaintingDetailSAM from "./PaintingDetailSAM";
import PaintingData from "../../assets/Paintings.json";
import PaintingDataEn from "../../assets/Paintings_en.json";
import paintingsegments from "../../assets/Painting_paintings.json";
import paintingsegmentsEn from "../../assets/Painting_paintings_en.json";
import { LANG_EN, t } from "../../i18n/texts";

const PaintingNodeDetail = ({ node, onPaintingSegmentSearchResult, language }) => {
  const activePaintingData = language === LANG_EN ? PaintingDataEn : PaintingData;
  const activeSegmentsData = language === LANG_EN ? paintingsegmentsEn : paintingsegments;
  const paintingId = node?.id || "";

  const [searchSignal, setSearchSignal] = useState(0);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(null);

  // 用 id 和 “编号” 对齐查找
  const paintingRecord = activePaintingData.find(
    (item) => item["编号"] === paintingId || item["id"] === paintingId
  );

  const paintingTitle =
    paintingRecord?.["总作品名"] ||
    paintingRecord?.["作品名"] ||
    paintingRecord?.["title"] ||
    paintingRecord?.["name"] ||
    node?.name ||
    t(language, "unnamedPainting");

  const authorName =
    paintingRecord?.["作者名"] ||
    paintingRecord?.["author"] ||
    paintingRecord?.["artist"] ||
    t(language, "unknown");
  const creationTime =
    paintingRecord?.["创作时间"] ||
    paintingRecord?.["creation_time"] ||
    paintingRecord?.["date"] ||
    t(language, "unknown");
  const material =
    paintingRecord?.["用色"] ||
    paintingRecord?.["material"] ||
    paintingRecord?.["medium"] ||
    t(language, "unknown");
  const size =
    paintingRecord?.["尺寸"] ||
    paintingRecord?.["size"] ||
    paintingRecord?.["dimensions_cm"] ||
    t(language, "unknown");

  // 按规则直接拼接路径
  const imagePath = `./assets/data/Paintings_merged/${paintingId}.jpg`;
  const embeddingPath = `./assets/data/Paintings_npy/${paintingId}.npy`;

  // 根据真实数据动态生成当前 painting 的切片列表
  const segmentList = useMemo(() => {
    const currentPaintingSegments = activeSegmentsData?.[paintingId];
    if (!currentPaintingSegments) return [];

    return Object.keys(currentPaintingSegments).map((sliceId) => ({
      id: sliceId,
      image: `./assets/data/pic/${paintingId}/${sliceId}.png`,
    }));
  }, [activeSegmentsData, paintingId]);

  // 根据 painting id 获取画作名称
  const getPaintingNameById = (id) => {
    const record = activePaintingData.find((item) => item["编号"] === id || item["id"] === id);
    return (
      record?.["总作品名"] ||
      record?.["作品名"] ||
      record?.["title"] ||
      record?.["name"] ||
      record?.["编号"] ||
      record?.["id"] ||
      id
    );
  };

  // 真正执行 segment -> painting 相似检索结果封装
  const buildSegmentSearchResult = (topK) => {
    if (!paintingId) return null;
    if (selectedSegmentIndex === null) return null;
    if (!segmentList[selectedSegmentIndex]) return null;

    const selectedSegment = segmentList[selectedSegmentIndex];
    const selectedSliceId = selectedSegment.id;

    const currentPaintingSegments = activeSegmentsData?.[paintingId];
    const selectedSliceData = currentPaintingSegments?.[selectedSliceId];

    if (!selectedSliceData) return null;

    const results = [];

    for (let i = 1; i <= topK; i++) {
      const topKey = `top${i}`;
      const item = selectedSliceData?.[topKey];
      if (!item) continue;

      const similarPaintingId = item.painting_id || "";
      const similarSliceId = item.slice_id || "";
      const similarScore = item.score ?? null;
      const similarPaintingName = getPaintingNameById(similarPaintingId);

      results.push({
        rank: i,
        paintingId: similarPaintingId,
        sliceId: similarSliceId,
        paintingName: similarPaintingName,
        score: similarScore,
      });
    }

    return {
      type: "painting_segment_similarity",
      query: {
        paintingId,
        sliceId: selectedSliceId,
        topK,
      },
      results,
    };
  };

  // 接收 StageMenu 的搜索信号
  const handleSegmentSearch = (value) => {
    console.log("收到 StageMenu 传回的搜索信号：", value);
    setSearchSignal(value);

    // 条件 1：只有点击搜索且值 > 0 时才触发
    if (!value || value <= 0) return;

    // 条件 2：必须先选中一个 segment
    if (selectedSegmentIndex === null) {
      console.log("当前没有选中的 segment，无法执行 painting-to-painting 检索。");
      return;
    }

    const payload = buildSegmentSearchResult(value);

    if (!payload) {
      console.log("未能构建有效的 segment 检索结果。");
      return;
    }

    console.log("封装后的 painting segment similarity 数据：", payload);

    if (onPaintingSegmentSearchResult) {
      onPaintingSegmentSearchResult(payload);
    }
  };

  return (
    <div className="painting-node-detail-card">
      <div className="painting-node-detail-title">{paintingTitle}</div>

      <div className="painting-node-detail-info-list">
        <div className="painting-node-detail-info-item painting-node-detail-info-row">
          <div className="painting-node-detail-inline-group">
            <span className="painting-node-detail-label">{t(language, "author")}</span>
            <span className="painting-node-detail-value">{authorName}</span>
          </div>

          <div className="painting-node-detail-inline-group">
            <span className="painting-node-detail-label">{t(language, "era")}</span>
            <span className="painting-node-detail-value">{creationTime}</span>
          </div>
        </div>

        <div className="painting-node-detail-info-item painting-node-detail-info-row">
          <div className="painting-node-detail-inline-group">
            <span className="painting-node-detail-label">{t(language, "material")}</span>
            <span className="painting-node-detail-value">{material}</span>
          </div>

          <div className="painting-node-detail-inline-group">
            <span className="painting-node-detail-label">{t(language, "size")}</span>
            <span className="painting-node-detail-value">{size}</span>
          </div>
        </div>
      </div>

      <div className="painting-node-detail-stage-box">
        <PaintingDetailSAM
          imagePath={imagePath}
          embeddingPath={embeddingPath}
          paintingId={paintingId}
          onSegmentSearch={handleSegmentSearch}
        />
      </div>

      <div className="painting-node-detail-gallery-box">
        <div className="painting-node-detail-gallery-scroll">
          {segmentList.length === 0 ? (
            <div className="painting-node-detail-gallery-empty">
              {t(language, "noSegments")}
            </div>
          ) : (
            segmentList.map((segment, index) => (
              <div
                key={segment.id}
                className={`painting-node-detail-segment-card ${
                  selectedSegmentIndex === index ? "is-selected" : ""
                }`}
                onClick={() => setSelectedSegmentIndex(index)}
              >
                <div className="painting-node-detail-segment-image-wrapper">
                  <img
                    className="painting-node-detail-segment-image"
                    src={segment.image}
                    alt={segment.id}
                    onError={(e) => {
                      e.currentTarget.src = "./assets/img/painting.png";
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaintingNodeDetail;