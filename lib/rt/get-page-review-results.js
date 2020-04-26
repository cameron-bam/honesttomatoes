const axios = require('axios');
const validateRequest = require('./validate-request');
const { parseReviewAsync } = require('./parse-review-async');

module.exports = validateRequest(function getPageReviewResults({name, type, page}) {
    return axios
    .get(`https://www.rottentomatoes.com/${type}/${name}/reviews?page=${page}`)
    .then(({data}) => parseReviewAsync({data}));
});