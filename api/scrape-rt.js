const scrapeReviews = require('../lib/scrape-reviews');

module.exports = ({query: {name, type}}, res) => {
    scrapeReviews({name, type})
        .then((result) => res.send(JSON.stringify(result)));
}