export default function addLikes(text, content) {
    // console.log(content)
    $.ajax({
        url: "/api/addLikesToPersistence",
        type: "POST",
        timeout: 3000,
        data: { word: text, translation: content },
        dataType: "JSON",
        success: function (response) {
            // console.log(response)
            if (response.code == 0) {
                ElMessage.success('成功！')
            } else {
                ElMessage.error('失败！')
            }
        },
        error: function () {
            ElMessage.error('失败！')
        }
    });
}