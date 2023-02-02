export default function subSource(content,tag,link) {
    return new Promise((resolve, reject)=>{
        $.ajax({
            url: "/api/addTranslationsSource",
            type: "POST",
            timeout: 3000,
            data: { translation: content, source: tag, url: link},
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