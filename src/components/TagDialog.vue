<template>
    <el-dialog class="dialog" v-model="isShowDialog" lock-scroll="true" title="提交出处" width="450px" align-center center
        close-delay="100">
        <el-form label-position="top" size="large" :model="tagData" ref="singleTagForm">
            <el-form-item label="出处（30字符以内）" prop="tag" :rules="[
                {
                    required: true,
                    pattern: /\S+/,
                    message: '内容不能为空',
                    trigger: ['change', 'blur'],
                },
            ]">
                <el-input v-model="tagData.tag" maxlength="30" clearable />
            </el-form-item>
            <el-form-item label="出处链接（可不填）" prop="link" :rules="[
                {
                    pattern: /\S+/,
                    message: '内容不能为空',
                    trigger: ['change', 'blur'],
                },
            ]">
                <el-input v-model="tagData.link" maxlength="100" clearable />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button size="large" @click="isShowDialog = false">取消</el-button>
            <el-button size="large" type="primary" @click="submitForm(singleTagForm)">确认</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";
import subSource from "@/hooks/useSubSource";

// 提交出处
let singleTagForm = ref(null);
let tagData = reactive({
    translation: "",
    tag: "",
    link: null,
});

let isShowDialog = ref(false);
const showDialog = (translation) => {
    tagData.translation = translation
    isShowDialog.value = true;
};
defineExpose({ showDialog });

// 提交数据
const submitForm = async (form) => {
    if (!form) return;
    await form.validate(async (valid, fields) => {
        if (valid) {
            if (await subSource(tagData.translation, tagData.tag.trim(), tagData.link) == true) {
                ElMessage.success('提交成功！')
            } else {
                ElMessage.error('提交失败！')
            }
            isShowDialog.value = false;
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