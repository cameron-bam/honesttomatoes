const { getOriginalScore, normalizeOriginalScore, OriginalScoreTypes } = require('./original-score');
const defaultResult = require('./default-review-result');
const { profile } = require('./util/profiler');
const cheerio = require('cheerio');

const reviewHtmlClass = 'review_table_row';
const reviewIconClass = 'review_icon';
const reviewFreshClass = 'fresh';
const reviewRottenClass = 'rotten';
const reviewLinkClass = 'review-link';
const pageInfoClass = 'pageInfo';

const getTotalPagesProfiled = profile(function getTotalPages($) {
    const pageNumber = parseInt(cheerio.text($(`.${pageInfoClass}`))
    .split('of')[1]
    .trim());

    if (Number.isNaN(pageNumber)) throw new Error("Could not determine number of pages for reviews!");

    return pageNumber;
});

const checkForFreshRottenMisMatchProfiled = profile(function checkForFreshRottenMisMatch($) {
    const result = {...defaultResult};

    const reviews = $(`.${reviewHtmlClass}`);

    if (reviews.length === 0) {
        throw new Error("Couldn't find any reviews!");
    }

    result.reviewCount = reviews.length;

    for (let i = 0; i < reviews.length; i += 1) {
        let review = reviews[i];

        let reviewIcon = $(`.${reviewIconClass}`, review)[0];
        
        const rtFresh = reviewIcon.attribs.class.indexOf(reviewFreshClass) > -1;
        const rtRotten = reviewIcon.attribs.class.indexOf(reviewRottenClass) > -1;
        const rtUnknown = (rtFresh && rtRotten) || (!rtFresh && !rtRotten);

        if (rtUnknown) {
            result.rtUnknown += 1;
        } else if (rtFresh) {
            result.rtFresh += 1;
        } else if (rtRotten) {
            result.rtRotten += 1;
        }

        const reviewLink = $(`.${reviewLinkClass}`, review);
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
    }

    return result;
});

const getCheerioProfiled = profile(function getCheerio(data) {
    return cheerio.load(data);
})

function parseReview({data, checkForTotalPages = false}) {
    const dom = getCheerioProfiled(data);

    if (checkForTotalPages) {
        return {totalPages: getTotalPagesProfiled(dom), ...checkForFreshRottenMisMatchProfiled(dom)};
    }
    
    return {...checkForFreshRottenMisMatchProfiled(dom)}
}

module.exports = parseReview
