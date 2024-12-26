import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./Storyline.css"; // 引入样式

const Storyline = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodesData, setNodesData] = useState([]);
  const [linksData, setLinksData] = useState([]);
  const [isRendered, setIsRendered] = useState(false); // 控制图表渲染
  const [dataurl, setdataurl] = useState("../../assets/temp/data1.json")


  // 预先加载四个自定义的图像（PNG/SVG素材）
  const nodeImages = {
    "P": "../../assets/img/painting.png",
    "S": "../../assets/img/seal.png",
    "A": "../../assets/img/people.png",
    "L": "../../assets/img/location.png",
    "O": "../../assets/temp/1.png"
  }

  useEffect(() => {
    // 获取容器的实际宽度和高度
    const updateDimensions = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    };

    // 初始化时设置尺寸
    updateDimensions();

    // 监听窗口尺寸变化，动态更新
    window.addEventListener("resize", updateDimensions);

    // 清理事件监听器
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // 按键事件：监听 "O" 键
  useEffect(() => {
    const handleKeyDown1 = (event) => {
      if (event.key === "1") {
        setIsRendered(true); // 按下 "O" 键后设置渲染状态为 true
      }
    };
    const handleKeyDown2 = (event) => {
      if (event.key === "2") {
        setdataurl("../../assets/data/data.json")
      }
    };

    const handleKeyDown3 = (event) => {
      if (event.key === "3") {
        setIsRendered(true); // 按下 "O" 键后设置渲染状态为 true
      }
    };

    window.addEventListener("keydown", handleKeyDown1);
    window.addEventListener("keydown", handleKeyDown2);
    window.addEventListener("keydown", handleKeyDown3);

    // 清理事件监听器
    return () => {
      window.removeEventListener("keydown", handleKeyDown1);
      window.removeEventListener("keydown", handleKeyDown2);
      window.removeEventListener("keydown", handleKeyDown3);
    };
  }, []);

  useEffect(() => {
    if (!isRendered) return; // 只有在需要渲染时才加载数据
    // 加载包含节点和连边数据的data.json文件
    d3.json(dataurl) // 替换为你的实际文件路径
      .then((data) => {
        setNodesData(data.nodes); // 设置节点数据
        setLinksData(data.links); // 设置连边数据
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });
  }, [isRendered, dataurl]);


  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || nodesData.length === 0 || linksData.length === 0) return;

    // 创建SVG容器
    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    // 设置缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3]) // 设置缩放的范围
      .on("zoom", function (event) {
        svg.selectAll("g").attr("transform", event.transform); // 应用缩放和移动
      })

    // 应用缩放行为
    svg.call(zoom);

    // 创建一个包含节点和链接的g元素
    const graphGroup = svg.append("g");

    // 力导向布局
    const simulation = d3.forceSimulation(nodesData)
      .force("link", d3.forceLink(linksData).id(d => d.id).distance(200))  // 设置连线距离
      .force("charge", d3.forceManyBody().strength(-400))  // 节点之间的排斥力
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2)) // 将图形放置在画布中央
      .alphaDecay(0.01) // 减小衰减速度
      .alphaMin(0.0001) // 设置更小的停止阈值
      .on("tick", ticked);  // 每次力导向布局计算时，执行 ticked 函数

    // 更新连线的位置
    function updateLinks() {
        link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    }

    // 更新节点和文本的位置
    function ticked() {
      node
        .attr("x", (d) => d.x - 20)
        .attr("y", (d) => d.y - 20);

      text
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + 35);

      graphGroup.selectAll("foreignObject")
        .attr("x", d => (d.source.x + d.target.x) / 2 - 50) // foreignObject 的位置
        .attr("y", d => (d.source.y + d.target.y) / 2 - 15);

      arc.attr('d', d => {
        if ((d.source.category == "P" || d.source.category == "S") && (d.target.category == "P" || d.target.category == "S")) {
          const x1 = d.source.x;
          const y1 = d.source.y;
          const x2 = d.target.x;
          const y2 = d.target.y;

          // 计算连边中心
          const centerX = (x1 + x2) / 2;
          const centerY = (y1 + y2) / 2;

          // 动态计算扇形角度
          const angleRatio = d.angle || 0; // 获取 angle 属性（0-1），默认值为 0
          const startAngle = 0; // 扇形起始角度（0 弧度）
          const endAngle = 2 * Math.PI * angleRatio; // 根据 angle 映射到 0-2π 范围

          // 使用 arcGenerator 生成路径
          return arcGenerator({
            startAngle,
            endAngle,
            innerRadius: 0,
            outerRadius: 30,
          });

        }
      })
        .attr('transform', d => {
          const x1 = d.source.x;
          const y1 = d.source.y;
          const x2 = d.target.x;
          const y2 = d.target.y;

          // 计算连边的中心点
          const centerX = (x1 + x2) / 2;
          const centerY = (y1 + y2) / 2;

          // 平移到连边中心
          return `translate(${centerX}, ${centerY})`;
        });

      updateLinks();
    }

    // 初始化连线和节点的位置
    updateLinks();
    ticked();

    // 清理函数，防止多次渲染
    return () => {
      d3.select(containerRef.current).select("svg").remove();
    };
  }, [dimensions, nodesData, linksData]);

  return (
    <div className="storyline" ref={containerRef}>
    </div>
  );
};

export default Storyline;
