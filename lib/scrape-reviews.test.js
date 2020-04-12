const scrapeReviews = require('./scrape-reviews');

scrapeReviews({name: 'bad_boys_for_life', type: 'm'}).then(console.dir.bind(console));