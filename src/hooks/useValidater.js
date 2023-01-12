export const validater = {
    forLength30: function (text) {
        if (text.match(/^\s+$/) || text.length > 30 || text.length == 0) {
            return false
        } else {
            return true
        }
    },
    forLength50: function (text) {
        if (text.match(/^\s+$/) || text.length > 50 || text.length == 0) {
            return false
        } else {
            return true
        }
    },
    forLength100: function (text) {
        if (text.match(/^\s+$/) || text.length > 100 || text.length == 0) {
            return false
        } else {
            return true
        }
    },
}