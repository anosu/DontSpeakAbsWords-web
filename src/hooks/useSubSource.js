export default function subSource(content,tag) {
    $.ajax({
        url: "/api/addTranslationsSource",
        type: "POST",
        timeout: 3000,
        data: { translation: content, source: tag},
        dataType: "JSON",
        success: function (response) {
            if (response.code == 0) {
                ElMessage.success('提交成功！')
            } else {
                ElMessage.error('提交失败！')
            }
        },
        error: function () {
            ElMessage.error('提交失败！')
        }
    })
}