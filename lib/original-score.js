const cheerio = require('cheerio');

const OriginalScoreTypes = {
    FRACTION: "fraction",
    LETTER: "letter",
    UNKNOWN: "unknown"
}

const reviewOsSeparator = 'Original Score:'
const letterGrades = {
    'F': 0, 
    'D': 1, 
    'C': 2,
    'B':3, 
    'A': 4
};
const letterGradeRange = Math.round(100/6);
const modifierAdjustment = Math.round(letterGradeRange / 3);

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

    const letterGradeIndex = letterGrades[originalScore[0].toLocaleUpperCase()];

    if (typeof letterGradeIndex === 'number') {
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

function getOriginalScore(reviewLink) {
    let originalScore =  cheerio.text(reviewLink).split(reviewOsSeparator)[1]

    if (typeof originalScore != 'string') {
        return '';
    }

    return originalScore.trim();
}

module.exports = { getOriginalScore, normalizeOriginalScore, OriginalScoreTypes };