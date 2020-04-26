const apiErrorHandler = require('../lib/util/api-error-handler');

module.exports = ({query: {name, type, page}}, res) => {
    let resultPromise;
    
    if (typeof page === 'number') {
        resultPromise = require('../lib/rt/get-page-review-results')({name, type, page});
    } else {
        resultPromise = require('../lib/rt/scrape-reviews')({name, type});
    }

    resultPromise
        .then((result) => res.send(JSON.stringify(result)))
        .catch(apiErrorHandler(res));
}