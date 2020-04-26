const axios = require("axios");
const validateRequest = require('./validate-request');
const { parseReviewAsync } = require('./parse-review-async');

module.exports = validateRequest(function getTotalPages({type, name}) {
    return axios
        .get(`https://www.rottentomatoes.com/${type}/${name}/reviews`)
        .then(({data}) => parseReviewAsync({data, checkForTotalPages: true}))
        .then(({totalPages}) => ({totalPages}));
});