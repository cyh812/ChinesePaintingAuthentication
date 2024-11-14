<template>
  <div class="kg">
    <div ref="chart" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import jsonData from "@/assets/data/data.json"; // 导入本地 JSON 数据

export default {
  name: "kg",
  data() {
    return {
      nodes: jsonData.nodes || [], // 使用导入的节点数据
      links: jsonData.links || [], // 使用导入的链接数据
      categories: jsonData.categories || [] // 使用导入的分类数据
    };
  },

  mounted() {
    // 获取图表容器
    const chartDom = this.$refs.chart;

    // 初始化 ECharts 实例
    const myChart = echarts.init(chartDom);

    // 设置图表的数据
    this.updateChart(myChart);
  },

  methods: {
    updateChart(myChart) {
      // 设置节点的大小
      this.nodes.forEach(function (node) {
        node.symbolSize = 5;
      });

      // 配置 ECharts 的 option
      const option = {
        title: {
          text: 'Les Miserables',
          subtext: 'Default layout',
          top: 'bottom',
          left: 'right'
        },
        tooltip: {},
        legend: [
          {
            // selectedMode: 'single',
            data: this.categories.map(function (a) {
              return a.name;
            })
          }
        ],
        series: [
          {
            name: 'Les Miserables',
            type: 'graph',
            layout: 'force',
            data: this.nodes,
            links: this.links,
            categories: this.categories,
            draggable: true,
            roam: true,
            label: {
              position: 'right'
            },
            force: {
              repulsion: 100
            }
          }
        ]
      };

      // 使用配置项设置图表
      myChart.setOption(option);
    }
  }
};
</script>

<style scoped>
.kg {
  background-color: rgb(255, 255, 255);
  width: 100%;
  height: 98.5%;
  border-radius: 10px;
  position: relative;
}
</style>
