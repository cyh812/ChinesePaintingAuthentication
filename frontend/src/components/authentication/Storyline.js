import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./Storyline.css"; // 引入样式

const Storyline = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodesData, setNodesData] = useState([]);
  const [linksData, setLinksData] = useState([]);
  const [isRendered, setIsRendered] = useState(false); // 控制图表渲染
  const [dataurl, setdataurl] = useState(" ")


  // 预先加载四个自定义的图像（PNG/SVG素材）
  const nodeImages = {
    "P": "../../assets/img/painting.png",
    "S": "../../assets/img/seal.png",
    "A": "../../assets/img/people.png",
    "R": "../../assets/img/references.png",
    "O": "../../assets/temp/1.png"
  }

  const urllist = [
    "../../assets/data/data1.json",
    "../../assets/data/data2.json",
    "../../assets/data/data3.json",
    "../../assets/data/data4.json",
    "../../assets/data/data5.json",
    "../../assets/data/data6.json"
  ]

  var flag = 0
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

  // 按键事件
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "3") {
        setdataurl(urllist[flag])
        setIsRendered(true);
        flag++;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // 清理事件监听器
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
      .style('width', '350px')
      .style('background-color', 'white')
      .style('display', 'flex')  // 使用flexbox布局
      .style('flex-direction', 'row')  // 水平排列
      .style('align-items', 'center')  // 垂直居中对齐

    // 显示卡片的hover事件
    node
      .on("mouseover", function (event, d) {
        customCard.transition().duration(200).style('visibility', 'visible');

        //画作节点
        if (d.category === "P") {
          customCard.html(`
<div style="width: 150px; height: 150px; overflow: hidden; position: relative;">
  <img src="${d.url}" alt="Node Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);" />
</div>

            &nbsp;&nbsp;
            <div style="width: 200px; background-color: #f0f0f0; padding: 3px; border-radius: 5px;">
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">作品: </strong>${d.name}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">作者: </strong>${d.作者}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">创作时间: </strong>${d.创作时间}}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">用色: </strong>${d.用色}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">尺寸: </strong>${d.尺寸}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">形制: </strong>${d.形制}</p>
                    <p style="font-size: 15px; color: #666; word-wrap: break-word; text-align: center;">
                <strong style="color: blue;">查看详情</strong></p>
        </div>
        `)
        }
        //画家节点
        else if (d.category === "A") {
          customCard.html(`
            <div>
          <img src="${d.url}" alt="Node Image" style="width: 150px; height: auto; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);" />
            </div>
            &nbsp;&nbsp;
            <div style="width: 200px; background-color:#f0f0f0; padding: 3px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">姓名: </strong>${d.name}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">名字拼音: </strong>${d.名字拼音}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">字号: </strong>${d.字号}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">所属朝代: </strong>${d.所属朝代}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">生卒年代: </strong>${d.生卒年代}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">籍贯: </strong>${d.籍贯}</p>
          <p style="font-size: 15px; color: #666; word-wrap: break-word; text-align: center;">
                <strong style="color: blue;">查看详情</strong></p>
          </div>
        `)
        }
        //印章节点
        else if (d.category === "S") {
          customCard.html(`
            <div>
          <img src="${d.url}" alt="Node Image" style="width: 100px; height: auto; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);" />
            </div>
            &nbsp;&nbsp;
            <div style="width: 250px; background-color:#f0f0f0; padding: 3px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">拥有者: </strong>${d.拥有者}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">名称: </strong>${d.name}</p>
          <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">收录: </strong>${d.单位}</p>
                  <p style="font-size: 15px; color: #666; word-wrap: break-word; text-align: center;">
                <strong style="color: blue;">查看详情</strong></p>
          </div>
        `)
        }


        customCard.style('left', `${event.pageX + 30}px`)
          .style('top', `${event.pageY - 50}px`);
      })
      .on("mouseout", function () {
        customCard.transition().duration(200).style('visibility', 'hidden');
      });

    // 创建扇形生成器
    const arcGenerator = d3.arc()
      .innerRadius(0) // 内半径
      .outerRadius(10) // 外半径

    const ImageLinks = linksData.filter(
      d => d.info?.name === "P-P" || d.info?.name === "S-S"
    );

    // 创建圆形
    const circle = svg.append('g')
      .selectAll('circle')
      .data(ImageLinks)
      .enter().append('circle')
      .attr('fill', d => d.info.name == 'P-P' ? '#C4C4FF' : '#FFB7B7')
      .attr('r', 8)  // 圆的半径
      .attr('opacity', 1);

    // 创建扇形（路径）
    const arc = svg.append('g')
      .selectAll('path')
      .data(ImageLinks)
      .enter().append('path')
      .attr('fill', d => d.info.name == 'P-P' ? 'blue' : 'red')
      .attr('opacity', 0.9);



    // 创建卡片容器
    const customCardonArc1 = d3.select('body')
      .append('div')
      .attr('class', 'custom-card')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#fff')
      .style('border', '1px solid #ccc')
      .style('border-radius', '10px')
      .style('padding', '5px')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
      .style('width', '250px'); // 卡片宽度

    // 创建卡片容器 印章-印章
    const customCardonArc2 = d3.select('body')
      .append('div')
      .attr('class', 'custom-card')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#fff')
      .style('border', '1px solid #ccc')
      .style('border-radius', '10px')
      .style('padding', '5px')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
      .style('width', '200px'); // 卡片宽度

    const updateCardContent1 = (image1, image2, similar) => {
      //图像切片连边
      customCardonArc1.html(`
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <!-- 上面三张图片并排 -->
      <img src="${image1}" alt="Image 1" style="width: 90px; height: auto;" />
      <img src="../../assets/img/similar.png" alt="Image 2" style="width: 30px; height: 30px;align-self: center;" />
      <img src="${image2}" alt="Image 3" style="width: 90px; height: auto;" />
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f0f0f0; border-radius: 5px; padding:3px">
      <!-- 下部左侧图片 -->
      <img src="../../assets/img/rank.png" alt="Left Image" style="width: 35px; height: 35px; margin-left:30px" />
      
      <!-- 右侧文字，显示similarity和ranking -->
      <div style="margin-right: 40px; text-align: left;">
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Similarity:</strong>${similar}</p>
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Ranking:</strong>2/10</p>
      </div>
    </div>
  `);
    };
    // 印章相似度连边
    const updateCardContent2 = (image1, image2, similar) => {
      customCardonArc2.html(`
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <!-- 上面三张图片并排 -->
      <img src="${image1}" alt="Image 1" style="width: 55px; height: auto; margin-left:10px " />
      <img src="../../assets/img/similar.png" alt="Image 2" style="width: 30px; height: 30px;align-self: center;" />
      <img src="${image2}" alt="Image 3" style="width: 55px; height: auto; margin-right:10px" />
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f0f0f0; border-radius: 5px; padding:3px">
      <!-- 下部左侧图片 -->
      <img src="../../assets/img/rank2.png" alt="Left Image" style="width: 35px; height: 35px; margin-left:20px" />
      
      <!-- 右侧文字，显示similarity和ranking -->
      <div style="margin-right: 10px; text-align: left;">
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Similarity: </strong>${similar}</p>
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Ranking: </strong>1/10</p>
      </div>
    </div>
  `);
    };

    // 显示卡片的hover事件
    arc
      .on("mouseover", function (event, d) {
        if (d.info.name == "P-P") {
          const image1 = d.info.url1 !== "" ? d.info.url1 : '../../assets/img/test/L1.png';
          const image2 = d.info.url2 !== "" ? d.info.url2 : '../../assets/img/test/L1.png';
          const similar = d.info.angle;
          updateCardContent1(image1, image2, similar); // 更新卡片内容
          customCardonArc1
            .style('visibility', 'visible')
          customCardonArc2
            .style('visibility', 'hidden')
        }
        if (d.info.name == "S-S") {
          const image1 = d.info.url1 !== "" ? d.info.url1 : '../../assets/img/test/L1.png';
          const image2 = d.info.url2 !== "" ? d.info.url2 : '../../assets/img/test/L1.png';
          const similar = d.info.angle;
          updateCardContent2(image1, image2, similar); // 更新卡片内容

          customCardonArc1
            .style('visibility', 'hidden')
          customCardonArc2
            .style('visibility', 'visible')
        }

        customCardonArc1
          .style('left', `${event.pageX - 105}px`)
          .style('top', `${event.pageY - 150}px`);

        customCardonArc2
          .style('left', `${event.pageX - 105}px`)
          .style('top', `${event.pageY - 150}px`);

      })
      .on("mouseout", function () {
        customCardonArc1.transition().duration(200).style('visibility', 'hidden');
        customCardonArc2.transition().duration(200).style('visibility', 'hidden');
      });

    const parsedLinksData = linksData.map(link => ({
      source: nodesData.find(node => node.id === link.source),
      target: nodesData.find(node => node.id === link.target),
    }));

    // const filteredLinks = parsedLinksData.filter(
    //   d => d.info?.name === "R-R" || d.info?.name === "P-S"
    // );

    const filteredLinks = linksData.filter(
      d => d.info?.name === "R-R" || d.info?.name === "P-S"
    );
    console.log(filteredLinks)
    // console.log(filteredLinks)
    const buttons = graphGroup.selectAll("foreignObject")
      .data(filteredLinks)
      .enter()
      .append("foreignObject")
      .attr("width", 25) // 按钮宽度
      .attr("height", 25) // 按钮高度
      .append("xhtml:div")
      .style("width", "100%")
      .style("height", "100%")
      .style("background-color", "#ffffff")
      .style("color", "gray")
      // .style("border", "1px solid black")
      .style("font-weight", "bold")
      .style("border-radius", "5px")
      .style("cursor", "pointer")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("padding", "1px")
      .html(d => `
        <img src="../../assets/img/reference-blue.png" alt="Icon" style="width: 17px; height: 20px;margin-left:3px" />
      `);


    // 显示自定义卡片
    const customCard3 = d3.select('body').append('div')
      .attr('class', 'custom-card')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#fff')
      .style('border', '1px solid #ccc')
      .style('border-radius', '10px')
      .style('padding', '10px')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
      .style('width', '300px')
      .style('font-size', '12px');

    // 设置点击事件显示或隐藏卡片
    buttons.on("click", function (event, d) {
      // 判断卡片当前是否可见，如果可见则隐藏，否则显示
      const isVisible = customCard3.style('visibility') === 'visible';

      if (isVisible) {
        // 隐藏卡片
        customCard3.transition().duration(200).style('visibility', 'hidden');
      } else {
        // 显示卡片
        customCard3.transition().duration(200).style('visibility', 'visible');

        // 构建卡片内容
        let cardContent = `
      `;
        // 遍历 linksData，找到与 d.source 和 d.target 匹配的 link
        const matchedLink = linksData.find(link =>
          (link.source.id === d.source.id && link.target.id === d.target.id) ||
          (link.source.id === d.target.id && link.target.id === d.source.id)
        );

        // 如果找到匹配的 link，显示 info.reference
        if (matchedLink && matchedLink.info && matchedLink.info.reference) {
          const entries = Object.entries(matchedLink.info.reference);
          entries.forEach((([key, value], index) => {
            cardContent += `
              <!-- 给value添加灰色圆角背景 -->
              <p style="font-size: 12px; margin: 0; background-color: #f0f0f0; border-radius: 8px; padding: 5px;">${value}</p>
              <!-- 添加直线 -->
              <div style="border-bottom: 1px solid #ccc; width: 190px; margin-top: 5px;"></div>
              <div style="display: flex; align-items: center; margin-top: 5px;justify-content: space-between;">
                <p style="font-size: 12px; margin-right: 5px; font-weight: bold;">${key}</p>
                <img src="../../assets/img/reference.png" alt="Icon" style="width: 17px; height: 20px; margin-right: 5px; cursor: pointer;" onclick="window.open('https://www.baidu.com', '_blank');" />
              </div>
            `;

            // 如果不是最后一条，添加 <br>
            if (index !== entries.length - 1) {
              cardContent += `<br>`;
            }
          }));
        }

        customCard3.html(cardContent)
          .style('left', `${event.pageX + 50}px`)  // 鼠标位置 + 偏移量
          .style('top', `${event.pageY - 100}px`); // 鼠标位置 + 偏移量
      }
    });

    //   // 在 hover 时显示卡片
    //   buttons.on("mouseover", function (event, d) {
    //     customCard3.transition().duration(200).style('visibility', 'visible');
    //     customCard3.html(`
    //   <strong>Source:</strong> ${d.source.name} <br>
    //   <strong>Target:</strong> ${d.target.name} <br>
    //   <strong>Category:</strong> ${d.source.category} <br>
    // `)
    //       .style('left', `${event.pageX + 30}px`)
    //       .style('top', `${event.pageY - 50}px`);
    //   })


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
        .attr("x", d => (d.source.x + d.target.x) / 2 - 15) // foreignObject 的位置
        .attr("y", d => (d.source.y + d.target.y) / 2 - 10);

      arc.attr('d', d => {
        if (d.info.name == "P-P") {
          // 动态计算扇形角度
          const angleRatio = d.info.angle || 0; // 获取 angle 属性（0-1），默认值为 0
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
        else if (d.info.name == "S-S") {
          // 动态计算扇形角度
          const angleRatio = d.info.angle || 0; // 获取 angle 属性（0-1），默认值为 0
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
        
      circle.attr('transform', d => {
        if (d.info.name == "P-P" || d.info.name == "S-S") {
          const x1 = d.source.x;
          const y1 = d.source.y;
          const x2 = d.target.x;
          const y2 = d.target.y;

          // 计算连边的中心点
          const centerX = (x1 + x2) / 2;
          const centerY = (y1 + y2) / 2;

          // 平移到连边中心
          return `translate(${centerX}, ${centerY})`;
        }

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
