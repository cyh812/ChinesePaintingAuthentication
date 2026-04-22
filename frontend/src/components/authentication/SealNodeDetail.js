import React from "react";
import "./SealNodeDetail.css";
import { t } from "../../i18n/texts";

const SealNodeDetail = ({ node, language }) => {
  const sealId = node?.id || "";
  const sealName = node?.name || t(language, "unnamedSeal");

  // 根据 seal id 动态拼接真实图片路径
  const sealImage = sealId
    ? `./assets/data/reference_seals/ref_${sealId}.png`
    : "./assets/img/seal.png";

  return (
    <div className="seal-node-detail-card">
      <div className="seal-node-detail-left">
        <div className="seal-node-detail-image-wrapper">
          <img
            className="seal-node-detail-image"
            src={sealImage}
            alt={sealName}
            onError={(e) => {
              e.currentTarget.src = "./assets/img/seal.png";
            }}
          />
        </div>
      </div>

      <div className="seal-node-detail-right">
        <div className="seal-node-detail-title">{sealName}</div>

        <div className="seal-node-detail-info-list">
          <div className="seal-node-detail-info-item">
            <span className="seal-node-detail-label">
              {t(language, "sealOwner")}: {t(language, "ownerShiTao")}
            </span>
          </div>

          <div className="seal-node-detail-info-item">
            <span className="seal-node-detail-label">{t(language, "sealSource")}</span>
            <span className="seal-node-detail-value">
              {t(language, "sealSourceValue")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SealNodeDetail;