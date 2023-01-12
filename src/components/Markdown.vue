<template>
  <el-card shadow="never" body-style="text-align:left" class="md">
    <div class="markdown-body" v-html="md"></div>
  </el-card>
</template>

<script setup>
import { ref } from "@vue/reactivity";
import markdownIt from "markdown-it";

const md = ref("");
$.ajax({
  url: "https://jsd.onmicrosoft.cn/gh/IgarashiAkatuki/DontSpeakAbsWords@master/README.md",
  type: "GET",
  timeout: 3000,
  success: function (response) {
    md.value = new markdownIt().render(response);
  },
  error: function (err) {
    console.log(err);
  },
});
</script>

<style scope>
@import "github-markdown-css/github-markdown.css";
.md {
  max-width: 760px;
  margin: 0 auto;
}
</style>