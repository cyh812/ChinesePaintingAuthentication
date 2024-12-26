import { InferenceSession, Tensor } from "onnxruntime-web";
import React, { useContext, useEffect, useState } from "react";
import "./assets/scss/App.scss";
import { handleImageScale } from "./components/helpers/scaleHelper";
import { modelScaleProps } from "./components/helpers/Interfaces";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/onnxModelAPI";
import Stage from "./components/Stage";
import AppContext from "./components/hooks/createContext";
const ort = require("onnxruntime-web");
/* @ts-ignore */
import npyjs from "npyjs";
import "./App.css"

import KG from "./components/authentication/KnowledgeGraph"
import LLM from "./components/authentication/LLM_QA";
import Storyline from "./components/authentication/Storyline";
import StageMenu from "./components/authentication/StageMenu"
import NestedList from "./components/authentication/NestedList"
import Legend from "./components/authentication/Legend"

// Define image, embedding and model paths
const IMAGE_PATH = "/assets/data/1.png";
const IMAGE_EMBEDDING = "/assets/data/Duiju.npy";
const MODEL_DIR = "/model/sam_onnx_example.onnx";

const App = () => {
  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
  } = useContext(AppContext)!;
  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor

  const [showStage, setShowStage] = useState(false);  // 控制 StageMenu 显示与否
  const handleShowStage = () => {
    setShowStage(true); // 调整缩放值
  };

  const [zoomLevel, setZoomLevel] = useState(0.9);
  const handleZoomIn = () => {
    setZoomLevel(zoomLevel + 0.1); // 调整缩放值
  };

  const handleZoomOut = () => {
    setZoomLevel(zoomLevel - 0.1); // 调整缩放值
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
  }, [clicks]);

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
        // Preapre the model input in the correct format for SAM. 
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        // The predicted mask returned from the ONNX model is an array which is 
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
        setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return <>
    <div className="top-bar">
      <div className="title-container">
        <img src="./assets/img/logo.png" alt="Custom Icon" className="icon" />
        <span className="title">
          Chinese Ancient Paintings Authentication Interactive Visualization System
        </span>
      </div>
    </div>
    <div className="bottom-container">
      <div className="left-side">
        <div className="left-side-border">
          <StageMenu onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} showStage={handleShowStage} />
          {showStage && <Stage zoomLevel={zoomLevel} />}
        </div>
      </div>
      <div className="right-side">
        <div className="right-side-top">
          <div className="right-side-top-left">
            <NestedList />
            <Storyline />
            <Legend/>
            {/* <KG /> */}
          </div>
          {/* storyline部分，暂时不需要了 */}
          {/* <div className="right-side-buttom-right">
            <Storyline />
          </div> */}
        </div>
        {/* 大模型对话输入框 */}
        <div className="right-side-buttom">
          <LLM />
        </div>
      </div>
    </div>

    {/* </div>
    <div style={{ backgroundColor: "#000000", height: "100vh", width: "25%", padding: "20px" }}>
      <Stage />
    </div>; */}
  </>
};

export default App;
