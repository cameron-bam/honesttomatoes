module.exports = function apiErrorHandlerWrapper(res) {
    return function apiErrorHandler(err) {
        if (err.isValidationError) {
            res.status(400).send(err.errors.reduce((prev, cur) => {
                if (prev === undefined) return "";

                return `${prev}, ${cur.toString()}`;
            }));
        } else {
            res.status(500).send(err.toString());
        }
    }
}