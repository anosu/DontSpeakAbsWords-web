export default function urlHandle(url) {
    if (url == null || url == "null") {
        return null
    } else {
        return url.replaceAll('_', '/').replaceAll('-', '.')
    }
}