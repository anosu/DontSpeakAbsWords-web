<template>
  <section>
    <el-container class="main-wrapper-inner">
      <el-main>
        <!-- 下面是一个文本框 -->
        <textarea
          name="input"
          id="input"
          v-model="inputKeywords"
          rows="10"
          maxlength="100"
          placeholder="在这里输入要翻译的词（包括但不限于拼音缩写/中文黑话/emoji，100字符以内）"
          autofocus
        ></textarea>
        <!-- 下面展示返回的数据 -->
        <div v-if="showReturn" v-loading="showLoading" class="show-box">
          <el-space fill="fill" direction="vertical" style="width: 100%">
            <el-row class="translation-add">
              <el-col :span="24">
                <el-card shadow="never">
                  <div class="translation-add-wrapper">
                    <span class="translation-word-title">{{
                      inputKeywords
                    }}</span
                    ><span
                      class="translation-icon"
                      @click="submitTranslation(inputKeywords)"
                      >添加➕</span
                    >
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-row
              v-for="(word, index) in resource.data"
              :key="index"
              :gutter="3"
              class="single-translation"
            >
              <el-col>
                <el-card class="translation-content" shadow="hover">
                  <span class="translation-text">
                    <span>{{ word.translation }}</span>
                    <code class="tag" v-if="word.source != null">
                      {{ word.source }}
                    </code>
                    <el-button
                      v-if="word.source === null"
                      :data-index="index"
                      @click="subSources"
                      size="small"
                      >添加tag</el-button
                    >
                    <a
                      v-show="word.translation == '暂无数据，'"
                      href="#"
                      @click.prevent="submitTranslation(inputKeywords)"
                      >点此添加
                    </a>
                  </span>
                  <span class="icon-wrapper" v-if="word.word">
                    <span class="add-like-icon">
                      <el-button
                        @click="changeLikes"
                        :data-index="index"
                        :type="word.liked == 0 ? 'none' : 'success'"
                        :icon="Star"
                        circle
                      />
                    </span>
                    <span class="icon-text">{{ word.likes }}</span>
                  </span>
                  <span class="icon-wrapper" v-if="word.word">
                    <span class="sub-error-icon">
                      <el-button
                        @click="subTransErrors"
                        :data-index="index"
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
        </div>
        <el-button id="add-btn" type="success" size="large" @click="showDialog"
          >添加词条</el-button
        >
        <el-dropdown
          split-button
          type="primary"
          @click="getQuesBtn.canClick && getQuesBtn.clickCase()"
          size="large"
          :disabled="getQuesBtn.disabled"
          trigger="click"
          :hide-on-click="false"
        >
          {{ getQuesBtn.text }}
          <template #dropdown>
            <el-card style="width: 360px">
              <!-- <template #header>
                <span><strong>题量</strong></span>
              </template> -->
              <el-slider
                :min="5"
                :max="20"
                v-model="getQuesBtn.wordsNum"
                show-input
              />
            </el-card>
          </template>
        </el-dropdown>
        <div
          v-show="question.isShowWrapper"
          v-loading="question.isLoading"
          class="ques-wrapper"
          style="min-height: 200px"
        >
          <Question
            :words="resource.words"
            v-if="question.isShow"
            @closeQues="closeQuestion"
          />
        </div>
        <el-button
          v-if="setu.isShowGetBtn"
          @click="getSetu"
          size="large"
          type="warning"
          style="display: block; margin: 30px auto"
          >获取图片</el-button
        >
        <div
          class="setu-wrapper"
          v-show="setu.isShowWrapper"
          v-loading="setu.isLoading"
        >
          <Setu :url="setu.url" v-if="setu.isShow" />
        </div>
      </el-main>
    </el-container>
  </section>
  <WordDialog ref="wordDialog" />
</template>

<script setup>
// 引入
import Question from "@/components/Question";
import Setu from "@/components/Setu";
import WordDialog from "@/components/WordDialog";
import useDelayRef from "@/hooks/useDelayRef";
import submitTranslation from "@/hooks/useSubmitTranslation";
import addLikes from "@/hooks/useAddLikes";
import subError from "@/hooks/useSubError";
import subSource from "@/hooks/useSubSource";
import { reactive, ref, watch } from "vue";
import { Star, Delete } from "@element-plus/icons-vue";

$(function () {
  ElNotification({
    title: "提示",
    message: "成功提交问卷可获得一张涩图",
    duration: 3000,
    showClose: true,
  });
});

// 定义变量
let inputKeywords = useDelayRef("");
let showLoading = ref(true);
let showReturn = ref(false);

let resource = reactive({ words: {}, data: [] });
// 定义监视函数
watch(
  inputKeywords,
  (newValue) => {
    resource.data.length = 0;
    if (newValue.match(/\S/) == null) {
      //输入框中的值为空的行为
      showReturn.value = false;
    } else {
      //输入框中的值不为空的行为
      // 显示加载图标
      showReturn.value = true;
      showLoading.value = true;
      $.ajax({
        url: "/api/getTranslationsFromPersistence",
        type: "POST",
        timeout: 3000,
        data: { word: newValue },
        dataType: "JSON",
        success: function (response) {
          console.log(response)
          if (response.code != 0) {
            resource.data = [{ translation: "暂无数据，" }];
            showLoading.value = false;
          } else {
            let translations = response.data.map((word) => word.translation);
            $.ajax({
              url: "/api/isLiked",
              type: "POST",
              timeout: 3000,
              traditional: true,
              data: { translations: translations },
              dataType: "JSON",
              success: function (array) {
                array.forEach((value, index) => {
                  response.data[index].liked = value;
                });
                resource.data = response.data.sort(compare);
                showLoading.value = false;
              },
              error: function () {
                resource.data = [{ translation: "请求失败" }];
                showLoading.value = false;
              },
            });
          }
        },
        error: function () {
          resource.data = [{ translation: "请求失败" }];
          showLoading.value = false;
        },
      });
    }
  },
  { immediate: true }
);

// 按like数排序函数
function compare(word1, word2) {
  if (word1.likes > word2.likes) {
    return -1;
  } else if (word1.likes < word2.likes) {
    return 1;
  } else {
    return 0;
  }
}

const wordDialog = ref(null);
const showDialog = () => {
  wordDialog.value.showDialog();
};

// 问卷与涩图
let setu = reactive({
  isShowGetBtn: false,
  isShowWrapper: false,
  isLoading: true,
  isShow: false,
  url: "",
});
let getQuesBtn = reactive({
  clickCase: getQuestion,
  leftTime: 60,
  text: "获取问卷",
  wordsNum: 5,
  canClick: true,
  disabled: false,
});
let question = reactive({
  isShowWrapper: false,
  isLoading: false,
  isShow: false,
});
function getQuestion() {
  question.isShowWrapper = true;
  question.isLoading = true;
  $.ajax({
    url: "/api/getRandomQuestionnaire",
    type: "POST",
    timeout: 3000,
    data: { limit: getQuesBtn.wordsNum },
    dataType: "JSON",
    success: function (response) {
      if (response.code != 0) {
        getQuesBtn.leftTime = parseInt(response.message.match(/\d+(?=秒)/));
        getQuesBtn.clickCase = waitQuestion;
        var waitTimer = setInterval(() => {
          getQuesBtn.leftTime -= 1;
        }, 1000);
        setTimeout(() => {
          getQuesBtn.clickCase = getQuestion;
          clearInterval(waitTimer);
          getQuesBtn.leftTime = 60;
        }, getQuesBtn.leftTime * 1000);
        ElMessage.warning("还有" + getQuesBtn.leftTime + "秒可以再次获取问卷");
        question.isLoading = false;
        question.isShowWrapper = false;
      } else {
        getQuesBtn.clickCase = waitQuestion;
        var waitTimer = setInterval(() => {
          getQuesBtn.leftTime -= 1;
        }, 1000);
        setTimeout(() => {
          getQuesBtn.clickCase = getQuestion;
          clearInterval(waitTimer);
          getQuesBtn.leftTime = 60;
        }, 60000);
        resource.words = response.data;
        question.isShow = true;
        getQuesBtn.canClick = false;
        question.isLoading = false;
        getQuesBtn.text = "成功！！";
      }
    },
    error: function (error) {
      ElMessage.error("发生错误，" + error);
      question.isShowWrapper = false;
      question.isLoading = false;
    },
  });
}

function waitQuestion() {
  ElMessage.warning("还有" + getQuesBtn.leftTime + "秒可以再次获取问卷");
}

function closeQuestion() {
  question.isShow = false;
  question.isShowWrapper = false;
  getQuesBtn.text = "获取问卷";
  getQuesBtn.canClick = true;
  setu.isShowGetBtn = true;
}

function getSetu() {
  setu.isShowGetBtn = false;
  setu.isLoading = true;
  setu.isShowWrapper = true;
  $.ajax({
    url: "https://moe.jitsu.top/api/?sort=setu&type=json",
    type: "POST",
    timeout: 3600,
    success: function (response) {
      setu.url = response.pics[0];
      setu.isShow = true;
      setu.isLoading = false;
    },
    error: function () {
      $.ajax({
        url: "https://moe.jitsu.top/api/?sort=setu&type=json",
        type: "POST",
        timeout: 3600,
        success: function (response) {
          setu.url = response.pics[0];
          setu.isShow = true;
          setu.isLoading = false;
        },
        error: function (error) {
          console.log(error);
          setu.url =
            "https://tvax4.sinaimg.cn/large/ec43126fgy1gx5p436yu5j21041hg7wi.jpg";
          setu.isShow = true;
          setu.isLoading = false;
        },
      });
    },
  });
}

function changeLikes(e) {
  let index = e.target.dataset.index;
  addLikes(inputKeywords.value, resource.data[index].translation);
  if (resource.data[index].liked == 0) {
    resource.data[index].liked = 1;
    resource.data[index].likes += 1;
  } else {
    resource.data[index].liked = 0;
    resource.data[index].likes -= 1;
  }
}

function subTransErrors(e) {
  let index = e.target.dataset.index;
  let translation = resource.data[index].translation;
  ElMessageBox.prompt("错误原因（100字以内）：", "纠错", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /^\S{1,100}$/,
    inputErrorMessage: "内容为空或字数超过100",
  })
    .then(({ value }) => {
      subError(inputKeywords.value, translation, value.trim());
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消",
      });
    });
}

function subSources(e) {
  let index = e.target.dataset.index;
  let translation = resource.data[index].translation;
  ElMessageBox.prompt("请输入Tag（单个，30字以内）", "Tag", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /^\S{1,30}$/,
    inputErrorMessage: "内容为空或字数超过30",
  })
    .then(({ value }) => {
      subSource(translation, value.trim());
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
.main-wrapper {
  width: 800px;
  min-width: 200px;
}
#input {
  resize: none;
  position: relative;
  display: block;
  width: 100%;
  padding: 10px 11px;
  border: none;
  outline: none;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0 0 0 1px rgb(163, 163, 163) inset;
  margin-bottom: 20px;
  font-family: Arial, Helvetica, sans-serif;
}
#input:focus {
  box-shadow: 0 0 0 1px #409eff inset;
}
#input::-webkit-scrollbar {
  display: none;
}
.show-box {
  margin-bottom: 30px;
  width: 100%;
  height: auto;
  min-height: 100px;
}
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
  flex-direction: row;
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
.translation-add .el-card__body {
  padding: 12px 8px;
}
.show-box .el-icon,
.el-button > span {
  pointer-events: none;
}
.translation-content.el-card.is-hover-shadow {
  border: solid 1px rgb(200, 200, 200);
}
.translation-text {
  flex-basis: 100%;
}
@media screen and (max-width: 960px) {
  .main-wrapper {
    width: 100%;
  }
}
.ques-wrapper {
  margin-top: 30px;
}
.setu-wrapper {
  margin-top: 30px;
  min-height: 500px;
  background-color: rgba(255, 255, 255, 0);
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
  justify-content: center;
  align-items: center;
  gap: 3px;
}
#add-btn {
  margin-right: 20px;
}
</style>