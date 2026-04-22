import React from "react";
import "./PSLinkDetail.css";
import PS from "../../assets/Seal_to_seal.json";
import PSEn from "../../assets/Seal_to_seal_en.json";
import { LANG_EN } from "../../i18n/texts";

const PSLinkDetail = ({ link, language }) => {
  const activePS = language === LANG_EN ? PSEn : PS;
  const sourceId = link?.data?.source || "";
  const targetId = link?.data?.target || "";
  const similarity = link?.data?.info?.angle ?? 0;

  // 读取对应 painting -> seal 的映射记录
  const psEntryList = activePS?.[sourceId]?.[targetId] || [];
  const psEntry = Array.isArray(psEntryList) && psEntryList.length > 0 ? psEntryList[0] : null;

  // 左侧：截取的印章图
  const extractedSealPath = psEntry?.["截取的印章url"] || psEntry?.["cropped_seal_url"];
  const extractedSealImage = extractedSealPath
    ? `./assets/data/${extractedSealPath}`
    : "./assets/img/seal.png";

  // 右侧：标准件图
  const referenceSealPath = psEntry?.["标准件url"] || psEntry?.["standard_seal_url"];
  const referenceSealImage = referenceSealPath
    ? `./assets/data/${referenceSealPath}`
    : "./assets/img/seal.png";

  return (
    <div className="ps-link-detail-card">
      <div className="ps-link-detail-left">
        <div className="ps-link-detail-image-wrapper">
          <img
            className="ps-link-detail-image"
            src={extractedSealImage}
            alt={sourceId}
            onError={(e) => {
              e.currentTarget.src = "./assets/img/seal.png";
            }}
          />
        </div>
      </div>

      <div className="ps-link-detail-middle">
        <div className="ps-link-detail-score">
          {typeof similarity === "number" ? similarity.toFixed(2) : similarity}
        </div>

        <div className="ps-link-detail-bar-wrapper">
          <div
            className="ps-link-detail-bar-fill"
            style={{
              height: `${Math.max(8, Math.min(100, Number(similarity) * 100))}%`,
            }}
          />
        </div>
      </div>

      <div className="ps-link-detail-right">
        <div className="ps-link-detail-image-wrapper">
          <img
            className="ps-link-detail-image"
            src={referenceSealImage}
            alt={targetId}
            onError={(e) => {
              e.currentTarget.src = "./assets/img/seal.png";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PSLinkDetail;