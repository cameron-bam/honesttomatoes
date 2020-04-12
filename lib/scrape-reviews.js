const axios = require("axios");
const parseReview = require('./parse-review');
const defaultResult = require('./default-review-result');

function logWithTimestamp(message) {
    console.log(`${Date.now()}: ${message}`);
}

function plusMerge(a, b) {
    const result = {...a};

    Object.getOwnPropertyNames(b).forEach((key) => {
        if (Number.isNaN(parseInt(result[key]))) {
            result[key] = 0;
        }
        
        result[key] += b[key];
    });

    return result;
}

// TODO - clw - store these results in a DB to prevent abuse of RT.
function fetchReviews({name, type, currentPage = 1}) {
    if (typeof name != 'string') {
        throw new Error('movieName must be a string!');
    }

    if (type !== 'm') {
        throw new Error("Sorry, but only movies are supported at this time!");
    }

    let totalPages;
    let firstResult;

    // fetch the first review
    logWithTimestamp('Making first request')
    return axios
        .get(`https://www.rottentomatoes.com/${type}/${name}/reviews?page=${currentPage}`)
        .then(({data}) => {
            logWithTimestamp('Parsing first review');
            return parseReview({data, checkForTotalPages: true});
        })
        .then(({totalPages: respTotalPages, ...result}) => {
            logWithTimestamp('Fetching all reviews');

            firstResult = result;
            totalPages = respTotalPages;

            if (respTotalPages <= 1) {
                return result;
            }

            const pageResults = [];

            // fetch all of the reviews, now that we know how many there are
            for (let i = currentPage + 1; i <= totalPages; i += 1) {
                pageResults.push(
                    axios
                    .get(`https://www.rottentomatoes.com/${type}/${name}/reviews?page=${i}`)
                );
            }

            return Promise.all(pageResults);
        })
        .then((allResponses) => {
            logWithTimestamp('Parsing all the reviews')
            return allResponses
                .map(({data}) => parseReview({data, totalPages}));
        })
        .then((results) => {
            logWithTimestamp('Aggregating results');
            return results.reduce(plusMerge, {...defaultResult});
        })
        .catch(console.error.bind(console));
}

module.exports = ({name, type}) => fetchReviews({name, type}).then((result) => {
    result.rtScore = Math.round(100 * (result.rtFresh / (result.reviewCount - result.rtUnknown)));
    result.osScore = Math.round(100 * (result.osFresh / (result.reviewCount - result.osUnknown)));
    return result;
});