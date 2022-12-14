export default function submitTranslation(text) {
    ElMessageBox.prompt('请输入释义（不超过100个字符）：', '提交', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern: /^\S{1,100}$/,
        inputErrorMessage: '内容为空或字数超过100',
    })
        .then(({ value }) => {
            // 查询词条
            $.ajax({
                url: "/api/queryWord",
                type: "POST",
                timeout: 1000,
                data: { word: text },
                dataType: "JSON",
                success: function (response) {
                    if (response.code == 0) {
                        // 若有则直接追加翻译
                        $.ajax({
                            url: "/api/submitTranslationsToTemp",
                            type: "POST",
                            timeout: 3000,
                            data: { word: text, translation: value.trim() },
                            dataType: "JSON",
                            success: function (response) {
                                console.log(response);
                                if (response.code == 0) {
                                    ElMessage.success('提交成功！')
                                } else {
                                    ElMessage.error('提交错误！')
                                }
                            },
                            error: function () {
                                ElMessage.error('提交失败！')
                            },
                        })
                    } else {
                        // 若没有则添加词条
                        $.ajax({
                            url: "/api/addWords",
                            type: "POST",
                            timeout: 3000,
                            data: { word: text },
                            dataType: "JSON",
                            success: function (response) {
                                if (response.code == 0) {
                                    // 添加完之后追加翻译
                                    $.ajax({
                                        url: "/api/submitTranslationsToTemp",
                                        type: "POST",
                                        timeout: 3000,
                                        data: { word: text, translation: value.trim() },
                                        dataType: "JSON",
                                        success: function (response) {
                                            console.log(response);
                                            if (response.code == 0) {
                                                ElMessage.success('提交成功！')
                                            } else {
                                                ElMessage.error('提交错误！')
                                            }
                                        },
                                        error: function () {
                                            ElMessage.error('提交失败！')
                                        },
                                    });
                                }
                            },
                            error: function () {
                                ElMessage.error('添加词条失败！')
                            },
                        });
                    }
                },
                error: function () {
                    ElMessage.error('查询时发生错误！')
                },
            });
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '取消',
            })
        })
}