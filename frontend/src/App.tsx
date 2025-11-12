import { InferenceSession, Tensor } from "onnxruntime-web";
import React, { useContext, useEffect, useState, useRef } from "react";
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

import EnhancedLLM_QA from "./components/authentication/EnhancedLLM_QA";
import Storyline from "./components/authentication/Storyline";
import StageMenu from "./components/authentication/StageMenu"
import EnhancedNestedList from "./components/authentication/EnhancedNestedList"
import Legend from "./components/authentication/Legend"
import Title from "./components/authentication/Title"
import SegmentsAndSeals from "./components/authentication/SegmentsAndSeals"
import QuestionAnsweringComponent from "./components/authentication/QuestionAnswering"
import FullAnswerPanel from "./components/authentication/FullAnswerPanel"
import { stageFocusManager } from './components/Stage';
import StorylineDataManager from "./components/authentication/StorylineDataManager";
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
  
  // 图数据状态
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] } | null>(null);
  const [graphLoading, setGraphLoading] = useState(true); // 添加加载状态
  const [isFullGraphMode, setIsFullGraphMode] = useState(false); // 总图模式状态
  
  // 切片和印章显示状态
  const [showSegmentsAndSeals, setShowSegmentsAndSeals] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null); // 当前选中的图片ID，初始为null
  
  // 新增：选中项和相似度阈值状态
  const [selectedItems, setSelectedItems] = useState<any[]>([]); // 选中的切片/印章
  const [segmentSimilarityThreshold, setSegmentSimilarityThreshold] = useState<[number, number]>([0.8, 1.0]); // 切片相似度阈值
  
  // 新增：完整答案显示状态
  const [fullAnswerData, setFullAnswerData] = useState<any>(null); // 存储要显示的完整答案数据
  
  // 创建 ref 来引用 SegmentsAndSeals 组件
  const segmentsAndSealsRef = useRef<any>(null);
  
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
    
    // 初始化图数据 - 使用 StorylineDataManager
    const initGraph = async () => {
      try {
        setGraphLoading(true);
        
        // 初始状态：只有石涛节点，不添加任何画作
        // StorylineDataManager 在初始化时已经自动添加了石涛节点
        
        // 获取初始图数据（只有石涛）
        const initialGraph = (StorylineDataManager as any).toStorylineFormat();
        setGraphData(initialGraph as any);
        
        console.log('✅ 图数据初始化完成 (仅石涛节点), 节点数:', initialGraph.nodes.length);
      } catch (error) {
        console.error('❌ 图数据初始化失败:', error);
      } finally {
        setGraphLoading(false);
      }
    };
    initGraph();
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

  // 处理图更新的回调 - 从 QuestionAnswering 接收新增的节点和边
  const handleGraphUpdate = (result: { addedNodes?: any[], addedEdges?: any[], data?: any }) => {
    console.log('📊 收到图数据更新:', result);
    
    // 获取最新的图数据
    const updatedGraph = (StorylineDataManager as any).toStorylineFormat();
    
    // 强制创建新对象引用以触发React重新渲染
    setGraphData({
      nodes: [...updatedGraph.nodes],
      links: [...updatedGraph.links]
    });
    
    console.log('✅ 图数据已更新, 节点数:', updatedGraph.nodes.length, '边数:', updatedGraph.links.length);
  };

  // 处理清空选择的回调 - 查询成功后清空切片和印章选择
  const handleClearSelection = () => {
    console.log('🧹 App收到清空选择请求');
    if (segmentsAndSealsRef.current) {
      segmentsAndSealsRef.current.clearSelection();
    }
  };

  // 处理显示完整答案的回调
  const handleShowFullAnswer = (historyItem: any) => {
    console.log('📖 显示完整答案:', historyItem);
    setFullAnswerData(historyItem);
  };

  // 处理图片选择
  const handleImageSelect = (selectedImage: any) => {
    console.log('🖼️ 用户选择了图片:', selectedImage);
    
    // 保存当前图片ID
    setCurrentImageId(selectedImage.id);
    
    // 清空选中项
    setSelectedItems([]);
    
    // 🔥 清空之前的所有图谱数据，只保留石涛节点
    console.log('🗑️ 清空之前的图谱，重置为只有石涛节点');
    (StorylineDataManager as any).reset();
    
    // 添加新选择的画作节点到图谱
    (StorylineDataManager as any).addPaintingNode(selectedImage.id, selectedImage.name || `画作 ${selectedImage.id}`);
    
    // 更新图数据
    const updatedGraph = (StorylineDataManager as any).toStorylineFormat();
    setGraphData({
      nodes: [...updatedGraph.nodes],
      links: [...updatedGraph.links]
    });
    
    console.log('✅ 图谱已更新: 石涛 + ' + selectedImage.id + ', 节点数:', updatedGraph.nodes.length);
    
    // 使用 JSON 中的图像url路径
    const imagePath = `/assets/data/${selectedImage.path.replace('../../assets/data/', '')}`;
    const url = new URL(imagePath, location.origin);
    
    // 加载新图片
    loadImage(url);
    
    // 加载对应的 NPY 文件 (Paintings_npy 中的同名文件)
    const npyPath = `/assets/data/Paintings_npy/${selectedImage.id}.npy`;
    console.log('📦 正在加载 NPY 文件:', npyPath);
    
    Promise.resolve(loadNpyTensor(npyPath, "float32")).then(
      (embedding) => {
        setTensor(embedding);
        console.log('✅ NPY 文件加载成功:', npyPath);
      }
    ).catch((error) => {
      console.error('❌ NPY 文件加载失败:', error);
      console.log('⚠️ 尝试的路径:', npyPath);
    });
    
    // 重置状态
    handleReset();
  };

  // 处理显示切片和印章
  const handleShowSegments = () => {
    // 只有选择了图片后才允许显示切片和印章
    if (!currentImageId) {
      console.warn('⚠️ 请先选择一张图片');
      return;
    }
    setShowSegmentsAndSeals(prev => !prev);
  };

  // 处理选中项变化
  const handleSelectionChange = (newSelectedItems: any[]) => {
    console.log('� 选中项变化:', newSelectedItems);
    setSelectedItems(newSelectedItems);
  };

  // 处理相似度阈值变化
  const handleSegmentSimilarityChange = (newThreshold: [number, number]) => {
    console.log('📊 相似度阈值变化:', newThreshold);
    setSegmentSimilarityThreshold(newThreshold);
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
            onImageSelect={handleImageSelect}
            onShowSegments={handleShowSegments}
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
            <EnhancedNestedList 
              onGraphUpdate={handleGraphUpdate} 
              onShowFullAnswer={handleShowFullAnswer}
            />
            
            {/* 只有数据加载完成且有效时才渲染Storyline，避免闪烁 */}
            {!graphLoading && graphData && graphData.nodes.length > 0 ? (
              <Storyline 
                nodesData={graphData.nodes as any}
                linksData={graphData.links as any}
              />
            ) : (
              <div className="storyline" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                {graphLoading ? '加载图数据中...' : '暂无数据'}
              </div>
            )}
            <Legend onSegmentSimilarityChange={handleSegmentSimilarityChange} />
          </div>
        </div>
        {/* 切片和印章视图 / 问答界面 */}
        <div className="right-side-buttom">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* 上方: 切片和印章选择 - 自适应高度 */}
            <div style={{ 
              flex: '1',
              minHeight: 0,
              overflow: 'auto',
              marginBottom: '8px',
              backgroundColor: '#f5f5f5'
            }}>
              {showSegmentsAndSeals && 
                React.createElement(SegmentsAndSeals as any, {
                  ref: segmentsAndSealsRef,
                  selectedImageId: currentImageId,
                  onSelectionChange: handleSelectionChange
                })
              }
            </div>
            {/* 下方: 问答界面 - 固定输入框高度，占据剩余空间 */}
            <div style={{ 
              flex: '0 0 auto',
              height: '57px', // 输入框容器高度 (45px输入框 + 12px padding)
              minHeight: '57px',
              overflow: 'hidden'
            }}>
              {React.createElement(QuestionAnsweringComponent as any, {
                selectedImageId: currentImageId,
                selectedItems: selectedItems,
                segmentSimilarityThreshold: segmentSimilarityThreshold,
                onGraphUpdate: handleGraphUpdate,
                onClearSelection: handleClearSelection
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 完整答案显示面板 */}
    {fullAnswerData && (
      <FullAnswerPanel 
        answerData={fullAnswerData}
        onClose={() => setFullAnswerData(null)}
      />
    )}

  </>
};

export default App;
