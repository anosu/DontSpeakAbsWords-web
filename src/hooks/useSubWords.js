export default function subWords() {
    ElMessageBox.prompt('输入需要被翻译的词条', '添加', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern: /^\S{1,50}$/,
        inputErrorMessage: '内容为空',
    })
        .then(({ value }) => {
            $.ajax({
                url: "/api/addWords",
                type: "POST",
                timeout: 3000,
                data: { word: value.trim() },
                dataType: "JSON",
                success: function (response) {
                    if (response.code == 0) {
                        ElMessage.success('添加成功！')
                    } else {
                        ElMessage.error('添加失败！')
                    }
                },
                error: function () {
                    ElMessage.error('添加失败！')
                }
            })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '取消',
            })
        })
}