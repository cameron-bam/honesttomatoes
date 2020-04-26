const scrapeReviews = require('../lib/rt/scrape-reviews');
const getPageReviewResults = require('../lib/rt/get-page-review-results');

module.exports = ({query: {name, type, page = undefined}}, res) => {
    let resultPromise;
    
    if (typeof page === 'number') {
        resultPromise = getPageReviewResults({name, type, page});
    } else {
        resultPromise = scrapeReviews({name, type});
    }

    resultPromise.then((result) => res.send(JSON.stringify(result)));
}