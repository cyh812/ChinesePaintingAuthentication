<template>
  <div class="storyline"></div>
</template>

<script>
import * as d3 from "d3";

export default {
    name:"storyline",
    mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const data = [30, 86, 168, 281, 303, 365];

      const svg = d3
        .select(".storyline")

        .append("svg")

        .attr("width", 500)

        .attr("height", 500);

      svg
        .selectAll("rect")

        .data(data)

        .enter()

        .append("rect")

        .attr("x", (d, i) => i * 70)

        .attr("y", (d) => 500 - d)

        .attr("width", 65)

        .attr("height", (d) => d)

        .attr("fill", "steelblue");

      // 在这里添加你的D3代码
    },
  },
}
</script>

<style scoped>
.storyline {
  background-color: rgb(255, 255, 255);
  width: 96%;
  height: 98.5%;
  border-radius: 10px;
}
</style>