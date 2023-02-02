export default function subTranslation(word, translation) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/submitTranslationsToTemp",
            type: "POST",
            timeout: 3000,
            data: { word: word, translation: translation },
            dataType: "JSON",
            success: function (response) {
                if (response.code == 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            },
            error: function (err) {
                console.log(err)
                resolve(false)
            }
        })
    })
}