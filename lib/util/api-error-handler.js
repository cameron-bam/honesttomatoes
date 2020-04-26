module.exports = function apiErrorHandlerWrapper(res) {
    return function apiErrorHandler(err) {
        res.status(err.isValidationError ? 400 : 500).send(err.toString());
    }
}