const scrapeReviews = require('../api/scrape-rt');

scrapeReviews({query: {name: 'paddington_2', type: 'm'}}, {send: (str) => console.dir(str)});