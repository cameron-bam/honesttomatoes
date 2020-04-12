const scrapeReviews = require('../../api/scrape-rt');

scrapeReviews({query: {name: 'captain_marvel', type: 'm'}}, {send: (str) => console.dir(str)});