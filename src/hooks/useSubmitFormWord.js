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


    // let length = text.length
    // for (let i = 0; i < length; i++) {
    //     (function (time, index) {   // 注意这里是形参
    //         setTimeout(function () {
    //             $.ajax({
    //                 url: "/api/submitTranslationsToTemp",
    //                 type: "POST",
    //                 timeout: 1000,
    //                 data: { word: text[index], translation: content[index] },
    //                 dataType: "JSON",
    //                 success: function (response) {
    //                     if (response.info == 1) {
    //                         condition[1]++
    //                     } else {
    //                         condition[0]++
    //                     }
    //                 },
    //                 error: function () {
    //                     condition[0]++
    //                 },
    //             });
    //         }, 100 * time);
    //     })(1, i)   // 注意这里是实参，这里把要用的参数传进去
    // }
    // (function (data) {
    //     setTimeout(() => {
    //         alert("有效提交次数：" + data + "，成功：" + condition[1] + "个，失败：" + condition[0] + "个")
    //         isQuesLoading.value = false
    //         emit("closeQues");
    //     }, 1500)
    // })(length)
}