const OriginalScoreTypes = {
    FRACTION: "fraction",
    LETTER: "letter",
    UNKNOWN: "unknown"
}

const reviewOsSeparator = 'Original Score:'
const letterGrades = ['F', 'D', 'C', 'B', 'A'];
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

function getOriginalScore(reviewLink) {
    if (reviewLink.innerHTML.indexOf(reviewOsSeparator) > -1) {
        return reviewLink.innerHTML.split(reviewOsSeparator)[1].trim();
    }
 
    return '';
}

module.exports = { getOriginalScore, normalizeOriginalScore, OriginalScoreTypes };