module.exports = function validateBeforeExecution(func) {
    return function validationWrapper(args = {}) {
        const errors = [];

        if (typeof args.name != 'string') {
            errors.push(new Error('movieName must be a string!'));
        }
    
        if (args.type !== 'm') {
            errors.push(new Error("Sorry, but only movies are supported at this time!"));
        }

        if (errors.length > 0) {
            throw {
                errors,
                validationError: true, 
                toString: function() {
                    return this.errors.reduce((prev, cur) => {
                        if (prev === undefined) return "";
        
                        return `${prev}, ${cur.toString()}`;
                    })
                }
            };
        }

        return func(args);
    }
}