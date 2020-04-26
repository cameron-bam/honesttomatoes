const getTotalPages = require('../lib/rt/get-total-pages');

module.exports = ({query: {name, type}}, res) => {
    getTotalPages({name, type})
        .then((result) => res.send(JSON.stringify(result)));
}