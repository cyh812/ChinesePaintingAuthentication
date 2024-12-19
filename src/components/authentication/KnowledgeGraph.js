import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import jsonData from "../../assets/data/data1.json"; // 导入本地 JSON 数据
import "./KnowledgeGraph.css"

const KnowledgeGraph = () => {
    // 创建一个 ref，用于绑定 ECharts 容器
    const chartRef = useRef(null);

    useEffect(() => {
        // 初始化数据
        const nodes = jsonData.nodes || [];
        const links = jsonData.links || [];
        const categories = jsonData.categories || [];

        // 设置节点的大小
        nodes.forEach((node) => {
            node.symbolSize = 15;
        });

        // 获取 ECharts 容器并初始化图表实例
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);

            // 配置 ECharts 的 option
            const option = {
                title: {
                    text: "Les Miserables",
                    subtext: "Default layout",
                    top: "bottom",
                    left: "right",
                },
                tooltip: {},
                legend: [
                    {
                        data: categories.map((a) => a.name),
                    },
                ],
                series: [
                    {
                        name: "Les Miserables",
                        type: "graph",
                        layout: "force",
                        data: nodes,
                        links: links,
                        categories: categories,
                        draggable: true,
                        roam: true,
                        label: {
                            position: "right",
                        },
                        force: {
                            repulsion: 100,
                        },
                    },
                ],
            };

            // 使用配置项设置图表
            myChart.setOption(option);

            // 销毁实例，防止内存泄漏
            //   return () => {
            //     myChart.dispose();
            //   };
        }
    }, []);


    return (
        <div className="kg">
            {/* 图表容器 */}
            <div ref={chartRef} style={{ width: "100%", height: "100%" }}></div>
        </div>
    );
};

export default KnowledgeGraph;
