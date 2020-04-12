const { WorkerPool } = require('./worker-pool');

let pool = new WorkerPool({taskPath: __dirname + '/parse-review-worker.js'});

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