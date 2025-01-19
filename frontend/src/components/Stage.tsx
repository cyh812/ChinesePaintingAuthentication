import React, { useContext } from "react";
import * as _ from "underscore";
import Tool from "./Tool";
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";


interface StageProps {
  zoomLevel: number; // 接收父组件传递的 zoomLevel
}

const Stage: React.FC<StageProps> = ({ zoomLevel }) => {
  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  const getClick = (x: number, y: number): modelInputProps => {
    const clickType = 1;
    return { x, y, clickType };
  };

  // Get mouse position and scale the (x, y) coordinates back to the natural
  // scale of the image. Update the state of clicks with setClicks to trigger
  // the ONNX model to run and generate a new mask via a useEffect in App.tsx
  const handleMouseMove = _.throttle((e: any) => {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y);
    if (click) setClicks([click]);
  }, 15);

  // 计算缩放后的宽度和高度百分比
  const zoomStyle = {
    width: `${(100 * zoomLevel)}%`,  // 根据 zoomLevel 修改宽度
    height: `${(100 * zoomLevel)}%`, // 根据 zoomLevel 修改高度
  };

  const flexCenterClasses = "flex items-center justify-center";
  return (
    <div className={`${flexCenterClasses} w-full h-full`}>
      <div className={`${flexCenterClasses} relative`} style={zoomStyle}>
        <Tool handleMouseMove={handleMouseMove} />
      </div>
    </div>
  );
};

export default Stage;

{/* <div className={`${flexCenterClasses} w-full h-full`}>
<div className={`${flexCenterClasses}`}
  style={{
    width: `${scale}%`,  // 宽度根据 scale 值动态变化
    height: `${scale}%`, // 高度根据 scale 值动态变化
  }}>
  <Tool handleMouseMove={handleMouseMove} />
</div>
</div> */}