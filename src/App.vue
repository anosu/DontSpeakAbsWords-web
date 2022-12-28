<template>
  <div class="wrapper">
    <div class="main-wrapper">
      <Title />
      <Main />
      <Markdown />
    </div>
  </div>
</template>

<script setup>
// 引入
import Title from "./components/Title";
import Main from "./components/Main";
import Markdown from "@/components/Markdown";
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body::-webkit-scrollbar {
  display: none;
}
body {
  background-color: rgb(242, 242, 242);
}
.wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
input::selection {
    background:#79bbff;
    color: white;
}
</style>
