const { parentPort } = require('worker_threads');
const parseReview = require('./parse-review');

parentPort.on('message', (task) => {
  parentPort.postMessage(parseReview(task));
});