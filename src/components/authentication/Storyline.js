import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./Storyline.css"; // 引入样式

const Storyline = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 创建图表
    const createChart = () => {
      if (!containerRef.current) return;

      const container = d3.select(containerRef.current);
      const containerWidth = container.node()?.clientWidth || 0;
      const containerHeight = container.node()?.clientHeight || 0;

      const svg = container
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

      const gap = 15;
      const width = containerWidth - 20;
      const h1 = 50;
      const h2 = (containerHeight - h1 - 7 * gap) / 5;

      const rects = [
        { width, height: h2, rx: 10, fill: "rgba(190, 190, 190,0.1)", x: 10, y: gap, class: "seal" },
        { width, height: h2, rx: 10, fill: "rgba(190, 190, 190,0.1)", x: 10, y: 2 * gap + h2, class: "painting" },
        { width, height: h2, rx: 10, fill: "rgba(190, 190, 190,0.1)", x: 10, y: 3 * gap + 2 * h2, class: "people" },
        { width, height: h2, rx: 10, fill: "rgba(190, 190, 190,0.1)", x: 10, y: 4 * gap + 3 * h2, class: "event" },
        { width, height: h2, rx: 10, fill: "rgba(190, 190, 190,0.1)", x: 10, y: 5 * gap + 4 * h2, class: "position" },
        { width, height: h1, rx: 0, fill: "rgba(190, 190, 190,0.1)", x: 10, y: 6 * gap + 5 * h2, class: "time" },
      ];

      svg
        .selectAll("rect")
        .data(rects)
        .enter()
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("width", (d) => d.width)
        .attr("height", (d) => d.height)
        .attr("rx", (d) => d.rx) // 圆角
        .attr("fill", (d) => d.fill) // 填充颜色
        .attr("class", (d) => d.class);

      svg.select(".time").on("click", function (event) {
        console.log(event);
        alert("Time rect clicked");
      });
    };

    createChart();

    // 清理函数，防止多次渲染
    return () => {
      d3.select(containerRef.current).select("svg").remove();
    };
  }, []);

  return <div className="storyline" ref={containerRef}></div>;
};

export default Storyline;
