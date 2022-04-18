
const fs = require("fs");

const NEGATIVE_ONE = -1;

const middleware = {};
fs.readdirSync(__dirname).forEach((file) => {
    if (file === "index.js" || file.indexOf(".js") === NEGATIVE_ONE) return;

    const name = file.replace(/\.js$/, "");
    if (name) {
        middleware[name] = require(`./${name}`);
    }
});

module.exports = middleware;