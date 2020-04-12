
exports.log = (msg) => {
    console.log(`${new Date()}: ${msg}`)
}

exports.error = (msg) => {
    console.error(`${new Date()}: ${msg.stack}`);
}