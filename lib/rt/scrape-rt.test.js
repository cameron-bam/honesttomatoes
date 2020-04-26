const scrapeReviews = require('../../api/scrape-rt');

let statusCodeVal = 200

scrapeReviews({query: {name: 'captain_marvel', type: 'm', page: 1}}, {
    send: (str) => {
        console.dir(str);
        console.dir(statusCodeVal);
    },
    status: function (code) {
        if (typeof code !== "number") {
            throw new Error('Status code must be a number!')
        }

        statusCodeVal = code;
        return this;
    }
});