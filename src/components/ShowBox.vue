<template>
  <el-space fill="fill" direction="vertical" :size="30" style="width: 100%">
    <el-space
      class="single-wrapper"
      v-for="(single, i) in resource.data"
      :key="i"
      fill="fill"
      direction="vertical"
    >
      <el-row class="translation-add">
        <el-col :span="24">
          <el-card shadow="always">
            <div class="translation-add-wrapper">
              <span class="translation-word-title">{{ single.word }}</span
              ><span
                class="translation-icon"
                @click="submitTranslation(single.word)"
                >添加➕</span
              >
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row
        v-for="(word, j) in single.data"
        :key="j"
        :gutter="3"
        class="single-translation"
      >
        <el-col>
          <el-card class="translation-content" shadow="never">
            <span class="translation-text">
              <span>{{ word.translation }}</span>
              <code class="tag" v-if="word.source != null">
                {{ word.source }}
              </code>
              <el-button
                v-if="word.source === null"
                :data-i="i"
                :data-j="j"
                @click="subSources"
                size="small"
                >添加tag</el-button
              >
              <a
                v-show="word.translation == '暂无数据，'"
                href="#"
                @click.prevent="submitTranslation(single.word)"
                >点此添加
              </a>
            </span>
            <span class="icon-wrapper" v-if="word.likes != undefined">
              <span class="add-like-icon">
                <el-button
                  @click="changeLikes"
                  :data-i="i"
                  :data-j="j"
                  :type="word.liked == 0 ? 'none' : 'success'"
                  :icon="Star"
                  circle
                />
              </span>
              <span class="icon-text">{{ word.likes }}</span>
            </span>
            <span class="icon-wrapper" v-if="word.likes != undefined">
              <span class="sub-error-icon">
                <el-button
                  @click="subTransErrors"
                  :data-i="i"
                  :data-j="j"
                  type="danger"
                  :icon="Delete"
                  circle
                />
              </span>
              <span class="icon-text">纠错</span>
            </span>
          </el-card>
        </el-col>
      </el-row>
    </el-space>
  </el-space>
</template>

<script setup>
import submitTranslation from "@/hooks/useSubmitTranslation";
import subSource from "@/hooks/useSubSource";
import addLikes from "@/hooks/useAddLikes";
import subError from "@/hooks/useSubError";
import { validater } from "@/hooks/useValidater";
import { Star, Delete } from "@element-plus/icons-vue";

const props = defineProps(["resource", "inputKeywords"]);

function subSources(e) {
  let i = e.target.dataset.i;
  let j = e.target.dataset.j;
  ElMessageBox.prompt("请输入Tag（单个，30字以内）", "Tag", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputValidator: validater.forLength30,
    inputErrorMessage: "内容为空或字数超过30",
  })
    .then(({ value }) => {
      subSource(props.resource.data[i].data[j].translation, value.trim());
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消",
      });
    });
}

function changeLikes(e) {
  let i = e.target.dataset.i;
  let j = e.target.dataset.j;
  addLikes(
    props.resource.data[i].word,
    props.resource.data[i].data[j].translation
  );
  if (props.resource.data[i].data[j].liked == 0) {
    props.resource.data[i].data[j].liked = 1;
    props.resource.data[i].data[j].likes += 1;
  } else {
    props.resource.data[i].data[j].liked = 0;
    props.resource.data[i].data[j].likes -= 1;
  }
}

function subTransErrors(e) {
  let i = e.target.dataset.i;
  let j = e.target.dataset.j;
  let word = props.resource.data[i].word;
  let translation = props.resource.data[i].data[j].translation;
  ElMessageBox.prompt("错误原因（100字以内）：", "纠错", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputValidator: validater.forLength100,
    inputErrorMessage: "内容为空或字数超过100",
  })
    .then(({ value }) => {
      subError(word, translation, value.trim());
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消",
      });
    });
}
</script>

<style>
.translation-add-wrapper {
  display: flex;
  justify-content: space-between;
}
.translation-word-title {
  word-break: break-all;
  font-size: large;
  font-weight: bold;
}
.single-translation .el-card__body {
  padding: 10px 0;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
.translation-icon {
  margin-left: 15px;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.translation-add .el-card__body {
  padding: 12px 8px;
}
.translation-content.el-card.is-hover-shadow {
  border: solid 1px rgb(200, 200, 200);
}
.icon-wrapper {
  font-size: small;
  display: inline-flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}
.icon-text {
  padding: 0;
}
.tag {
  border-radius: 3px;
  color: white;
  padding: 4px;
  background-color: #78bbffd1;
}
.translation-text {
  display: flex;
  flex-wrap: wrap;
  flex-basis: 100%;
  justify-content: center;
  align-items: center;
  gap: 3px;
}
</style>