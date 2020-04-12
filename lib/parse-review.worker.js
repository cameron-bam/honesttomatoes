const { Worker, isMainThread, parentPort, workerData} = require('worker_threads');
const parseReview = require('./parse-review');
const workerpool = require('workerpool');
const pool = workerpool.pool({minWorkers: 'max', workerType: 'thread'});

if (isMainThread) {
    exports.parseReviewAsync = function parseReviewAsync(argObject) {
        // return new Promise((resolve, reject) => {
        //     const worker =  new Worker( __filename, {
        //         workerData: argObject 
        //     });

        //     worker.on('message', resolve);
        //     worker.on('error', reject);
        //     worker.on('exit', (code) => {
        //         if (code !== 0) {
        //             reject (new Error(`Worker stopped with exit code ${code}`));
        //         }
        //     });
        // });
        return pool.exec(parseReview, [argObject]);
    };

    exports.pool = pool;
} else {
    parentPort.postMessage(parseReview(workerData));
}