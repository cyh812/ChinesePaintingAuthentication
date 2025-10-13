import React, { useContext, useEffect, useMemo, useState } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps, modelInputProps } from "./helpers/Interfaces";

const POS_COLOR = "#38BDF8"; // 天蓝 正
const NEG_COLOR = "#F472B6"; // 粉红 负

const Tool = ({ handleMouseMove, handleClick, handleMouseLeave, currentLabel }: ToolProps) => {
  const {
    image: [image],
    maskImg: [maskImg],
    clicks: [clicks],
  } = useContext(AppContext)!;

  // —— 与原逻辑一致：根据窗口比选择等宽/等高 —— //
  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  useEffect(() => {
    const fit = () => {
      if (!image) return;
      const imageAR = image.width / image.height;
      const screenAR = window.innerWidth / window.innerHeight;
      setShouldFitToWidth(imageAR > screenAR);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [image]);

  // —— 计算点位（用原图像素 -> 百分比） —— //
  const markers = useMemo(() => {
    if (!image || !clicks) return [];
    const w = image.width;
    const h = image.height;
    return clicks.map((p: modelInputProps, idx: number) => ({
      key: idx,
      leftPct: (p.x / w) * 100,
      topPct: (p.y / h) * 100,
      color: p.clickType === 1 ? POS_COLOR : NEG_COLOR,
    }));
  }, [clicks, image]);

  const baseSizeClass = "w-full h-full";
  const previewMode = currentLabel === null;                  // 未激活按钮 = 仅预览
  const useInverse = !previewMode && !!maskImg;               // 激活后且有 mask ⇒ 反相显示

  const maskedImageStyle: React.CSSProperties = useMemo(() => {
    if (!maskImg) return {};
    const url = `url(${maskImg.src})`;
    return {
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      WebkitMaskPosition: "center center",
      maskPosition: "center center",
    };
  }, [maskImg]);

  if (!image) return null;

  return (
    // 统一外层：relative，尺寸由“底图”决定
    <div className="relative inline-block">
      {/* 底图：决定容器尺寸；预览模式不变，点击模式下把底图变暗 */}
      <img
        src={image.src}
        className={baseSizeClass}
        style={{
          display: "block",
          filter: useInverse ? "brightness(0.45)" : undefined,
          maxWidth: "none", maxHeight: "none" 
        }}
        onMouseMove={handleMouseMove}  // 悬停预览需要事件（未激活时生效）
        onClick={handleClick}          // 激活后点击落点（未激活时 Stage 已拦截，不会落点）
        onMouseLeave={handleMouseLeave}
        draggable={false}
      />

      {/* 预览模式：保持原来的“半透明 maskImg 覆盖” */}
      {previewMode && maskImg && (
        <img
          src={maskImg.src}
          className={`absolute inset-0 ${baseSizeClass}`}
          style={{ opacity: 0.4, pointerEvents: "none" ,maxWidth: "none", maxHeight: "none" }}
          draggable={false}
        />
      )}

      {/* 点击模式：反相显示（mask 区域显示“正常亮度”的原图；非 mask 区域由底图的变暗效果体现） */}
      {!previewMode && maskImg && (
        <img
          src={image.src}
          className={`absolute inset-0 ${baseSizeClass}`}
          style={{...maskedImageStyle,maxWidth: "none", maxHeight: "none" }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={handleMouseLeave}
          draggable={false}
        />
      )}

      {/* 点位层：始终渲染（不拦截鼠标） */}
      {markers.length > 0 && (
        <div className={`absolute inset-0 ${baseSizeClass}`} style={{ pointerEvents: "none" }}>
          {markers.map((m) => (
            <div
              key={m.key}
              style={{
                position: "absolute",
                left: `${m.leftPct}%`,
                top: `${m.topPct}%`,
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 12,
                borderRadius: "9999px",
                background: m.color,
                boxShadow: "0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.25)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tool;
