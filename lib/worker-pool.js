const { EventEmitter } = require('events');
const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');
const { log, error } = require('./util/logger');
const plusMerge = require('./util/plusmerge');

const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');
const kTaskCallback = Symbol('kTaskCallback');
let poolCloseTimer;

exports.WorkerPool = class WorkerPool extends EventEmitter {
    constructor({numThreads = os.cpus().length, taskPath, maxListeners = 100000}) {
        super();
        this.numThreads = numThreads;
        this.workers = [];
        this.freeWorkers = [];
        this.taskPath = taskPath;
    
        for (let i = 0; i < numThreads; i++) {
          this.addNewWorker();
        }

        this.setMaxListeners(maxListeners);

        log(`Created new worker pool with ${numThreads} workers.`);
      }

      addNewWorker() {
        const worker = new Worker(path.resolve(this.taskPath));
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

      runTask(task, callback, worker) {
        if (this.freeWorkers.length === 0 && !worker) {
          // No free threads, wait until a worker thread becomes free.
          this.once(kWorkerFreedEvent, () => this.runTask(task, callback));
          return;
        }
    
        const targetWorker = worker || this.freeWorkers.pop();
        targetWorker[kTaskCallback] = callback;
        targetWorker.postMessage(task);
      }

      // Removes a worker and returns all of the profiled stats collected
      // while it was running
      removeWorker(worker) {
        return new Promise((res, rej) => {
          worker[kTaskCallback] = (err, result) => {
            if (err) {
              rej(err);
            } else {
              res(result);
            }
            this.workers.splice(this.workers.indexOf(worker), 1);
            this.freeWorkers.splice(this.freeWorkers.indexOf(worker), 1);
            worker.terminate();
          };

          worker.postMessage('logstats');
        });
      }

      // Shuts down the thread pool and logs all execution stats
      close(exitOnClose = true) {
        let pool = this;
        const allWorkers = [...pool.workers];

        // Safeguard to ensure the process doesn't hang
        poolCloseTimer = setTimeout(() => {
          console.warn(`Failed to close pool!`);
          console.dir(pool);
          if (exitOnClose) process.exit(1);
        }, 1500);

        // Collect stats from all the workers, and then terminate them
        return Promise.all(allWorkers.map((worker) => this.removeWorker(worker)))
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
            clearTimeout(poolCloseTimer);
          });
      }
}