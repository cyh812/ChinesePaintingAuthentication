import React from "react";
import "./PRLinkDetail.css";
import reference from "../../assets/References.json";

const PRLinkDetail = ({ link }) => {
  const sourceId = link?.data?.source || "";
  const targetId = link?.data?.target || "";
  const textRecord = link?.data?.info?.["text record"] || "暂无文本记录。";

  // 根据 reference_id 匹配对应的 info
  const referenceItem = reference.find((item) => item.reference_id === targetId);
  const referenceCitation = referenceItem?.info || "暂无参考文献信息。";

  return (
    <div className="pr-link-detail-card">
      <div className="pr-link-detail-top">
        <div className="pr-link-detail-text-record">{textRecord}</div>
      </div>

      <div className="pr-link-detail-bottom">
        <div className="pr-link-detail-meta">
          <span className="pr-link-detail-meta-id">Painting: {sourceId}</span>
          <span className="pr-link-detail-meta-divider">|</span>
          <span className="pr-link-detail-meta-id">Reference: {targetId}</span>
        </div>

        <div className="pr-link-detail-citation">{referenceCitation}</div>
      </div>
    </div>
  );
};

export default PRLinkDetail;