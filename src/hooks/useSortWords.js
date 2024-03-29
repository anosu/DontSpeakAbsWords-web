export default function sort(array) {
    let result = []
    array = array.sort(compare)
    let single = {
        word: '',
        data: []
    }
    for (let index = 0; index < array.length; index++) {
        if (index == 0) {
            single.word = array[index].word
            single.data.push({
                translation: array[index].translation,
                likes: array[index].likes,
                liked: array[index].liked,
                source: array[index].source,
                url: array[index].url,
                partOfSpeech: '中性',
                fluency: '流行',
                isDone: false,
                isShowExtra: false,
                isShowAnalysis: false,
                loading: false
            })
        } else {
            if (array[index].word == single.word) {
                single.data.push({
                    translation: array[index].translation,
                    likes: array[index].likes,
                    liked: array[index].liked,
                    source: array[index].source,
                    url: array[index].url,
                    partOfSpeech: '中性',
                    fluency: '流行',
                    isDone: false,
                    isShowExtra: false,
                    isShowAnalysis: false,
                    loading: false
                })
            } else {
                result.push(JSON.parse(JSON.stringify(single)))
                single.word = array[index].word
                single.data.length = 0
                single.data.push({
                    translation: array[index].translation,
                    likes: array[index].likes,
                    liked: array[index].liked,
                    source: array[index].source,
                    url: array[index].url,
                    partOfSpeech: '中性',
                    fluency: '流行',
                    isDone: false,
                    isShowExtra: false,
                    isShowAnalysis: false,
                    loading: false
                })
            }
        }
    }
    result.push(single)
    return result
}

function compare(item1, item2) {
    if (item1.word > item2.word) {
        return -1;
    } else if (item1.word < item2.word) {
        return 1;
    } else {
        return 0;
    }
}