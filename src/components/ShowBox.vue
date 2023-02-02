<template>
  <el-space fill="fill" direction="vertical" :size="30" style="width: 100%">
    <el-space class="single-wrapper" v-for="(single, i) in resource.data" :key="i" fill="fill" direction="vertical">
      <el-row class="translation-add">
        <el-col :span="24">
          <el-card shadow="always">
            <div class="translation-add-wrapper">
              <span class="translation-word-title">{{ single.word }}</span><span class="translation-icon"
                @click="showMeaningDialog(single.word)">添加➕</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row v-for="(word, j) in single.data" :key="j" class="single-translation">
        <el-col>
          <el-card shadow="never">
            <div class="translation-content">
              <span class="translation-text">
                <span>{{ word.translation }}</span>
                <a :class="!urlHandle(word.url) ? 'tag' : 'tag-url'" v-if="word.source != null && word.source != ''"
                  :href="urlHandle(word.url)" target="_blank">
                  {{ word.source }}
                </a>
                <el-button v-if="word.source === null || word.source == ''" :data-i="i" :data-j="j"
                  @click="showTagDialog(word.translation)" size="small">添加tag</el-button>
                <a v-show="word.translation == '暂无数据，'" href="#" @click.prevent="showMeaningDialog(single.word)">点此添加
                </a>
              </span>
              <span class="icon-wrapper" v-if="word.likes != undefined">
                <span class="add-like-icon">
                  <el-button @click="changeLikes(single.word, word)" :data-i="i" :data-j="j"
                    :type="word.liked == 0 ? 'none' : 'success'" :icon="Star" circle />
                </span>
                <span class="icon-text">{{ word.likes }}</span>
              </span>
              <span class="icon-wrapper" v-if="word.likes != undefined">
                <span class="sub-extra-icon">
                  <el-button @click="showExtra(word, single.word + word.translation, single.word)" :icon="MoreFilled"
                    circle />
                </span>
                <span class="icon-text">更多</span>
              </span>
            </div>
            <Transition name="extra">
              <div class="extra-content" v-show="word.isShowExtra">
                <div class="analysis-wrapper">
                  <div :id="single.word + word.translation + 'partOfSpeech'" v-show="word.isShowAnalysis"
                    class="analysis-graph"></div>
                  <div :id="single.word + word.translation + 'fluency'" v-show="word.isShowAnalysis"
                    class="analysis-graph"></div>
                  <div class="analysis-button">
                    <el-radio-group v-model="word.partOfSpeech">
                      <el-radio-button label="褒义" />
                      <el-radio-button label="中性" />
                      <el-radio-button label="贬义" />
                    </el-radio-group>
                    <el-radio-group v-model="word.fluency">
                      <el-radio-button label="流行" />
                      <el-radio-button label="过气" />
                    </el-radio-group>
                    <el-button
                      @click="subAnalysis(single.word, word.translation, word.partOfSpeech, word.fluency, word)"
                      type="primary" :loading="word.loading">提交</el-button>
                  </div>
                </div>
                <div class="icon-wrapper" v-if="word.likes != undefined">
                  <span class="sub-error-icon">
                    <el-button @click="subTransErrors(single.word, word.translation)" type="danger" :icon="Delete"
                      circle />
                  </span>
                  <span class="icon-text">纠错</span>
                </div>
              </div>
            </Transition>
          </el-card>
        </el-col>
      </el-row>
    </el-space>
  </el-space>
  <MeaningDialog ref="meaningDialog" />
  <TagDialog ref="tagDialog" />
</template>

<script setup>
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';

import MeaningDialog from "@/components/MeaningDialog";
import TagDialog from "@/components/TagDialog";
import getStatistics from "@/hooks/useGetStatistics"
import subStatistics from "@/hooks/useSubStatistics"
import subSource from "@/hooks/useSubSource";
import addLikes from "@/hooks/useAddLikes";
import subError from "@/hooks/useSubError";
import urlHandle from "@/hooks/useUrlHandle"
import { validater } from "@/hooks/useValidater";
import { Star, Delete, MoreFilled } from "@element-plus/icons-vue";
import { reactive, ref } from 'vue'

echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  SVGRenderer
]);

const props = defineProps(["resource", "inputKeywords"]);


const tagDialog = ref(null)
const meaningDialog = ref(null)
const showMeaningDialog = (word) => {
  meaningDialog.value.showDialog(word)
}
const showTagDialog = (translation) => {
  tagDialog.value.showDialog(translation)
}

// 折叠框
async function showExtra(obj, id, word) {
  if (!obj.isDone) {
    let getData = await getStatistics(word, obj.translation)
    if (!getData.result) {
      ElMessage.error('请求超时')
      let elements = document.getElementsByClassName('extra-content')
      for (let index = 0; index < elements.length; index++) {
        elements[index].style.height = '50px';
      }
      return
    }
    drawGraph(id, getData.data)
    obj.isDone = true
    obj.isShowAnalysis = true
  }
  obj.isShowExtra = !obj.isShowExtra
}

function drawGraph(id, data) {
  var partOfSpeechChart = echarts.init(document.getElementById(id + 'partOfSpeech'), null, { renderer: 'svg' });
  var fluencyChart = echarts.init(document.getElementById(id + 'fluency'), null, { renderer: 'svg' });
  let partOfSpeechOption = {
    legend: {},
    xAxis: {
      type: 'value',
      minInterval: 1
    },
    yAxis: {
      type: 'category',
      data: ['']
    },
    label: {
      show: true,
      formatter: '{a}: {c}'
    },
    series: [
      {
        name: '褒义',
        type: 'bar',
        stack: 'total',
        data: [data[0]]
      },
      {
        name: '中性',
        type: 'bar',
        stack: 'total',
        data: [data[1]]
      },
      {
        name: '贬义',
        type: 'bar',
        stack: 'total',
        data: [data[2]]
      }
    ]
  }
  let fluencyOption = {
    legend: {},
    xAxis: {
      type: 'value',
      minInterval: 1
    },
    yAxis: {
      type: 'category',
      data: ['']
    },
    label: {
      show: true,
      formatter: '{a}: {c}'
    },
    series: [
      {
        name: '流行',
        type: 'bar',
        stack: 'total',
        data: [data[3]]
      },
      {
        name: '过气',
        type: 'bar',
        stack: 'total',
        data: [data[4]]
      }
    ]
  };
  partOfSpeechChart.setOption(partOfSpeechOption)
  fluencyChart.setOption(fluencyOption)
}

let statistics = {
  '流行': 1,
  '过气': 0,
  '褒义': 2,
  '贬义': 1,
  '中性': 0
}
async function subAnalysis(word, translation, partOfSpeech, fluency, obj) {
  obj.loading = true
  let data = await subStatistics(word, translation, statistics[fluency], statistics[partOfSpeech])
  if (data.result) {
    ElMessage.success('成功！')
    obj.loading = false
    obj.isShowExtra = false
  } else {
    ElMessage.error('失败！' + data.message)
    obj.loading = false
  }
}

async function changeLikes(word, obj) {
  let result = await addLikes(word, obj.translation)
  if (result) {
    ElMessage.success('成功！')
    if (obj.liked == 0) {
      obj.liked = 1;
      obj.likes += 1;
    } else {
      obj.liked = 0;
      obj.likes -= 1;
    }
  } else {
    ElMessage.error('失败！')
  }
}

function subTransErrors(word, translation) {
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
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

.translation-content {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
}

.extra-content {
  width: 100%;
  height: 250px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
}

.analysis-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.analysis-button {
  width: 100%;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.analysis-graph {
  width: 680px;
  height: 95px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: 800px) {
  .analysis-graph {
    width: 500px;
  }
}

@media screen and (max-width: 620px) {
  .analysis-graph {
    width: 360px;
  }
}

@media screen and (max-width: 520px) {
  .analysis-graph {
    width: 300px;
  }

  .analysis-button {
    flex-direction: column;
  }

  .extra-content {
    height: 330px;
  }
}

@media screen and (max-width: 480px) {
  .analysis-graph {
    width: 280px;
  }
}

@media screen and (max-width: 400px) {
  .analysis-graph {
    width: 230px;
  }
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
  font-size: small;
  border-radius: 3px;
  color: white;
  padding: 4px;
  background-color: #67b3ffd1;
}

.tag-url {
  font-size: small;
  border-radius: 3px;
  color: white;
  padding: 4px;
  background-color: #00bd36d1;
}

.translation-text {
  margin: 0 10px;
  display: flex;
  flex-wrap: wrap;
  flex-basis: 100%;
  justify-content: center;
  align-items: center;
  gap: 3px;
}

.extra-enter-active,
.extra-leave-active {
  transition: all .2s;
}

.extra-enter-from,
.extra-leave-to {
  opacity: 0;
  height: 0;
}
</style>