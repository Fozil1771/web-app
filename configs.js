const path = require('path')


module.exports.dbPath = function (collection) {
    return path.join(__dirname, `/${collection}.json`)
}