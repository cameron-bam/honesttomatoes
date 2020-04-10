const scrapeReviews = require('./scrape-reviews');

scrapeReviews().then(console.dir.bind(console));