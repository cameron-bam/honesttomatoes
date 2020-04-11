const scrapeReviews = require('./scrape-reviews');

scrapeReviews({name: 'paddington_2', type: 'm'}).then(console.dir.bind(console));