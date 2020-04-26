const scrapeReviews = require('../../api/get-total-pages');

let statusCodeVal = 200

scrapeReviews({query: {name: 'captain_marvel', type: 'l'}}, {
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