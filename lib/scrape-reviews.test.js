const scrapeReviews = require('./scrape-reviews');

scrapeReviews({name: 'captain_marvel', type: 'm'}).then(console.dir.bind(console));