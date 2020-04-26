const axios = require("axios");
const { parseReviewAsync, pool } = require('./parse-review-async');
const defaultResult = require('./default-review-result');
const { log, error } = require('../util/logger');
const plusMerge = require('../util/plusmerge');
const validateRequest = require('./validate-request');

let startTime;

// TODO - clw - store these results in a DB to prevent abuse of RT.
const fetchReviews = validateRequest(function fetchReviews({name, type, currentPage = 1}) {
    startTime = Date.now();

    let totalPages;
    let firstResult;

    // fetch the first review
    log('Making first request')
    return axios
        .get(`https://www.rottentomatoes.com/${type}/${name}/reviews?page=${currentPage}`)
        .then(({data}) => {
            log('Parsing first review');
            return parseReviewAsync({data, checkForTotalPages: true});
        })
        .then(({totalPages: respTotalPages, ...result}) => {
            log('Fetching all reviews');

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
            log(`Parsing all the reviews using a threadpool of size ${pool.numThreads}`)
            return Promise.all(allResponses
                .map(({data}) => parseReviewAsync({data, totalPages})));
        })
        .then((results) => {
            log('Aggregating results');
            results.push(firstResult);
            return results.reduce(plusMerge, {...defaultResult});
        });
});

module.exports = ({name, type}) => fetchReviews({name, type}).then((result) => {
    result.rtScore = Math.round(100 * (result.rtFresh / (result.reviewCount - result.rtUnknown)));
    result.osScore = Math.round(100 * (result.osFresh / (result.reviewCount - result.osUnknown)));
    return result;
})
.catch(error)
.then((result) => {
    log('Closing threadpool...')
    return pool.close().then(() => {
        log(`Done! Took ${Date.now() - startTime} milliseconds`);
        return result;
    });
});