const { parentPort } = require('worker_threads');
const parseReview = require('./parse-review');
const { getStats } = require('./profiler');

parentPort.on('message', (task) => {
  if (task === 'logstats') {
    parentPort.postMessage(getStats());
  } else {
    parentPort.postMessage(parseReview(task));
  }
});