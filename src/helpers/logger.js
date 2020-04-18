const { createLogger, transports: Transports, format } = require('winston');

const { combine, colorize, timestamp, align, printf, simple, splat } = format;

const customFormat = combine(
    colorize(),
    timestamp(),
    align(),
    splat(),
    simple(),
    printf(({ message, level, timestamp: time }) => {
        return `[${time}] [${level}] - ${message.trim()}`;
    })
);

const loggerOptions = {
    console: {
        level: 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
        format: customFormat,
    },
};

const logger = createLogger({
    transports: [new Transports.Console(loggerOptions.console)],
    exceptionHandlers: [new Transports.Console(loggerOptions.console)],
    exitOnError: false,
});

/**
 * Module that provides the configured logger
 * @name module:Helpers.logger
 */
module.exports = logger;
