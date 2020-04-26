const axios = require('axios');
const validateRequest = require('./validate-request');
const parseReview = require('./parse-review')

module.exports = validateRequest(function getPageReviewResults({name, type, page}) {
    return axios
    .get(`https://www.rottentomatoes.com/${type}/${name}/reviews${page !== 0 ? `?page=${page}` : "" }`)
    .then(({data}) => parseReview({data}));
});