import React from "react";
import "./ReferenceNodeDetail.css";
import ReferenceData from "../../assets/References.json";

const ReferenceNodeDetail = ({ node }) => {
  const referenceId = node?.id || "";

  // 根据 reference_id 匹配真实数据
  const referenceRecord = ReferenceData.find(
    (item) => item.reference_id === referenceId
  );

  const referenceTitle =
    referenceRecord?.info || node?.name || "未命名考证记录";

  const referenceStatement =
    referenceRecord?.statement || "暂无相关文献说明。";

  return (
    <div className="reference-node-detail-card">
      <div className="reference-node-detail-title-box">
        <div className="reference-node-detail-title">{referenceTitle}</div>
      </div>

      <div className="reference-node-detail-statement-box">
        <div className="reference-node-detail-statement">
          {referenceStatement}
        </div>
      </div>
    </div>
  );
};

export default ReferenceNodeDetail;