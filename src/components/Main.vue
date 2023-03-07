<template>
  <section>
    <el-container class="main-wrapper-inner">
      <el-main>
        <div class="switch-wrapper">
          <span class="el-switch"> 模糊搜索：</span><el-switch v-model="showBox.fuzzy" />
        </div>
        <!-- 下面是一个文本框 -->
        <textarea name="input" id="input" v-model="inputKeywords" rows="10" maxlength="100"
          placeholder="在这里输入要翻译的词（包括但不限于拼音缩写/中文黑话/emoji，100字符以内）" autofocus></textarea>
        <!-- 下面展示返回的数据 -->
        <div v-if="showBox.return" v-loading="showBox.loading" class="show-box">
          <ShowBox v-if="showBox.main" :inputKeywords="inputKeywords" :resource="resource" />
        </div>
        <div class="btn-wrapper">
          <el-button id="add-btn" type="success" size="large" @click="showDialog">添加词条</el-button>
          <el-dropdown split-button type="primary" @click="getQuesBtn.canClick && getQuesBtn.clickCase()" size="large"
            :disabled="getQuesBtn.disabled" trigger="click" :hide-on-click="false">
            {{ getQuesBtn.text }}
            <template #dropdown>
              <el-card style="width: 360px">
                <!-- <template #header>
                <span><strong>题量</strong></span>
              </template> -->
                <el-slider :min="1" :max="20" v-model="getQuesBtn.wordsNum" show-input />
              </el-card>
            </template>
          </el-dropdown>
        </div>
        <div v-show="question.isShowWrapper" v-loading="question.isLoading" class="ques-wrapper"
          style="min-height: 200px">
          <Question :words="resource.words" v-if="question.isShow" @closeQues="closeQuestion" />
        </div>
        <el-button v-if="setu.isShowGetBtn" @click="getSetu" size="large" type="warning"
          style="display: block; margin: 30px auto">获取图片</el-button>
        <div class="setu-wrapper" v-show="setu.isShowWrapper" v-loading="setu.isLoading">
          <Setu :url="setu.url" v-if="setu.isShow" />
        </div>
      </el-main>
    </el-container>
  </section>
  <WordDialog ref="wordDialog" />
</template>

<script setup>
// 引入
import Setu from "@/components/Setu";
import ShowBox from "@/components/ShowBox";
import Question from "@/components/Question";
import WordDialog from "@/components/WordDialog";
import useDelayRef from "@/hooks/useDelayRef";
import sortWords from "@/hooks/useSortWords";
import { computed, reactive, ref, watch } from "vue";

$(function () {
  ElNotification({
    title: "提示",
    message: "成功提交问卷可获得一张美图",
    duration: 3000,
    showClose: true,
  });
});

// 定义变量
let inputKeywords = useDelayRef("");
let showBox = reactive({
  main: false,
  return: false,
  loading: true,
  fuzzy: false,
});
let apiUrl = computed(() => {
  return showBox.fuzzy
    ? "/api/fuzzyQuery"
    : "/api/getTranslationsFromPersistence";
});

let resource = reactive({ words: {}, data: [] });
// 定义监视函数
watch(
  [inputKeywords, apiUrl],
  ([newValue]) => {
    resource.data.length = 0;
    if (newValue.match(/\S/) == null) {
      //输入框中的值为空的行为
      showBox.main = false;
      showBox.return = false;
    } else {
      //输入框中的值不为空的行为
      // 显示加载图标
      showBox.return = true;
      showBox.loading = true;
      $.ajax({
        url: apiUrl.value,
        type: "POST",
        timeout: 5000,
        data: { word: newValue },
        dataType: "JSON",
        success: function (response) {
          if (response.code != 0) {
            resource.data = [
              { word: inputKeywords, data: [{ translation: "暂无数据，" }] },
            ];
            showBox.main = true;
            showBox.loading = false;
          } else {
            let translations = response.data.map((word) => word.translation);
            $.ajax({
              url: "/api/isLiked",
              type: "POST",
              timeout: 5000,
              traditional: true,
              data: { translations: translations },
              dataType: "JSON",
              success: function (array) {
                array.forEach((value, index) => {
                  response.data[index].liked = value;
                });
                resource.data = sortWords(response.data.sort(compare));
                showBox.main = true;
                showBox.loading = false;
              },
              error: function () {
                resource.data = [
                  { word: inputKeywords, data: [{ translation: "请求失败" }] },
                ];
                showBox.main = true;
                showBox.loading = false;
              },
            });
          }
        },
        error: function () {
          ElMessage.error("请求超时")
          resource.data = [
            { word: inputKeywords, data: [{ translation: "请求失败" }] },
          ];
          showBox.main = true;
          showBox.loading = false;
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
    error: function (error, textStatus, errorThrown) {
      ElMessage.error("发生错误，" + textStatus, errorThrown);
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
            "https://pic.rmb.bdstatic.com/bjh/deba8ed0fff162acdb0dc256eb02bd04.jpeg";
          setu.isShow = true;
          setu.isLoading = false;
        },
      });
    },
  });
}
</script>

<style>
.main-wrapper {
  width: 800px;
  min-width: 200px;
}

.switch-wrapper {
  text-align: left;
  padding-left: 5px;
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

.btn-wrapper {
  width: 100%;
  /* padding-top: 15px; */
}

.show-box {
  margin-bottom: 30px;
  width: 100%;
  height: auto;
  min-height: 100px;
}

.el-loading-mask {
  border-radius: 4px;
}

.show-box .el-icon,
.show-box .el-button>span {
  pointer-events: none;
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

#add-btn {
  margin-right: 20px;
}
</style>