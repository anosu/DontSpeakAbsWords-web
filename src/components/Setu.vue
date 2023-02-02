<template>
  <el-image style="width: 100%" :src="url" :fit="fit">
    <template #placeholder>
      <div class="image-slot">
        <h3>加载中...</h3>
      </div>
    </template>
    <template #error>
      <div class="image-slot">
        <h3>加载失败，可能你运气不好</h3>
      </div>
    </template>
  </el-image>
  <h2>涩图</h2>
</template>

<script>
export default {
  props: ["url"],
};
</script>

<style>

</style>