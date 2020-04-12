const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require("axios");

const OriginalScoreTypes = {
    FRACTION: "fraction",
    LETTER: "letter",
    UNKNOWN: "unknown"
}

const letterGrades = ['F', 'D', 'C', 'B', 'A'];
const letterGradeRange = Math.round(100/6);
const modifierAdjustment = Math.round(letterGradeRange / 3);

const reviewHtmlClass = 'review_table_row';
const reviewIconClass = 'review_icon';
const reviewFreshClass = 'fresh';
const reviewRottenClass = 'rotten';
const reviewLinkClass = 'review-link';
const reviewOsSeparator = 'Original Score:'
const defaultResult = {
    reviewCount: 0,
    rtFresh: 0,
    rtRotten: 0,
    rtUnknown: 0,
    osFresh: 0,
    osRotten: 0,
    osUnknown: 0,
    mismatched: 0
};

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

function getOriginalScore(reviewLink) {
   if (reviewLink.innerHTML.indexOf(reviewOsSeparator) > -1) {
       return reviewLink.innerHTML.split(reviewOsSeparator)[1].trim();
   }

   return '';
}

function normalizeOriginalScore(originalScore) {
    const result = {
        originalScore,
        scoreType: OriginalScoreTypes.UNKNOWN
    }

    if (typeof originalScore !== 'string' || originalScore === '') {
        return result;
    }

    if (originalScore.indexOf('/') > -1) {
        result.scoreType = OriginalScoreTypes.FRACTION;
        result.originalScore = originalScore;
        const [numerator, divisor] = originalScore.split('/');
        result.normalizedScore = Math.round(100 * (parseFloat(numerator) / parseFloat(divisor)));

        return result;
    }

    if (!Number.isNaN(parseFloat(originalScore))) {
        result.scoreType = OriginalScoreTypes.FRACTION;
        result.originalScore = parseFloat(originalScore) * 20;

        return result;
    }

    const letterGradeIndex = letterGrades.indexOf(originalScore[0].toLocaleUpperCase());

    if (letterGradeIndex > -1) {
        result.scoreType = OriginalScoreTypes.LETTER;
        result.normalizedScore = letterGradeIndex * letterGradeRange;

        if (originalScore.indexOf('+') > -1) {
            result.normalizedScore += 2 * modifierAdjustment;
        } else if (originalScore.indexOf('-') === -1) {
            result.normalizedScore += modifierAdjustment;
        }

        return result;
    }

    console.warn(`Found original score that couldn't be normalized! Original Score: ${originalScore}`);
    return result;
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

function parseResponse({response: {data}, totalPages}) {
    const dom = new JSDOM(data);

    if (totalPages === undefined) {
        totalPages = getTotalPages(dom);
    }

    return {totalPages, ...checkForFreshRottenMisMatch(dom)};
}

// TODO - clw - store these results in a DB to prevent abuse of RT.
function fetchReviews({name, type, currentPage = 1}) {
    if (typeof name != 'string') {
        throw new Error('movieName must be a string!');
    }

    if (type !== 'm') {
        throw new Error("Sorry, but only movies are supported at this time!");
    }

    return axios
        .get(`https://www.rottentomatoes.com/${type}/${name}/reviews?page=${currentPage}`)
        .then((response) => parseResponse({response}))
        .then(({totalPages, ...result}) => {
            if (totalPages <= 1) {
                return result;
            }

            const pageResults = [Promise.resolve(result)];

            for (let i = currentPage + 1; i <= totalPages; i += 1) {
                pageResults.push(
                    axios
                    .get(`https://www.rottentomatoes.com/${type}/${name}/reviews?page=${i}`)
                    .then((response) => parseResponse({response, totalPages}))
                    .then(({totalPages, ...result}) => result)
                );
            }

            return Promise.all(pageResults);
        })
        .then((allResults) => {
            return allResults.reduce(plusMerge, {...defaultResult})
        })
        .catch(console.error.bind(console));
}

module.exports = ({name, type}) => fetchReviews({name, type}).then((result) => {
    result.rtScore = Math.round(100 * (result.rtFresh / (result.reviewCount - result.rtUnknown)));
    result.osScore = Math.round(100 * (result.osFresh / (result.reviewCount - result.osUnknown)));
    return result;
});