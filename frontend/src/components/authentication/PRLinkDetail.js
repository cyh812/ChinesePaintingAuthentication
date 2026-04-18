import React from "react";
import "./PRLinkDetail.css";
import reference from "../../assets/References.json";
import referenceEn from "../../assets/References_en.json";
import { LANG_EN, t } from "../../i18n/texts";

const PRLinkDetail = ({ link, language }) => {
  const activeReference = language === LANG_EN ? referenceEn : reference;
  const sourceId = link?.data?.source || "";
  const targetId = link?.data?.target || "";

  // 根据 reference_id 匹配对应的 info
  const referenceItem = activeReference.find((item) => item.reference_id === targetId);
  const textRecord =
    language === LANG_EN
      ? referenceItem?.statement || link?.data?.info?.["text record"] || t(language, "noTextRecord")
      : link?.data?.info?.["text record"] || t(language, "noTextRecord");
  const referenceCitation = referenceItem?.info || t(language, "noReferenceInfo");

  return (
    <div className="pr-link-detail-card">
      <div className="pr-link-detail-top">
        <div className="pr-link-detail-text-record">{textRecord}</div>
      </div>

      <div className="pr-link-detail-bottom">
        <div className="pr-link-detail-meta">
          <span className="pr-link-detail-meta-id">
            {t(language, "paintingLabel")}: {sourceId}
          </span>
          <span className="pr-link-detail-meta-divider">|</span>
          <span className="pr-link-detail-meta-id">
            {t(language, "referenceLabel")}: {targetId}
          </span>
        </div>

        <div className="pr-link-detail-citation">{referenceCitation}</div>
      </div>
    </div>
  );
};

export default PRLinkDetail;