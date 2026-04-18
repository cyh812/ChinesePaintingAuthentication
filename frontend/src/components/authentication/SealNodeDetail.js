import React from "react";
import "./SealNodeDetail.css";

const SealNodeDetail = ({ node }) => {
  const sealId = node?.id || "";
  const sealName = node?.name || "未命名印章";

  // 根据 seal id 动态拼接真实图片路径
  const sealImage = sealId
    ? `../../assets/data/reference_seals/ref_${sealId}.png`
    : "/assets/img/seal.png";

  return (
    <div className="seal-node-detail-card">
      <div className="seal-node-detail-left">
        <div className="seal-node-detail-image-wrapper">
          <img
            className="seal-node-detail-image"
            src={sealImage}
            alt={sealName}
            onError={(e) => {
              e.currentTarget.src = "/assets/img/seal.png";
            }}
          />
        </div>
      </div>

      <div className="seal-node-detail-right">
        <div className="seal-node-detail-title">{sealName}</div>

        <div className="seal-node-detail-info-list">
          <div className="seal-node-detail-info-item">
            <span className="seal-node-detail-label">印章归属: 石涛</span>
          </div>

          <div className="seal-node-detail-info-item">
            <span className="seal-node-detail-label">印章来源</span>
            <span className="seal-node-detail-value">
              上海博物馆编《中国书画家印鉴款识》(文物出版社，1987.12)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SealNodeDetail;