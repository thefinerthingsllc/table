function isAlphaNumeric (word) {
    var regex = /^[0-9a-zA-Z]+$/;
    return word.match(regex);
}

module.exports = {
    isAlphaNumeric: isAlphaNumeric,
};