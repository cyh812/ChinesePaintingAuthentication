import React, { useContext, useCallback, useMemo, useRef, useEffect, useState } from "react";
import * as _ from "underscore";
import Tool from "./Tool";
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";
import { exportMaskedPNG } from "./helpers/exportMask";

export const stageFocusManager = {
  focusCallback: null as (() => void) | null
};

interface StageProps {
  zoomLevel: number;
  onZoomChange: (nextZoom: number) => void;
  currentLabel: 0 | 1 | null;
  onHoverChange: (p: modelInputProps | null) => void;
  onHoverEnd: () => void;
  panX: number;                      // 添加
  panY: number;                      // 添加
  onPanXChange: (x: number) => void; // 添加
  onPanYChange: (y: number) => void; // 添加
}

const MIN_ZOOM = 0.01;
const MAX_ZOOM = 5;
const STEP = 0.05;

const Stage: React.FC<StageProps> = ({
  zoomLevel,
  onZoomChange,
  currentLabel,
  onHoverChange,
  onHoverEnd,
  panX,                 // 添加
  panY,                 // 添加
  onPanXChange,         // 添加
  onPanYChange          // 添加
}) => {
  const {
    clicks: [clicks, setClicks],
    image: [image],
    maskImg: [maskImg],
  } = useContext(AppContext)!;

  // ====== 新增：平移状态（像素）======
  //const [panX, setPanX] = useState(0); // 横向平移
  // 如需上下移动，可加 panY，并在 transform 里用 panY
  //const [panY, setPanY] = useState(0);

  // 使外层能接收键盘事件
  const viewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // 初次显示时自动聚焦，确保能直接用方向键
    stageFocusManager.focusCallback = () => {
      viewportRef.current?.focus();
    };
    viewportRef.current?.focus();
    return () => {
      if (stageFocusManager.focusCallback === viewportRef.current?.focus) {
        stageFocusManager.focusCallback = null;
      }
    };
  }, []);

  // 键盘左右移动
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // 若焦点在输入/选择控件上，忽略快捷键，避免干扰输入
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // === 导出（Space / Shift+Space）===
      if (e.code === "Space") {
        e.preventDefault();
        if (image && maskImg) {
          const mode = e.shiftKey ? "highlight" : "cutout";
          exportMaskedPNG(image, maskImg, `segment-${Date.now()}.png`, mode);
        }
        return; // 本次事件已处理，直接返回
      }

      // === 左右平移（ArrowLeft / ArrowRight）===
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" 
       || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const PAN_STEP = Math.max(20, 40 * zoomLevel); // 缩放越大步长越大
        if (e.key === "ArrowLeft") {
          onPanXChange(panX + PAN_STEP);   // 画面向右移动
        } else if (e.key === "ArrowRight") {
          onPanXChange(panX - PAN_STEP);   // 画面向左移动
        } else if (e.key === "ArrowUp") {
          onPanYChange(panY + PAN_STEP);   // 画面向下移动
        } else if (e.key === "ArrowDown") {
          onPanYChange(panY - PAN_STEP);   // 画面向上移动
        }
      }
    },
    [zoomLevel, image, maskImg, panX, panY, onPanXChange, onPanYChange]
  );

  const handleKeyDown2 = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (!image || !maskImg) return;
      // 按住 Shift 导出“抠图”模式，否则默认“高亮”模式
      const mode = e.shiftKey ? "cutout" : "highlight";
      exportMaskedPNG(image, maskImg, `segment-${Date.now()}.png`, mode);
    }
    // 你已有的左右方向键逻辑可放这里一起处理
  }, [image, maskImg]);

  // ====== 其余保留原逻辑 ======
  //将鼠标点击的屏幕坐标转换为图像的原始坐标
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

  //处理鼠标点击，在点击位置添加标记点
  const handleClick = (e: any) => {
    if (currentLabel === null) return;
    const { x, y } = toImageCoords(e);
    setClicks([...(clicks ?? []), { x, y, clickType: currentLabel }]);
  };

  //使用节流优化鼠标移动事件，提供悬停预览功能
  const throttledHoverRef = useRef<(e: any) => void>();
  useEffect(() => {
    throttledHoverRef.current = _.throttle((e: any) => {
      if (currentLabel !== null) return;
      const { x, y } = toImageCoords(e);
      onHoverChange({ x, y, clickType: 1 });
    }, 30);
    return () => (throttledHoverRef.current as any)?.cancel?.();
  }, [currentLabel, image, onHoverChange]);

  const handleMouseMove = useCallback((e: any) => {
    throttledHoverRef.current && throttledHoverRef.current(e);
  }, []);

  const handleMouseLeave = () => onHoverEnd();

  //处理鼠标滚轮事件实现图像缩放
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const next = e.deltaY < 0 ? zoomLevel + STEP : zoomLevel - STEP;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (clamped !== zoomLevel) onZoomChange(clamped);
  }, [zoomLevel, onZoomChange]);

  // 视口：裁剪溢出 + 可获得焦点 + 键盘导航
  const viewportClass =
    "flex items-center justify-center w-full h-full overflow-hidden relative";

  // 内容层：像素尺寸，并叠加 translate 平移
  const contentStyle: React.CSSProperties = useMemo(() => (
    image ? {
      position: "relative",
      width: `${image.width * zoomLevel}px`,
      height: `${image.height * zoomLevel}px`,
      transform: `translate3d(${panX}px, ${panY}px, 0)`, // ⬅⬅ 只左右移动
      willChange: "transform",
      flex: "0 0 auto",
      maxWidth: "none",
      maxHeight: "none",
    } : {
      position: "relative",
      transform: `translate3d(${panX}px, ${panY}px, 0)`,
      flex: "0 0 auto",
      maxWidth: "none",
      maxHeight: "none",
    }
  ), [image, zoomLevel, panX, panY]);

  return (
    <div
      ref={viewportRef}
      className={viewportClass}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      tabIndex={0}             // 使其可聚焦接收键盘事件
      style={{ outline: "none" }} // 不显示聚焦虚线（可去掉）
    >
      <div style={contentStyle}>
        <Tool
          handleMouseMove={handleMouseMove}
          handleClick={handleClick}
          handleMouseLeave={handleMouseLeave}
          currentLabel={currentLabel}
        />
      </div>
    </div>
  );
};

export default Stage;
