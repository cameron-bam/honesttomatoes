module.exports = function validateBeforeExecution(func) {
    return function validationWrapper(args = {}) {
        const errors = [];

        if (typeof args.name != 'string') {
            errors.push(new Error(`Name must be a string! Received value ${args.name}`));
        }
    
        if (args.type !== 'm') {
            errors.push(new Error(`Type '${args.type}' is not supported! Supported types: 'm'`));
        }

        if (errors.length > 0) {
            return Promise.reject({
                errors,
                isValidationError: true, 
                toString: function() {
                    if (this.errors.length === 1) return this.errors[0].toString();

                    return this.errors.reduce((prev, cur) => {
                        if (prev === undefined) return "";
        
                        return `${prev}, ${cur.toString()}`;
                    })
                }
            });
        }

        return func(args);
    }
}