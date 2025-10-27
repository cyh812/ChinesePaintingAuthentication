import { InferenceSession, Tensor } from "onnxruntime-web";
import React, { useContext, useEffect, useState } from "react";
import "./assets/scss/App.scss";
import { handleImageScale } from "./components/helpers/scaleHelper";
import { modelScaleProps,modelInputProps } from "./components/helpers/Interfaces";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/onnxModelAPI";
import Stage from "./components/Stage";
import AppContext from "./components/hooks/createContext";
const ort = require("onnxruntime-web");
/* @ts-ignore */
import npyjs from "npyjs";
import "./App.css"

import LLM from "./components/authentication/LLM_QA";
import Storyline from "./components/authentication/Storyline";
import StageMenu from "./components/authentication/StageMenu"
import NestedList from "./components/authentication/NestedList"
import Legend from "./components/authentication/Legend"
import Title from "./components/authentication/Title"
import { stageFocusManager } from './components/Stage';
// Define image, embedding and model paths
const IMAGE_PATH = "/assets/data/D011518.jpg";
const IMAGE_EMBEDDING = "/assets/data/D011518.npy";
const MODEL_DIR = "/model/sam_onnx_example.onnx";

const App = () => {
  const {
    clicks: [clicks, setClicks],          // ✅ 取出 setClicks
    image: [, setImage],
    maskImg: [, setMaskImg],             // ✅ 取出 setMaskImg
  } = useContext(AppContext)!;
  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor

  const [showStage, setShowStage] = useState(false);  // 控制 StageMenu 显示与否
  const handleShowStage = () => {
    setShowStage(true); // 调整缩放值
  };

  // === 新增：当前点的标签（1=正，0=负） ===
  const [currentLabel, setCurrentLabel] = useState<0 | 1>(1);
  // ✅ 悬停预览点（不进持久 clicks）
  const [hoverClick, setHoverClick] = useState<modelInputProps | null>(null);

  const [zoomLevel, setZoomLevel] = useState(0.8);

  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  // === 清空所有点与掩码 ===
  const handleReset = () => {
    setClicks([]);        // 清空点
    setHoverClick(null);
    setMaskImg(null);     // 清空当前 mask
    setPanX(0);           // 重置横向平移
    setPanY(0);           // 重置纵向平移
    // 重置后让 Stage 组件重新获得焦点
    setTimeout(() => {
      if (stageFocusManager.focusCallback) {
        stageFocusManager.focusCallback();
      }
    }, 0);
  };
  // The ONNX model expects the input to be rescaled to 1024. 
  // The modelScale state variable keeps track of the scale values.
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  // Initialize the ONNX model. load the image, and load the SAM
  // pre-computed image embedding
  useEffect(() => {
    // Initialize the ONNX model
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return;
        const URL: string = MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.log(e);
      }
    };
    initModel();

    // Load the image
    const url = new URL(IMAGE_PATH, location.origin);
    loadImage(url);

    // Load the Segment Anything pre-computed embedding
    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(
      (embedding) => setTensor(embedding)
    );
  }, []);

  const loadImage = async (url: URL) => {
    try {
      const img = new Image();
      img.src = url.href;
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height,  // original image height
          width: width,  // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });
        img.width = width;
        img.height = height;
        setImage(img);
      };
    } catch (error) {
      console.log(error);
    }
  };

  // Decode a Numpy file into a tensor. 
  const loadNpyTensor = async (tensorFile: string, dType: string) => {
    let npLoader = new npyjs();
    const npArray = await npLoader.load(tensorFile);
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  };

  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
  }, [clicks, hoverClick]);

  const runONNX = async () => {
    try {
      if (model === null || tensor === null || modelScale === null) return;
      // ✅ 合并持久点 + 悬停点（仅预览不入库）
      const mergedClicks = [...(clicks ?? [])];
      if (hoverClick) mergedClicks.push(hoverClick);
      if (mergedClicks.length === 0) {
        setMaskImg(null);
        return;
      }
      const feeds = modelData({ clicks: mergedClicks, tensor, modelScale });
      if (!feeds) return;
      const results = await model.run(feeds);
      const output = results[model.outputNames[0]];
      setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
    } catch (e) {
      console.log(e);
    }
  };


  return <>
    <div className="top-bar">
      <Title />
    </div>
    <div className="bottom-container">
      <div className="left-side">
        <div className="left-side-border">
          {/* ✅ 传递 currentLabel 与 onReset */}
          <StageMenu
            showStage={handleShowStage}
            currentLabel={currentLabel}
            onChangeLabel={setCurrentLabel}
            onReset={handleReset}
          />
          {/* ✅ 把 currentLabel 传给 Stage；zoom 仍外控，滚轮通过 onZoomChange 更新 */}
          {showStage && (
            <Stage
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              currentLabel={currentLabel}
              onHoverChange={setHoverClick}   // ✅ 新增：悬停时设置预览点
              onHoverEnd={() => setHoverClick(null)} // ✅ 离开时清空预览
              panX={panX}
              panY={panY}
              onPanXChange={setPanX}
              onPanYChange={setPanY}
            />
          )}
        </div>
      </div>
      <div className="right-side">
        <div className="right-side-top">
          <div className="right-side-top-left">
            <NestedList />
            <Storyline />
            <Legend />
            {/* <KG /> */}
          </div>
        </div>
        {/* 大模型对话输入框 */}
        <div className="right-side-buttom">
          <LLM />
        </div>
      </div>
    </div>

  </>
};

export default App;
