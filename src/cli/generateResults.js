const { logger } = require('../helpers');
const { generateMongoCompareResult } = require('../lib');

module.exports = async (configFilePath = 'mongo-compare-config.json') => {
    try {
        await generateMongoCompareResult(configFilePath);
    } catch (error) {
        logger.error(
            `error to generate the compare result [Error Details: ${error.message}]`
        );
    }
};
