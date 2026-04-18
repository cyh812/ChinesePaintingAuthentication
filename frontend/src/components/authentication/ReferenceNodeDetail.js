import React from "react";
import "./ReferenceNodeDetail.css";
import ReferenceData from "../../assets/References.json";
import ReferenceDataEn from "../../assets/References_en.json";
import { LANG_EN, t } from "../../i18n/texts";

const ReferenceNodeDetail = ({ node, language }) => {
  const activeReferenceData = language === LANG_EN ? ReferenceDataEn : ReferenceData;
  const referenceId = node?.id || "";

  // 根据 reference_id 匹配真实数据
  const referenceRecord = activeReferenceData.find(
    (item) => item.reference_id === referenceId
  );

  const referenceTitle =
    referenceRecord?.info || node?.name || t(language, "unnamedReference");

  const referenceStatement =
    referenceRecord?.statement || t(language, "noReferenceStatement");

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