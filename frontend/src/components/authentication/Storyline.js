import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./Storyline.css"; // 引入样式

// 修改为受控组件，从props接收图数据
const Storyline = ({ nodesData = [], linksData = [] }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });


  // 预先加载自定义的图像（PNG/SVG素材）
  const nodeImages = {
    "P": "../../assets/img/painting.png",      // 画作
    "S": "../../assets/img/seal.png",          // 印章
    "seal": "../../assets/img/seal.png",       // 印章（新格式）
    "SS": "../../assets/img/seal.png",         // 标准印章（使用印章图标）
    "A": "../../assets/img/people.png",        // 作者
    "R": "../../assets/img/references.png",    // 参考文献
    "O": "../../assets/img/painting.png"       // 其他画作
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

  // 渲染图的主要逻辑
  useEffect(() => {
    console.log('🎨 Storyline useEffect触发', {
      dimensionsReady: dimensions.width > 0 && dimensions.height > 0,
      nodesCount: nodesData?.length,
      linksCount: linksData?.length
    });
    
    // 防止闪烁：只有在容器尺寸和数据都准备好时才渲染
    if (dimensions.width === 0 || dimensions.height === 0) return;
    if (!nodesData || nodesData.length === 0) return;
    if (!linksData || linksData.length === 0) return;

    console.log('✅ 开始渲染图谱，节点数:', nodesData.length, '边数:', linksData.length);

    // 清理之前的所有内容
    d3.select(containerRef.current).selectAll("*").remove();

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
    let clickTimer = null;
    let dragStartPos = null;
    
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
          dragStartPos = { x: event.x, y: event.y };
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
        .on("end", function (event) {
          d3.select(this).classed("active", false);
          // 计算拖拽距离，如果距离很小则认为是点击而非拖拽
          const distance = Math.sqrt(
            Math.pow(event.x - dragStartPos.x, 2) + 
            Math.pow(event.y - dragStartPos.y, 2)
          );
          // 如果移动距离小于5像素，触发点击事件
          if (distance < 5) {
            d3.select(this).dispatch('click');
          }
          dragStartPos = null;
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
      .text((d) => d.label || d.name);  // 优先使用 label，回退到 name

    const customCard = d3.select(containerRef.current).append('div')
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
      .style('flex-direction', 'column')  // 改为垂直布局以容纳关闭按钮
      .style('align-items', 'stretch')  // 拉伸对齐

    // 显示卡片的点击事件
    node
      .on("click", function (event, d) {
        // 阻止事件冒泡
        event.stopPropagation();
        
        // 先更新卡片内容，然后显示
        //画作节点
        if (d.category === "P" || d.category === "O") {
          customCard.html(`
            <!-- 关闭按钮 -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
              <button class="closeCardBtn" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #999; padding: 0; line-height: 1;">
                ✕
              </button>
            </div>
            <!-- 卡片内容 -->
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div style="width: 150px; height: 150px; overflow: hidden; position: relative;">
                <img src="${d.url}" alt="Node Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);" />
              </div>
              &nbsp;&nbsp;
              <div style="width: 200px; background-color: #f0f0f0; padding: 3px; border-radius: 5px;">
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">作品: </strong>${d.name}</p>
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">作者: </strong>${d.作者 || '未知'}</p>
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">创作时间: </strong>${d.创作时间 || '未知'}</p>
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">用色: </strong>${d.用色 || '未知'}</p>
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">尺寸: </strong>${d.尺寸 || '未知'}</p>
              </div>
            </div>
          `)
        }
        //画家节点
        else if (d.category === "A") {
          customCard.html(`
            <!-- 关闭按钮 -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
              <button class="closeCardBtn" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #999; padding: 0; line-height: 1;">
                ✕
              </button>
            </div>
            <!-- 卡片内容 -->
            <div style="display: flex; flex-direction: row; align-items: center;">
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
              </div>
            </div>
          `)
        }
        //印章节点
        else if (d.category === "seal" || d.category === "S") {
          const sealImagePath = d.data?.sealImage || d.data?.seal_image || d.url || '';
          // 添加路径前缀
          const fullSealImagePath = sealImagePath.startsWith('http') || sealImagePath.startsWith('data:') 
            ? sealImagePath 
            : `../../assets/data/${sealImagePath}`;
          const owner = d.data?.owner || '石涛';
          const sealName = d.data?.sealName || d.data?.name || d.name;
          
          customCard.html(`
            <!-- 关闭按钮 -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
              <button class="closeCardBtn" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #999; padding: 0; line-height: 1;">
                ✕
              </button>
            </div>
            <!-- 卡片内容 -->
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div>
                <img src="${fullSealImagePath}" alt="Seal Image" style="width: 100px; height: auto; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);" onerror="this.src='../../assets/img/seal.png'" />
              </div>
              &nbsp;&nbsp;
              <div style="width: 250px; background-color:#f0f0f0; padding: 3px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">拥有者: </strong>${owner}</p>
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">名称: </strong>${sealName}</p>
              </div>
            </div>
          `)
        }
        //标准印章节点
        else if (d.category === "SS") {
          customCard.html(`
            <!-- 关闭按钮 -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
              <button class="closeCardBtn" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #999; padding: 0; line-height: 1;">
                ✕
              </button>
            </div>
            <!-- 卡片内容 -->
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div>
                <img src="${d.url}" alt="Node Image" style="width: 100px; height: auto; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);" />
              </div>
              &nbsp;&nbsp;
              <div style="width: 250px; background-color:#fff4e6; padding: 3px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">标准印章: </strong>${d.name}</p>
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">拥有者: </strong>${d.拥有者 || '石涛'}</p>
                <p style="font-size: 12px; color: #666; word-wrap: break-word;"><strong style="color: black;">类型: </strong>标准印</p>
              </div>
            </div>
          `)
        }
        //参考文献节点 - 不显示卡片
        else if (d.category === "R") {
          // 参考文献节点不需要点击显示卡片,所有信息在参考边的图标中显示
          return; // 直接返回,不显示卡片
        }
        
        // 获取节点元素的实际屏幕位置
        const nodeElement = this;
        const nodeRect = nodeElement.getBoundingClientRect();
        
        // 获取容器的位置，用于计算相对偏移
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // 计算卡片相对于容器的位置
        const cardLeft = nodeRect.right - containerRect.left + 10;  // 节点右侧10px
        const cardTop = nodeRect.top - containerRect.top;  // 与节点顶部对齐
        
        // 使用相对于容器的坐标来设置卡片位置
        customCard.style('left', `${cardLeft}px`)
          .style('top', `${cardTop}px`);
        
        // 显示卡片
        customCard.transition().duration(200).style('visibility', 'visible');
        
        // 使用事件委托绑定关闭按钮的点击事件
        setTimeout(() => {
          const closeBtn = customCard.select('.closeCardBtn').node();
          if (closeBtn) {
            // 移除之前的事件监听器（如果有）
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            // 重新获取节点并添加事件
            const newCloseBtn = customCard.select('.closeCardBtn').node();
            newCloseBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              customCard.transition().duration(200).style('visibility', 'hidden');
            });
          }
        }, 0);
      });

    // 创建扇形生成器
    const arcGenerator = d3.arc()
      .innerRadius(0) // 内半径
      .outerRadius(10) // 外半径

    const ImageLinks = linksData.filter(
      d => d.info?.name === "P-P" || d.info?.name === "S-S" || d.info?.name === "S-SS"
    );

    // 创建圆形
    const circle = svg.append('g')
      .selectAll('circle')
      .data(ImageLinks)
      .enter().append('circle')
      .attr('fill', d => d.info.name == 'P-P' ? '#E5EFF6' : '#FFB7B7')
      .attr('r', 10)  // 圆的半径
      .attr('opacity', 1);

    // 创建扇形（路径）
    const arc = svg.append('g')
      .selectAll('path')
      .data(ImageLinks)
      .enter().append('path')
      .attr('fill', d => d.info.name == 'P-P' ? '#4B80FA' : 'red')
      .attr('opacity', 0.9);



    // 创建卡片容器（扇形的）
    const customCardonArc1 = d3.select(containerRef.current)
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

    // 创建卡片容器 （印章-印章）
    const customCardonArc2 = d3.select(containerRef.current)
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

    const updateCardContent1 = (similarities, currentPage = 0) => {
      //图像切片连边（带翻页功能）
      const totalPages = similarities.length;
      const currentData = similarities[currentPage];
      const image1 = currentData.url1 || '../../assets/img/test/L1.png';
      const image2 = currentData.url2 || '../../assets/img/test/L1.png';
      const similar = currentData.similarity ? (currentData.similarity * 100).toFixed(1) + '%' : currentData.angle || 'N/A';

      customCardonArc1.html(`
    <!-- 关闭按钮 -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
      <button id="closeArcCardBtn1" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #999; padding: 0; line-height: 1;">
        ✕
      </button>
    </div>
    <!-- 卡片内容 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <!-- 左侧图片 - 自适应缩放 -->
      <img src="${image1}" alt="Image 1" style="
        max-width: 90px; 
        max-height: 120px; 
        width: auto; 
        height: auto; 
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      " />
      <!-- 中间相似图标 -->
      <img src="../../assets/img/similar.png" alt="Similar Icon" style="
        width: 30px; 
        height: 30px;
        flex-shrink: 0;
      " />
      <!-- 右侧图片 - 自适应缩放 -->
      <img src="${image2}" alt="Image 2" style="
        max-width: 90px; 
        max-height: 120px; 
        width: auto; 
        height: auto; 
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      " />
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f0f0f0; border-radius: 5px; padding:3px">
      <!-- 下部左侧图片 -->
      <img src="../../assets/img/rank.png" alt="Left Image" style="width: 35px; height: 35px; margin-left:30px" />
      
      <!-- 右侧文字，显示similarity和页码 -->
      <div style="margin-right: 40px; text-align: left;">
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Similarity :</strong>${similar}</p>
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Page :</strong>${currentPage + 1}/${totalPages}</p>
      </div>
    </div>

    ${totalPages > 1 ? `
    <!-- 翻页按钮 -->
    <div style="display: flex; justify-content: center; align-items: center; margin-top: 8px; gap: 10px;">
      <button id="prevPageBtn1" style="
        background-color: ${currentPage > 0 ? '#4B80FA' : '#ccc'}; 
        color: white; 
        border: none; 
        border-radius: 5px; 
        padding: 5px 15px; 
        cursor: ${currentPage > 0 ? 'pointer' : 'not-allowed'}; 
        font-size: 14px;
      " ${currentPage === 0 ? 'disabled' : ''}>← 上一页</button>
      <button id="nextPageBtn1" style="
        background-color: ${currentPage < totalPages - 1 ? '#4B80FA' : '#ccc'}; 
        color: white; 
        border: none; 
        border-radius: 5px; 
        padding: 5px 15px; 
        cursor: ${currentPage < totalPages - 1 ? 'pointer' : 'not-allowed'}; 
        font-size: 14px;
      " ${currentPage === totalPages - 1 ? 'disabled' : ''}>下一页 →</button>
    </div>
    ` : ''}
  `);
    };
    // 印章相似度连边（带翻页功能）
    const updateCardContent2 = (similarities, currentPage = 0) => {
      const totalPages = similarities.length;
      const currentData = similarities[currentPage];
      const image1 = currentData.url1 || '../../assets/img/test/L1.png';
      const image2 = currentData.url2 || '../../assets/img/test/L1.png';
      const similar = currentData.similarity ? (currentData.similarity * 100).toFixed(1) + '%' : currentData.angle || 'N/A';

      customCardonArc2.html(`
    <!-- 关闭按钮 -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
      <button id="closeArcCardBtn2" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #999; padding: 0; line-height: 1;">
        ✕
      </button>
    </div>
    <!-- 卡片内容 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 0 10px;">
      <!-- 左侧印章图片 - 自适应缩放 -->
      <img src="${image1}" alt="Seal 1" style="
        max-width: 55px; 
        max-height: 80px; 
        width: auto; 
        height: auto; 
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      " />
      <!-- 中间相似图标 -->
      <img src="../../assets/img/similar.png" alt="Similar Icon" style="
        width: 30px; 
        height: 30px;
        flex-shrink: 0;
      " />
      <!-- 右侧印章图片 - 自适应缩放 -->
      <img src="${image2}" alt="Seal 2" style="
        max-width: 55px; 
        max-height: 80px; 
        width: auto; 
        height: auto; 
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      " />
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f0f0f0; border-radius: 5px; padding:3px">
      <!-- 下部左侧图片 -->
      <img src="../../assets/img/rank2.png" alt="Left Image" style="width: 35px; height: 35px; margin-left:20px" />
      
      <!-- 右侧文字，显示similarity和页码 -->
      <div style="margin-right: 10px; text-align: left;">
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Similarity : </strong>${similar}</p>
        <p style="font-size: 13px; color: #666;"><strong style="color: black;">Page : </strong>${currentPage + 1}/${totalPages}</p>
      </div>
    </div>

    ${totalPages > 1 ? `
    <!-- 翻页按钮 -->
    <div style="display: flex; justify-content: center; align-items: center; margin-top: 8px; gap: 10px;">
      <button id="prevPageBtn2" style="
        background-color: ${currentPage > 0 ? '#4B80FA' : '#ccc'}; 
        color: white; 
        border: none; 
        border-radius: 5px; 
        padding: 5px 15px; 
        cursor: ${currentPage > 0 ? 'pointer' : 'not-allowed'}; 
        font-size: 14px;
      " ${currentPage === 0 ? 'disabled' : ''}>← 上一页</button>
      <button id="nextPageBtn2" style="
        background-color: ${currentPage < totalPages - 1 ? '#4B80FA' : '#ccc'}; 
        color: white; 
        border: none; 
        border-radius: 5px; 
        padding: 5px 15px; 
        cursor: ${currentPage < totalPages - 1 ? 'pointer' : 'not-allowed'}; 
        font-size: 14px;
      " ${currentPage === totalPages - 1 ? 'disabled' : ''}>下一页 →</button>
    </div>
    ` : ''}
  `);
    };

    // 每条边的当前页码存储
    const edgePageStates = new Map();

    // 绑定卡片按钮事件的辅助函数（支持重复调用）
    const bindCardButtonEvents = (edgeId, similarities, cardType) => {
      setTimeout(() => {
        const closeBtn1 = document.getElementById('closeArcCardBtn1');
        const closeBtn2 = document.getElementById('closeArcCardBtn2');
        const prevBtn1 = document.getElementById('prevPageBtn1');
        const nextBtn1 = document.getElementById('nextPageBtn1');
        const prevBtn2 = document.getElementById('prevPageBtn2');
        const nextBtn2 = document.getElementById('nextPageBtn2');

        // 关闭按钮事件（画作相似度）
        if (closeBtn1) {
          closeBtn1.onclick = function(e) {
            e.stopPropagation();
            customCardonArc1.transition().duration(200).style('visibility', 'hidden');
          };
        }
        
        // 关闭按钮事件（印章相似度）
        if (closeBtn2) {
          closeBtn2.onclick = function(e) {
            e.stopPropagation();
            customCardonArc2.transition().duration(200).style('visibility', 'hidden');
          };
        }

        // 画作相似度翻页按钮
        if (prevBtn1 && cardType === 'P-P') {
          prevBtn1.onclick = function(e) {
            e.stopPropagation();
            let page = edgePageStates.get(edgeId);
            if (page > 0) {
              page--;
              edgePageStates.set(edgeId, page);
              updateCardContent1(similarities, page);
              bindCardButtonEvents(edgeId, similarities, cardType); // 重新绑定
            }
          };
        }
        if (nextBtn1 && cardType === 'P-P') {
          nextBtn1.onclick = function(e) {
            e.stopPropagation();
            let page = edgePageStates.get(edgeId);
            if (page < similarities.length - 1) {
              page++;
              edgePageStates.set(edgeId, page);
              updateCardContent1(similarities, page);
              bindCardButtonEvents(edgeId, similarities, cardType); // 重新绑定
            }
          };
        }

        // 印章相似度翻页按钮
        if (prevBtn2 && (cardType === 'S-S' || cardType === 'S-SS')) {
          prevBtn2.onclick = function(e) {
            e.stopPropagation();
            let page = edgePageStates.get(edgeId);
            if (page > 0) {
              page--;
              edgePageStates.set(edgeId, page);
              updateCardContent2(similarities, page);
              bindCardButtonEvents(edgeId, similarities, cardType); // 重新绑定
            }
          };
        }
        if (nextBtn2 && (cardType === 'S-S' || cardType === 'S-SS')) {
          nextBtn2.onclick = function(e) {
            e.stopPropagation();
            let page = edgePageStates.get(edgeId);
            if (page < similarities.length - 1) {
              page++;
              edgePageStates.set(edgeId, page);
              updateCardContent2(similarities, page);
              bindCardButtonEvents(edgeId, similarities, cardType); // 重新绑定
            }
          };
        }
      }, 0);
    };

    // 显示卡片的点击事件（支持多页相似度）
    arc
      .on("click", function (event, d) {
        event.stopPropagation();
        
        // 获取边的 ID 作为状态键
        const edgeId = d.info.id || `${d.source?.id || d.source}_${d.target?.id || d.target}`;
        
        // 初始化该边的页码状态
        if (!edgePageStates.has(edgeId)) {
          edgePageStates.set(edgeId, 0);
        }
        let currentPage = edgePageStates.get(edgeId);
        
        // 获取 similarities 数组（如果存在），否则回退到旧的单个数据结构
        let similarities = d.info.similarities || [{
          similarity: d.info.similarity,
          url1: d.info.url1,
          url2: d.info.url2,
          angle: d.info.angle
        }];

        if (d.info.name == "P-P") {
          updateCardContent1(similarities, currentPage);
          customCardonArc1
            .style('visibility', 'visible')
          customCardonArc2
            .style('visibility', 'hidden')
          // 绑定按钮事件
          bindCardButtonEvents(edgeId, similarities, 'P-P');
        }
        if (d.info.name == "S-S" || d.info.name == "S-SS") {
          updateCardContent2(similarities, currentPage);
          customCardonArc1
            .style('visibility', 'hidden')
          customCardonArc2
            .style('visibility', 'visible')
          // 绑定按钮事件
          bindCardButtonEvents(edgeId, similarities, d.info.name);
        }

        customCardonArc1
          .style('left', `${event.pageX - 480}px`)
          .style('top', `${event.pageY - 150}px`);

        customCardonArc2
          .style('left', `${event.pageX - 480}px`)
          .style('top', `${event.pageY - 150}px`);
      });

    const parsedLinksData = linksData.map(link => ({
      source: nodesData.find(node => node.id === link.source),
      target: nodesData.find(node => node.id === link.target),
    }));

    // const filteredLinks = parsedLinksData.filter(
    //   d => d.info?.name === "R-R" || d.info?.name === "P-S"
    // );

    // 过滤归属关系边: P-A(画作-作者), P-S(画作-印章), A-S(作者-印章), SS-A(标准印-作者)
    const filteredLinks_attribution = linksData.filter(
      d => d.info?.name === "P-A" || d.info?.name === "P-S" || d.info?.name === "A-S" || d.info?.name === "SS-A"
    );
    // console.log(filteredLinks)
    const button_attribution = graphGroup.selectAll("foreignObject.attribution")
      .data(filteredLinks_attribution)
      .enter()
      .append("foreignObject")
      .attr("class", "attribution") // 添加类名
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
      .html(d => {
        // 根据 d.info?.name 的值动态设置 src
        let iconSrc = ""; 
        if (d.info?.name === "P-S" || d.info?.name === "A-S"){
          iconSrc = "../../assets/img/seal-red.png"  // 普通印章用红色
        }
        else if (d.info?.name === "SS-A"){
          iconSrc = "../../assets/img/seal-blue.png"  // 标准印章用蓝色
        }
        else{
          iconSrc = "../../assets/img/seal-blue.png"  // 其他归属关系用蓝色
        }
        return `
          <img src="${iconSrc}" alt="Icon" style="width: 20px; height: 20px; margin-left: 3px;" />
        `;
      });

    // 过滤文献-温馨，图-印章关系   R-P R-A
    const filteredLinks = linksData.filter(
      d => d.info?.name === "A-R" || d.info?.name === "P-R"
    );
    
    const buttons = graphGroup.selectAll("foreignObject.reference")
      .data(filteredLinks)
      .enter()
      .append("foreignObject")
      .attr("class", "reference") // 添加类名
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
      .html(d => {
        // 根据 d.info?.name 的值动态设置 src
        let iconSrc2 = d.info?.name === "P-R"
          ? "../../assets/img/reference-blue.png"
          : "../../assets/img/reference-green.png"; // 假设 P-S 使用红色图标
        return `
      <img src="${iconSrc2}" alt="Icon" style="width: 17px; height: 20px; margin-left: 3px;" />
    `;
      });


    // 显示自定义卡片
    const customCard3 = d3.select(containerRef.current).append('div')
      .attr('class', 'custom-card')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#fff')
      .style('border', '1px solid #ccc')
      .style('border-radius', '10px')
      .style('padding', '10px')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
      .style('width', '300px')
      .style('color', '#000')
      .style('font-size', '12px');

    // 设置点击事件显示或隐藏卡片
    buttons.on("click", function (event, d) {
      // 阻止事件冒泡
      event.stopPropagation();
      
      // 判断卡片当前是否可见，如果可见则隐藏，否则显示
      const isVisible = customCard3.style('visibility') === 'visible';

      if (isVisible) {
        // 隐藏卡片
        customCard3.transition().duration(200).style('visibility', 'hidden');
      } else {
        // 显示卡片
        customCard3.transition().duration(200).style('visibility', 'visible');

        // 构建卡片内容 - 添加关闭按钮
        let cardContent = `
          <!-- 关闭按钮 -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
            <button id="closeRefCardBtn" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #999; padding: 0; line-height: 1;">
              ✕
            </button>
          </div>
      `;
        // 遍历 linksData，找到与 d.source 和 d.target 匹配的 link
        const matchedLink = linksData.find(link =>
          (link.source.id === d.source.id && link.target.id === d.target.id) ||
          (link.source.id === d.target.id && link.target.id === d.source.id)
        );

        // 如果找到匹配的 link，显示 info.reference
        if (matchedLink && matchedLink.info && matchedLink.info.reference) {
          const entries = Object.entries(matchedLink.info.reference);
          const url = matchedLink.info.url || "https://www.baidu.com"; // 统一用顶层的 url
          entries.forEach((([key, value], index) => {
            cardContent += `
              <!-- 给value添加灰色圆角背景 -->
              <p style="font-size: 12px; margin: 0; background-color: #f0f0f0; border-radius: 8px; padding: 5px;">${value}</p>
              <!-- 添加直线 -->
              <div style="border-bottom: 1px solid #ccc; width: 190px; margin-top: 5px;"></div>
              <div style="display: flex; align-items: center; margin-top: 5px;justify-content: space-between;">
                <p style="font-size: 12px; margin-right: 5px; font-weight: bold;">${key}</p>
                <img src="../../assets/img/reference.png" alt="Icon" style="width: 17px; height: 20px; margin-right: 5px; cursor: pointer;" onclick="window.open('${url}', '_blank');" />
              </div>
            `;

            // 如果不是最后一条，添加 <br>
            if (index !== entries.length - 1) {
              cardContent += `<br>`;
            }
          }));
        }

        customCard3.html(cardContent)
          .style('left', `${event.pageX - 480}px`)  // 鼠标位置 + 偏移量
          .style('top', `${event.pageY - 150}px`); // 鼠标位置 + 偏移量
        
        // 添加关闭按钮的点击事件
        setTimeout(() => {
          const closeBtn = document.getElementById('closeRefCardBtn');
          if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              customCard3.transition().duration(200).style('visibility', 'hidden');
            });
          }
        }, 0);
      }
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

      // 更新归属边按钮位置
      graphGroup.selectAll("foreignObject.attribution")
        .attr("x", d => (d.source.x + d.target.x) / 2 - 15)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 10);

      // 更新参考边按钮位置
      graphGroup.selectAll("foreignObject.reference")
        .attr("x", d => (d.source.x + d.target.x) / 2 - 12.5)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 12.5);

      // graphGroup_attribution.selectAll("foreignObject")
      //   .attr("x", d => (d.source.x + d.target.x) / 2 - 15) // foreignObject 的位置
      //   .attr("y", d => (d.source.y + d.target.y) / 2 - 10);

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
        else if (d.info.name == "S-S" || d.info.name == "S-SS") {
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
        if (d.info.name == "P-P" || d.info.name == "S-S" || d.info.name == "S-SS") {
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
      d3.select(containerRef.current).selectAll("*").remove();
    };
  }, [dimensions, nodesData, linksData]);

  return (
    <div className="storyline" ref={containerRef}>
    </div>
  );
};

export default Storyline;
