const { WorkerPool } = require('./worker-pool');

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