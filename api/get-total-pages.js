const getTotalPages = require('../lib/rt/get-total-pages');
const apiErrorHandler = require('../lib/util/api-error-handler');

module.exports = ({query: {name, type}}, res) => {
    getTotalPages({name, type})
        .then((result) => res.send(JSON.stringify(result)))
        .catch(apiErrorHandler(res));
}