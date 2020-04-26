module.exports = function getNameAndTypeFromRtLink(str) {
    const linkParts = str.split('/');
    const typeIndex = linkParts.indexOf('m');

    if (typeIndex === -1) {
        return {
            type: "unknown",
            name: "unknown"
        }
    }

    return {
        type: 'm',
        name: linkParts[typeIndex + 1]
    }
}