const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require("axios");

const OriginalScoreTypes = {
    FRACTION: "fraction",
    LETTER: "letter",
    UNKNOWN: "unknown"
}

const reviewHtmlClass = 'review_table_row';
const reviewIconClass = 'review_icon';
const reviewFreshClass = 'fresh';
const reviewRottenClass = 'rotten';
const reviewLinkClass = 'review-link';
const reviewOsSeparator = 'Original Score:'

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

function getTotalPages({window: {document}}) {
    const pageNumber = parseInt(document
    .querySelector('.pageInfo')
    .innerHTML
    .split('of')[1]
    .trim());

    if (Number.isNaN(pageNumber)) throw new Error("Could not determine number of pages for reviews!");

    return pageNumber;
}

function normalizeOriginalScore(originalScore) {
    const result = {
        originalScore,
        scoreType: OriginalScoreTypes.UNKNOWN
    }

    if (typeof originalScore !== 'string') {
        return result;
    }

    if (originalScore.indexOf('/') > -1) {
        result.scoreType = OriginalScoreTypes.FRACTION;
        result.originalScore = originalScore;
        const [numerator, divisor] = originalScore.split('/');
        result.normalizedScore = Math.round(100 * (parseFloat(numerator) / parseFloat(divisor)));
    }

    return result;
}

function checkForFreshRottenMisMatch({window: {document}}) {
    const result = {
        reviewCount: 0,
        rtFresh: 0,
        rtRotten: 0,
        rtUnknown: 0,
        osFresh: 0,
        osRotten: 0,
        osUnknown: 0,
        mismatched: 0
    };

    const reviews = document.querySelectorAll(`.${reviewHtmlClass}`);

    result.reviewCount = reviews.length;

    reviews.forEach((review) => {
        const reviewIcon = review.querySelector(`.${reviewIconClass}`);
        
        const rtFresh = reviewIcon.classList.contains(reviewFreshClass);
        const rtRotten = reviewIcon.classList.contains(reviewRottenClass);
        const rtUnknown = (rtFresh && rtRotten) || (!rtFresh && !rtRotten);

        

        if (rtUnknown) {
            result.rtUnknown += 1;
        } else if (rtFresh) {
            result.rtFresh += 1;
        } else if (rtRotten) {
            result.rtRotten += 1;
        }

        const reviewLink = review.querySelector(`.${reviewLinkClass}`);
        const originalScore = normalizeOriginalScore(reviewLink.innerHTML.indexOf(reviewOsSeparator) > -1 && reviewLink.innerHTML.split(reviewOsSeparator)[1].trim());

        const osUnknown = originalScore.scoreType === OriginalScoreTypes.UNKNOWN
        const osFresh = !osUnknown && originalScore.normalizedScore >= 60;
        const osRotten = !osUnknown && !osFresh;

        if (osUnknown) {
            result.osUnknown += 1;
        } else if (osFresh) {
            result.osFresh += 1;
            
            if (rtRotten) {
                result.mismatched += 1;
            }
        } else if (osRotten) {
            result.osRotten += 1;

            if (rtFresh) {
                result.mismatched += 1;
            }
        }
    });

    return result;
}

function parseResponse({response: {data}, result, currentPage, movieName}) {
    const dom = new JSDOM(data);

    if (result.totalPages === undefined) {
        result.totalPages = getTotalPages(dom);
    }

    const newResult = plusMerge(result, checkForFreshRottenMisMatch(dom));

    if (currentPage < newResult.totalPages) {
        return fetchReviews({currentPage: currentPage + 1, movieName, result: newResult});
    }

    return newResult;
}

function fetchReviews({movieName, currentPage = 1, result = {}}) {
    if (typeof movieName != 'string') {
        throw new Error('movieName must be a string!');
    }

    return axios
        .get(`https://www.rottentomatoes.com/m/${movieName}/reviews?page=${currentPage}`)
        .then((response) => parseResponse({response, result, currentPage, movieName}))
        .catch(console.error.bind(console));
}

module.exports = (movieName) => fetchReviews({movieName});