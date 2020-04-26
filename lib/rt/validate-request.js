module.exports = function validateBeforeExecution(func) {
    return function validationWrapper(args = {}) {
        if (typeof args.name != 'string') {
            throw new Error('movieName must be a string!');
        }
    
        if (args.type !== 'm') {
            throw new Error("Sorry, but only movies are supported at this time!");
        }

        return func(args);
    }
}