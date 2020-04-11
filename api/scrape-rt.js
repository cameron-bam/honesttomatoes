const scrapeReviews = require('../lib/scrape-reviews');

module.exports = (req, res) => {
    const {name, type} = req.query;

    scrapeReviews({name, type})
        .then((result) => res.send(JSON.stringify(result)));
}