const scrapeReviews = require('./scrape-reviews');

scrapeReviews('like_a_boss').then(console.dir.bind(console));