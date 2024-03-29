export default function addLikes(text, content) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/addLikesToPersistence",
            type: "POST",
            timeout: 3000,
            data: { word: text, translation: content },
            dataType: "JSON",
            success: function (response) {
                if (response.code == 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            },
            error: function () {
                resolve(false)
            }
        })
    })
}