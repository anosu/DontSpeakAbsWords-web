export default function subError(text, content, details) {
    $.ajax({
        url: "/api/addErratum",
        type: "POST",
        timeout: 1000,
        data: {word:text,translation:content,reason:details},
        dataType: "JSON",
        success: function (response) {
            // console.log(response)
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