import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./Storyline.css"; // 引入样式

const Storyline = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodesData, setNodesData] = useState([]);
  const [linksData, setLinksData] = useState([]);



  // 预先加载四个自定义的图像（PNG/SVG素材）
  const nodeImages = {
    "P": "../../assets/img/painting.png",
    "S": "../../assets/img/seal.png",
    "A": "../../assets/img/people.png",
    "L": "../../assets/img/logo.png"
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
          ticked();
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

    // 创建扇形生成器
    const arcGenerator = d3.arc()
      .innerRadius(0) // 内半径
      .outerRadius(10) // 外半径

    // 创建扇形（路径）
    const arc = svg.append('g')
      .selectAll('path')
      .data(linksData)
      .enter().append('path')
      .attr('fill', '#C52E34')
      .attr('opacity', 0.9);

    // 显示卡片的hover事件
    arc
      .on("mouseover", function (event, d) {
        customCard.transition().duration(200).style('visibility', 'visible');
        customCard.html(`
  <h4>扇形</h4>
  <p>更多信息...</p>
`)
          .style('left', `${event.pageX - 75}px`)
          .style('top', `${event.pageY - 75}px`);
      })
      .on("mouseout", function () {
        customCard.transition().duration(200).style('visibility', 'hidden');
      });

    const parsedLinksData = linksData.map(link => ({
      source: nodesData.find(node => node.id === link.source),
      target: nodesData.find(node => node.id === link.target),
    }));

    const filteredLinks = parsedLinksData.filter(
      d => d.source?.category === "A" || d.target?.category === "A"
    );
    const buttons = graphGroup.selectAll("foreignObject")
      .data(filteredLinks)
      .enter()
      .append("foreignObject")
      .attr("width", 100) // 按钮宽度
      .attr("height", 30) // 按钮高度
      .append("xhtml:button")
      .text("Click   \|   9")
      .style("width", "100%")
      .style("height", "100%")
      .style("background-color", "#000000")
      .style("color", "white")
      .style("border-color", "black")
      .style("border-radius", "5px")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        alert(`Button clicked on link between ${d.source.name} and ${d.target.name}`);
      });

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
