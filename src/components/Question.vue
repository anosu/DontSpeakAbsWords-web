<template>
  <div class="ques-wrapper" v-loading="isQuesLoading">
    <h2>问卷：知道几个填几个</h2>
    <el-form ref="wordsForm" :model="formData" label-position="top" class="ques-form" style="max-width: 800px">
      <el-form-item v-for="(content, index) in words" :key="index" :label="`${index + 1}. ${content.word}`"
        :prop="'content.' + index + '.translation'" :rules="[
          {
            pattern: /\S+/,
            message: '内容不能为空',
            trigger: ['change', 'blur'],
          },
        ]">
        <el-space class="question-space" fill direction="vertical">
          <div class="question-space">
            <el-input v-model="formData.content[index].translation" size="large" maxlength="100" placeholder="请输入释义">
              <template #append>
                <el-button :icon="MoreFilled" @click="formData.content[index].more = !formData.content[index].more" />
              </template>
            </el-input>
          </div>
          <Transition name="fade">
            <el-space class="question-space more" fill v-show="formData.content[index].more">
              <el-input v-model="formData.content[index].tag" size="large" maxlength="100" placeholder="出处（可不填）" />
              <el-input v-model="formData.content[index].link" size="large" maxlength="100" placeholder="出处链接（可不填）" />
            </el-space>
          </Transition>
        </el-space>
      </el-form-item>

      <el-form-item size="large" class="form-btn">
        <el-button type="danger" @click="wordsForm.resetFields()">清空</el-button>
        <el-button type="primary" @click="submitForm(wordsForm)">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import subSource from "@/hooks/useSubSource";
import { MoreFilled } from "@element-plus/icons-vue";
import { ref, reactive } from "@vue/reactivity";

// 从父组件接收数据
const emit = defineEmits(["closeQues"]);
const props = defineProps(["words"]);
const wordsForm = ref("");
let formData = reactive({
  content: []
});
for (let i = 0; i < props.words.length; i++) {
  formData.content.push({ word: props.words[i].word, translation: "", more: false, tag: "", link: null })
}

// 提交表单
const submitForm = async (form) => {
  if (!form) return;
  let data = formData.content.filter((i) => i.translation != "");
  if (data.length == 0) {
    ElMessage.warning("内容为空");
    return;
  }
  let reg = /^[A-Za-z0-9]$/
  let data_valid = data.filter((i) => !(reg.test(i.translation) || i.word == i.translation))
  await form.validate((valid, fields) => {
    if (valid) {
      isQuesLoading.value = true;
      if (data_valid.length == 0) {
        ElMessage.success("提交完成")
        isQuesLoading.value = false;
        emit("closeQues");
      } else {
        submitFormWord(0, data_valid);
      }
    } else {
      ElMessage.error("含有非法内容");
      // console.log('error submit!', fields)
    }
  });
};

let isQuesLoading = ref(false);
let condition = [0, 0]; // [0]表示失败次数，[1]表示成功次数
function submitFormWord(index, content) {
  if (index == content.length) {
    ElMessageBox.alert(
      "成功：" + condition[1] + "个，失败：" + condition[0] + "个",
      "提交完成",
      {
        confirmButtonText: "OK",
      }
    );
    isQuesLoading.value = false;
    emit("closeQues");
  } else {
    $.ajax({
      url: "/api/submitTranslationsToTemp",
      type: "POST",
      timeout: 3000,
      data: {
        word: content[index].word,
        translation: content[index].translation,
      },
      dataType: "JSON",
      success: function (response) {
        // console.log(response)
        if (response.code == 0) {
          condition[1]++;
          if (content[index].tag != "") {
            subSource(content[index].translation, content[index].tag.trim(), content[index].link)
          }
          submitFormWord(index + 1, content);
        } else {
          condition[0]++;
          submitFormWord(index + 1, content);
        }
      },
      error: function (error) {
        // console.log(error);
        condition[0]++;
        submitFormWord(index + 1, content);
      },
    });
  }
}
</script>

<style>
.ques-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin: 50px auto 0;
  width: 100%;
}

.question-space {
  width: 100%;
}

.more {
  height: 96px;
}

.ques-form {
  width: 100%;
}

.form-btn div {
  display: flex;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: all .5s;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(25px);
  opacity: 0;
  height: 0;
}
</style>