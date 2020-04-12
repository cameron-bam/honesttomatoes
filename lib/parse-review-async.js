const { Worker, isMainThread, parentPort, workerData} = require('worker_threads');
const parseReview = require('./parse-review');
const { WorkerPool } = require('./worker-pool');

if (isMainThread) {
    let pool = new WorkerPool();

    exports.parseReviewAsync = function parseReviewAsync(argObject) {
        return new Promise((resolve, reject) => {
            pool.runTask(argObject, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    };

    exports.pool = pool;
}
// } else {
//     parentPort.on('message', (message) => {
//         parentPort.postMessage(parseReview(workerData));
//     });

//     parentPort.postMessage(parseReview(workerData));
// }