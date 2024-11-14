<template>
  <div class="top-bar">
    <div class="title-container">
      <img src="./assets/img/logo.png" alt="Custom Icon" class="icon" />
      <span class="title"
        >Chinese Ancient Paintings Authentication Interactive Visualization
        System</span
      >
    </div>
  </div>
  <div class="bottom-container">
    <div class="left-side">
      <painting-view />
    </div>

    <div class="right-side">
      <div class="right-side-top">
        <segments />
      </div>
      <div class="right-side-buttom">
        <div class="right-side-buttom-left">
          <knowlefge-graph />
        </div>
        <div class="right-side-buttom-right">
          <storyline />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PaintingView from "./components/PaintingView.vue";
import KnowlefgeGraph from "./components/KG.vue";
import Segments from "./components/Segments.vue";
import Storyline from "./components/Storyline.vue";

export default {
  name: "App",
  components: {
    PaintingView,
    Segments,
    KnowlefgeGraph,
    Storyline,
  },
};
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  background-color: #ede8e3;
}
</style>


<style scoped>
/* 上层 div，占 5% 高度 */
.top-bar {
  height: 5%;
  width: 100%;
  background-color: #ffffff; /* 示例背景色 */
  color: white;
  text-align: center;
  display: flex;
  /* justify-content: center;
  align-items: center; */
}

/* 下层 div，占 95% 高度 */
.bottom-container {
  display: flex;
  height: 95%;
  width: 100%;
}

/* 左侧 div，占 30% 宽度 */
.left-side {
  width: 25%;
  background-color: #ede8e3; /* 示例背景色 */
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 右侧 div，占 70% 宽度 */
.right-side {
  width: 75%;
  background-color: #ede8e3; /* 示例背景色 */
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.right-side-top {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.right-side-buttom {
  width: 100%;
  height: 80%;
  display: flex;
}

.right-side-buttom-left {
  width: 60%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* background-color: aqua; */
}

.right-side-buttom-right {
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* background-color: rgb(8, 53, 53); */
}

/* 标题和 icon 容器 */
.title-container {
  display: flex;
  align-items: center; /* 垂直居中对齐 icon 和 title */
  justify-content: flex-start; /* 左对齐 */
  margin-left: 1%; /* 距离左侧 5% */
  height: 100%; /* 确保容器占满整个高度 */
}

/* 自定义 icon 样式 */
.icon {
  width: 40px; /* 设置 icon 的大小 */
  height: 40px;
  margin-right: 10px; /* icon 和标题之间的间距 */
}

.title {
  font-family: Arial, sans-serif; /* 设置标题字体为 Arial */
  font-size: 25px; /* 标题字体大小 */
  color: #8a6746; /* 标题颜色 */
  font-weight: bolder;
}
</style>
