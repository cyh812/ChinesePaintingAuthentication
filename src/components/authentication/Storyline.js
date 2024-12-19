import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./Storyline.css"; // 引入样式

const Storyline = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodesData, setNodesData] = useState([]);
  const [linksData, setLinksData] = useState([]);



  // 预先加载四个自定义的图像（PNG/SVG素材）
  const nodeImages = [
    "../../assets/img/people.png",  // 替换为实际路径
    "../../assets/img/seal.png",  // 替换为实际路径
    "../../assets/img/painting.png",  // 替换为实际路径
    "../../assets/img/logo.png"   // 替换为实际路径
  ];

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

  useEffect(() => {
    // 加载包含节点和连边数据的data.json文件
    d3.json("../../assets/data/data.json") // 替换为你的实际文件路径
      .then((data) => {
        setNodesData(data.nodes); // 设置节点数据
        setLinksData(data.links); // 设置连边数据
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });
  }, []);


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

    // 创建链接（直线）
    const link = graphGroup.selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    // 创建节点（使用图片）
    const node = graphGroup.selectAll("image")
      .data(nodesData)
      .enter()
      .append("image")
      .attr("xlink:href", (d) => nodeImages[d.category]) // 根据category选择不同的图片
      .attr("width", 40) // 设置节点图片的宽高
      .attr("height", 40)
      .attr("x", (d) => d.x - 20)  // 使得节点居中
      .attr("y", (d) => d.y - 20)
      .call(d3.drag() // 添加拖拽事件
        .on("start", function (event) {
          d3.select(this).raise().classed("active", true);
        })
        .on("drag", function (event, d) {
          d.x = event.x;
          d.y = event.y;
          d3.select(this)
            .attr("x", d.x - 20)  // 更新图片的位置
            .attr("y", d.y - 20);
          // 同步更新文本的位置
          text
            .filter((t) => t.id === d.id) // 根据节点ID匹配文本
            .attr("x", d.x)
            .attr("y", d.y + 35); // 更新文本的位置，保持文本在节点下方
          updateLinks(); // 更新连线位置
        })
        .on("end", function () {
          d3.select(this).classed("active", false);
        })
      );

    // 创建节点名称文本
    const text = graphGroup.selectAll("text")
      .data(nodesData)
      .enter()
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 35)  // 设置文本位置在节点下方
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("text-shadow", "2px 2px 3px rgba(255, 255, 255, 0.8)") // 模拟外扩效果
      .style("font-size", "18px")
      .style("font-family", "Arial, sans-serif")  // 设置字体
      .style("font-weight", "bold") // 设置字体加粗
      .text((d) => d.name);

    const customCard = d3.select('body').append('div')
      .attr('class', 'custom-card')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#fff')
      .style('border', '1px solid #ccc')
      .style('border-radius', '10px')
      .style('padding', '10px')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
      .style('width', '150px');

    // 显示卡片的hover事件
    node
      .on("mouseover", function (event, d) {
        customCard.transition().duration(200).style('visibility', 'visible');
        customCard.html(`
    <h4>${d.name}</h4>
    <p>更多信息...</p>
  `)
          .style('left', `${event.pageX + 30}px`)
          .style('top', `${event.pageY - 50}px`);
      })
      .on("mouseout", function () {
        customCard.transition().duration(200).style('visibility', 'hidden');
      });

    // 力导向布局
    const simulation = d3.forceSimulation(nodesData)
      .force("link", d3.forceLink(linksData).id(d => d.id).distance(100))  // 设置连线距离
      .force("charge", d3.forceManyBody().strength(-100))  // 节点之间的排斥力
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2)) // 将图形放置在画布中央
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



