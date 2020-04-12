const { WorkerPool } = require('./worker-pool');
const { log } = require('./logger');

let pool = new WorkerPool();

exports.parseReviewAsync = function parseReviewAsync(argObject) {
    return new Promise((resolve, reject) => {
        log(`Submitting task to pool with ${pool.numThreads} threads`)
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