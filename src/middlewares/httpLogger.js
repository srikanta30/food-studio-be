const morgan = require("morgan");
const logger = require("../lib/logger");

const ZERO = 0;

logger.stream = {
	write: (message) => logger.info(message.substring(ZERO, message.lastIndexOf("\n"))),
};

module.exports = morgan(":method :url :status :response-time ms - :res[content-length]", { stream: logger.stream });
