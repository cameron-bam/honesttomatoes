const scrapeReviews = require('./scrape-reviews');

scrapeReviews({name: 'everything_sucks_', type: 'tv'}).then(console.dir.bind(console));