export default function getStatistics(word, translation) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/getStatistics",
            type: "POST",
            timeout: 5000,
            data: {
                word: word,
                translation: translation
            },
            dataType: "JSON",
            success: function (response) {
                if (response.code == 0) {
                    let data = response.data
                    data = [data.commendation, data.neutral, data.derogatory, data.popular, data.outdated]
                    resolve({
                        result: true,
                        data: data
                    })
                } else {
                    resolve({
                        result: false
                    })
                }
            },
            error: function () {
                resolve({
                    result: false
                })
            }
        })
    })
}