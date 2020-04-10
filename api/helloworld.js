const {prop} = require('./someFile');

module.exports = (req, res) => {
    res.send(`Hello World! Prop value is ${prop}`);
}