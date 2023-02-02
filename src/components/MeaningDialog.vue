<template>
    <el-dialog class="dialog" v-model="isShowDialog" lock-scroll="true" title="提交释义" width="450px" align-center center
        close-delay="100">
        <el-form label-position="top" size="large" :model="wordData" ref="translationForm">
            <el-form-item label="释义（100字符以内）" prop="translation" :rules="[
                {
                    required: true,
                    pattern: /\S+/,
                    message: '内容不能为空',
                    trigger: ['change', 'blur'],
                },
            ]">
                <el-input v-model="wordData.translation" maxlength="100" clearable />
            </el-form-item>
            <el-form-item label="出处（可不填，30字符以内）" prop="tag">
                <el-input v-model="wordData.tag" maxlength="30" clearable />
            </el-form-item>
            <el-form-item label="出处链接（可不填）" prop="link">
                <el-input v-model="wordData.link" clearable />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button size="large" @click="isShowDialog = false">取消</el-button>
            <el-button size="large" type="primary" @click="submitForm(translationForm)">确认</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import subSource from "@/hooks/useSubSource";
import { ref, reactive } from "vue";

// 提交词条
let translationForm = ref(null);
let wordData = reactive({
    word: "",
    translation: "",
    tag: "",
    link: null
});

let isShowDialog = ref(false);
const showDialog = (word) => {
    wordData.word = word
    isShowDialog.value = true;
};
defineExpose({ showDialog });

// 提交数据
const submitForm = async (form) => {
    if (!form) return;
    await form.validate((valid, fields) => {
        if (valid) {
            isShowDialog.value = false;
            $.ajax({
                url: "/api/submitTranslationsToTemp",
                type: "POST",
                timeout: 3000,
                data: { word: wordData.word, translation: wordData.translation },
                dataType: "JSON",
                success: function (response) {
                    if (response.code == 0) {
                        ElMessage.success("提交成功！");
                        if (wordData.tag != "") {
                            subSource(wordData.translation.trim(), wordData.tag.trim(), wordData.link)
                        } else {
                            translationForm.value.resetFields();
                        }
                    } else {
                        translationForm.value.resetFields();
                        ElMessage.error("提交失败！");
                    }
                },
                error: function (error) {
                    console.log(error)
                    translationForm.value.resetFields();
                    ElMessage.error("提交失败！");
                },
            });
        } else {
            ElMessage.warning("内容为空");
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