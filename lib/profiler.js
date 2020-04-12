let instrumentedFunctions = {};


exports.profile = function profile(func) {
    const funcName = func.name;
    
    if (instrumentedFunctions[funcName]) {
        throw new Error('Already instrumenting this function!');
    }

    instrumentedFunctions[funcName] = {
        execTime: 0,
        executions: 0
    }

    return (...args) => {
        let start = Date.now();
        const result = func(...args);
        let execTime = Date.now() - start;
        instrumentedFunctions[funcName].execTime += execTime;
        instrumentedFunctions[funcName].executions += 1;

        return result;
    }
}

exports.getStats = function getStats() {
    return JSON.parse(JSON.stringify(instrumentedFunctions));
}

exports.clearStats = function() {
    const clone = {...instrumentedFunctions};
    Object.getOwnPropertyNames(clone).forEach((propName) => {
        clone[propName] = {
            execTime: 0,
            executions: 0
        }
    });

    instrumentedFunctions = clone;
}