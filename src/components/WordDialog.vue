<template>
  <el-dialog
    class="dialog"
    v-model="isShowDialog"
    lock-scroll="true"
    title="提交词条"
    width="450px"
    align-center
    center
    close-delay="100"
  >
    <el-form
      label-position="top"
      size="large"
      :model="wordData"
      ref="singleWordForm"
    >
      <el-form-item
        label="词条（50字符以内）"
        prop="word"
        :rules="[
          {
            required: true,
            pattern: /\S+/,
            message: '内容不能为空',
            trigger: ['change', 'blur'],
          },
        ]"
      >
        <el-input v-model="wordData.word" maxlength="50" clearable />
      </el-form-item>
      <el-form-item
        label="释义（非必填，100字符以内）"
        prop="translation"
        :rules="[
          {
            pattern: /\S+/,
            message: '内容不能为空',
            trigger: ['change', 'blur'],
          },
        ]"
      >
        <el-input v-model="wordData.translation" maxlength="100" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button size="large" @click="isShowDialog = false">取消</el-button>
      <el-button size="large" type="primary" @click="submitForm(singleWordForm)"
        >确认</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";

// 提交词条
let singleWordForm = ref(null);
let wordData = reactive({
  word: "",
  translation: "",
});

let isShowDialog = ref(false);
const showDialog = () => {
  isShowDialog.value = true;
};
defineExpose({ showDialog });

// 提交数据
const submitForm = async (form) => {
  if (!form) return;
  await form.validate((valid, fields) => {
    if (valid) {
      let text = wordData.word.trim()
      isShowDialog.value = false;
      $.ajax({
        url: "/api/addWords",
        type: "POST",
        timeout: 3000,
        data: { word: text },
        dataType: "JSON",
        success: function (response) {
          console.log(response)
          if (response.code == 0) {
            ElMessage.success("词条添加成功！");
            if (wordData.translation != "") {
              $.ajax({
                url: "/api/submitTranslationsToTemp",
                type: "POST",
                timeout: 3000,
                data: {
                  word: text,
                  translation: wordData.translation.trim(),
                },
                dataType: "JSON",
                success: function (response) {
                  singleWordForm.value.resetFields();
                  if (response.code == 0) {
                    ElMessage.success("释义提交成功！");
                  } else {
                    ElMessage.error("释义提交错误！");
                  }
                },
                error: function () {
                  singleWordForm.value.resetFields();
                  ElMessage.error("释义提交失败！");
                },
              });
            } else {
              singleWordForm.value.resetFields();
            }
          } else {
            singleWordForm.value.resetFields();
            ElMessage.error("词条添加失败！");
          }
        },
        error: function (error) {
          console.log(error)
          singleWordForm.value.resetFields();
          ElMessage.error("词条添加失败！");
        },
      });
    } else {
      ElMessage.warning("内容为空");
      // console.log('error submit!', fields)
    }
  });
};
</script>

<style scope>
.dialog .el-dialog__body {
  padding-bottom: 0;
  padding-top: 20px;
}
@media screen and (max-width: 512px) {
  .dialog {
    width: 90%;
  }
}
</style>