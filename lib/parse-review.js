const JSDOM = require("jsdom").JSDOM;
const { getOriginalScore, normalizeOriginalScore, OriginalScoreTypes } = require('./original-score');
const defaultResult = require('./default-review-result');

const reviewHtmlClass = 'review_table_row';
const reviewIconClass = 'review_icon';
const reviewFreshClass = 'fresh';
const reviewRottenClass = 'rotten';
const reviewLinkClass = 'review-link';

function getTotalPages({window: {document}}) {
    const pageNumber = parseInt(document
    .querySelector('.pageInfo')
    .innerHTML
    .split('of')[1]
    .trim());

    if (Number.isNaN(pageNumber)) throw new Error("Could not determine number of pages for reviews!");

    return pageNumber;
}

function checkForFreshRottenMisMatch({window: {document}}) {
    const result = {...defaultResult};

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
        const originalScore = normalizeOriginalScore(getOriginalScore(reviewLink));

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

function parseReview ({data, totalPages, checkForTotalPages = false}) {
    const dom = new (require('jsdom').JSDOM)(data);

    if (totalPages === undefined) {
        totalPages = getTotalPages(dom);
    }

    if (checkForTotalPages) {
        return {totalPages: getTotalPages(dom), ...checkForFreshRottenMisMatch(dom)};
    }
    
    return {...checkForFreshRottenMisMatch(dom)}
}

module.exports = parseReview
