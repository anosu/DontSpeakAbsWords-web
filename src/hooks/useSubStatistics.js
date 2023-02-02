export default function subStatistics(word, translation, fluency, partOfSpeech) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/submitStatistics",
            type: "POST",
            timeout: 5000,
            data: {
                word: word,
                translation: translation,
                fluency: fluency,
                partOfSpeech: partOfSpeech
            },
            dataType: "JSON",
            success: function (response) {
                if (response.code == 0) {
                    resolve({
                        result: true
                    })
                } else {
                    resolve({
                        result: false,
                        message: response.message
                    })
                }
            },
            error: function () {
                resolve({
                    result: false,
                })
            }
        })
    })
}