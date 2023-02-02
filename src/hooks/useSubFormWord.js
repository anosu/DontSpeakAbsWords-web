let condition = [0, 0]
export default function submitFormWord(index, content) {
    if (index == content.length - 1) {
        ElMessageBox.alert("成功：" + condition[1] + "个，失败：" + condition[0] + "个", '提交完成', {
            confirmButtonText: 'OK',
        })
    } else {
        $.ajax({
            url: "/api/submitTranslationsToTemp",
            type: "POST",
            timeout: 3000,
            data: { word: content[index].word, translation: content[index].translation },
            dataType: "JSON",
            success: function (response) {
                if (response.code == 0) {
                    condition[1]++
                    submitFormWord(index+1,content)
                } else {
                    condition[0]++
                    submitFormWord(index+1,content)
                }
            },
            error: function () {
                condition[0]++
                submitFormWord(index+1,content)
            },
        });
    }
}