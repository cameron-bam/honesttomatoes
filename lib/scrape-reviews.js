const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require("axios");

function parseResponse({ data }, result, currentPage) {
    const dom = new JSDOM(data);
    const newResult = {...result};

    if (newResult.totalPages === undefined) {
        newResult.totalPages = getTotalPages(dom);
    }

    newResult.reviewCount += getReviewCount(dom);

    if (currentPage < newResult.totalPages) {
        return fetchReviews(currentPage + 1, newResult);
    }

    return newResult;
}

function getTotalPages({window: {document}}) {
    const pageNumber = parseInt(document
    .querySelector('.pageInfo')
    .innerHTML
    .split('of')[1]
    .trim());

    if (Number.isNaN(pageNumber)) throw new Error("Could not determine number of pages for reviews!");

    return pageNumber;
}

function getReviewCount({window: {document}}) {
    return document.querySelectorAll('.review_table_row').length;
}

function fetchReviews(currentPage = 1, result = {reviewCount: 0}) {
    return axios
        .get(`https://www.rottentomatoes.com/m/ip_man_4_the_finale/reviews?page=${currentPage}`)
        .then((response) => parseResponse(response, result, currentPage))
        .catch(console.error.bind(console));
}

module.exports = () => fetchReviews();