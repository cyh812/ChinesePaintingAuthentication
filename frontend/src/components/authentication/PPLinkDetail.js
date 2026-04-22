import React from "react";
import "./PPLinkDetail.css";

const PPLinkDetail = ({ link }) => {
  const sourceId = link?.data?.source || "";
  const targetId = link?.data?.target || "";
  const similarity = link?.data?.info?.angle ?? 0;

  const sourceSlice = link?.data?.info?.sourceslice || "";
  const targetSlice = link?.data?.info?.targetslice || "";

  // 从 slice id 中提取所属画作 id
  const sourcePaintingId = sourceSlice ? sourceSlice.split("_")[0] : "";
  const targetPaintingId = targetSlice ? targetSlice.split("_")[0] : "";

  const leftImage =
    sourceSlice && sourcePaintingId
      ? `./assets/data/pic/${sourcePaintingId}/${sourceSlice}.png`
      : "./assets/img/painting.png";

  const rightImage =
    targetSlice && targetPaintingId
      ? `./assets/data/pic/${targetPaintingId}/${targetSlice}.png`
      : "./assets/img/painting.png";

  return (
    <div className="pp-link-detail-card">
      <div className="pp-link-detail-left">
        <div className="pp-link-detail-image-wrapper">
          <img
            className="pp-link-detail-image"
            src={leftImage}
            alt={sourceSlice || sourceId}
            onError={(e) => {
              e.currentTarget.src = "./assets/img/painting.png";
            }}
          />
        </div>
      </div>

      <div className="pp-link-detail-middle">
        <div className="pp-link-detail-score">
          {typeof similarity === "number" ? similarity.toFixed(2) : similarity}
        </div>

        <div className="pp-link-detail-bar-wrapper">
          <div
            className="pp-link-detail-bar-fill"
            style={{
              height: `${Math.max(8, Math.min(100, Number(similarity) * 100))}%`,
            }}
          />
        </div>
      </div>

      <div className="pp-link-detail-right">
        <div className="pp-link-detail-image-wrapper">
          <img
            className="pp-link-detail-image"
            src={rightImage}
            alt={targetSlice || targetId}
            onError={(e) => {
              e.currentTarget.src = "./assets/img/painting.png";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PPLinkDetail;