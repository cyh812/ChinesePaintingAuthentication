import React, { useContext, useCallback } from "react";
import * as _ from "underscore";
import Tool from "./Tool";
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";

interface StageProps {
  zoomLevel: number;
  onZoomChange: (nextZoom: number) => void;
  currentLabel: 0 | 1 | null;                 // ✅ 允许 null
  onHoverChange: (p: modelInputProps | null) => void; // ✅ 悬停预览点
  onHoverEnd: () => void;                      // ✅ 清空预览
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const STEP = 0.1;

const Stage: React.FC<StageProps> = ({
  zoomLevel,
  onZoomChange,
  currentLabel,
  onHoverChange,
  onHoverEnd,
}) => {
  const {
    clicks: [clicks, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  const toImageCoords = (e: any) => {
    const el = e.nativeEvent.target as HTMLImageElement;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    return { x, y };
  };

  // 点击（仅在按钮激活时生效）
  const handleClick = (e: any) => {
    if (currentLabel === null) return; // ❗未激活不落点
    const { x, y } = toImageCoords(e);
    const click: modelInputProps = { x, y, clickType: currentLabel };
    setClicks([...(clicks ?? []), click]);
  };

  // 悬停预览（仅在未激活时生效）
  const handleMouseMove = _.throttle((e: any) => {
    if (currentLabel !== null) return; // 已激活就不做悬停预览
    const { x, y } = toImageCoords(e);
    onHoverChange({ x, y, clickType: 1 }); // 预览用正点 label=1
  }, 30);

  const handleMouseLeave = () => {
    onHoverEnd(); // 清空预览
  };

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const next = e.deltaY < 0 ? zoomLevel + STEP : zoomLevel - STEP;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (clamped !== zoomLevel) onZoomChange(clamped);
  }, [zoomLevel, onZoomChange]);

  const zoomStyle = { width: `${100 * zoomLevel}%`, height: `${100 * zoomLevel}%` };
  const flexCenter = "flex items-center justify-center";

  return (
    <div className={`${flexCenter} w-full h-full overflow-hidden`} onWheel={handleWheel}>
      <div className={`${flexCenter} relative`} style={zoomStyle}>
        {/* <Tool
          handleMouseMove={handleMouseMove}
          handleClick={handleClick}
          handleMouseLeave={handleMouseLeave}
        /> */}
        <Tool
          handleMouseMove={handleMouseMove}
          handleClick={handleClick}
          handleMouseLeave={handleMouseLeave}
          currentLabel={currentLabel}   // ← 新增
        />
      </div>
    </div>
  );
};

export default Stage;
