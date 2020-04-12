const { EventEmitter } = require('events');
const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');
const { log, error } = require('./logger');
const plusMerge = require('./plusmerge');

const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');
const kTaskCallback = Symbol('kTaskCallback');

exports.WorkerPool = class WorkerPool extends EventEmitter {
    constructor(numThreads = os.cpus().length) {
        super();
        this.numThreads = numThreads;
        this.workers = [];
        this.freeWorkers = [];
    
        for (let i = 0; i < numThreads; i++) {
          this.addNewWorker();
        }

        this.setMaxListeners(100000);

        log(`Created new worker pool with ${numThreads} workers.`);
      }

      addNewWorker() {
        const worker = new Worker(path.resolve(__dirname, 'task-processor.js'));
        worker.on('message', (result) => {
          // In case of success: Call the callback that was passed to `runTask`,
          // remove the `TaskInfo` associated with the Worker, and mark it as free
          // again.
          let callback = worker[kTaskCallback];
          setTimeout(() => callback(null, result));
          worker[kTaskCallback] = null;
          this.freeWorkers.push(worker);
          this.emit(kWorkerFreedEvent);
        });
        worker.on('error', (err) => {
          // In case of an uncaught exception: Call the callback that was passed to
          // `runTask` with the error.
          if (worker[kTaskCallback]) {
            let callback = worker[kTaskCallback];
            setTimeout(() => callback(err, null)); 
          } else {
            this.emit('error', err);
          }
          // Remove the worker from the list and start a new Worker to replace the
          // current one.
          this.workers.splice(this.workers.indexOf(worker), 1);
          this.addNewWorker();
        });
        this.workers.push(worker);
        this.freeWorkers.push(worker);
      }

      runTask(task, callback) {
        if (this.freeWorkers.length === 0) {
          // No free threads, wait until a worker thread becomes free.
          this.once(kWorkerFreedEvent, () => this.runTask(task, callback));
          return;
        }
    
        const worker = this.freeWorkers.pop();
        worker[kTaskCallback] = callback;
        worker.postMessage(task);
      }

      close() {
        let pool = this;
        return Promise.all(
          this.workers
          .map((worker) => {
            return new Promise((res, rej) => {
              pool.runTask('logstats', (err, result) => {
                if (err) {
                  rej(err);
                } else {
                  res(result);
                }
                worker.terminate();
              });
            });
          }))
          .then((allStats) => {
            const mergedStats = allStats.reduce((prev, cur) => {
              if (!prev) return cur;

              let result = {}

              Object.getOwnPropertyNames(prev).forEach((prop) => {
                result[prop] = plusMerge(prev[prop], cur[prop]);
              });

              return result;
            })

            console.dir(mergedStats);
          });
      }
}