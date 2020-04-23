const Joi = require('@hapi/joi');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const logger = require('./logger');

/**
 * function that generate the file name based on actual date
 * @function module:Helpers.generateFileNameByDate
 * @param {String} prefix prefix that will be concatened
 * @param {String} suffix suffix that will be concatened
 * @returns {String} the string concatened with the prefix, suffix and date
 */
function generateFileNameByDate(prefix, suffix) {
    const date = new Date();
    return `${prefix}/${date.getDate()}-${
        date.getMonth() + 1
    }-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${suffix}`;
}

/**
 * @typedef {object} configObject
 * @property {String} outputFormat the format of the output
 * @property {String} outputResultFolderPath the path of the folder where the results will be generated
 * @property {collectionsConfig[]} collectionsConfig array with the collections options
 */

/**
 * function that returns the object with the config from a json file
 * @function module:Helpers.loadJsonConfig
 * @param {String} filePath path of the file that will be loaded
 * @returns {configObject} return the object with the config properties
 */
function loadJsonConfig(filePath) {
    const fullPath = path.resolve(filePath);
    if (checkIfFileOrFolderExists(filePath)) {
        if (validateExtension(fullPath)) {
            const jsonContent = fs.readFileSync(fullPath, 'utf8');
            const config = validateJson(jsonContent);
            return validateConfigSchema(config);
        }

        throw new Error('you must inform a json file');
    }

    throw new Error('the file informed does not exists');
}

/**
 * function that validate the extension of the file
 * @function module:Helpers.validateExtension
 * @param {String} filePath the path of file
 * @param {String[]} [fileExtension = ['.json']] an array with the file extensions accepted
 * @returns {Boolean} boolean that indicates if the extension match with parameter
 */
function validateExtension(filePath, fileExtension = ['.json']) {
    const extension = path.extname(filePath);
    return fileExtension.includes(extension);
}

/**
 * function that check if the content informed is a valid json
 * @function module:Helpers.validateJson
 * @param {String} jsonContent the string with json content
 * @returns {object} the json parsed to javascript object
 * @throws {Error} the content of json file is invalid
 */
function validateJson(jsonContent) {
    try {
        return JSON.parse(jsonContent);
    } catch (error) {
        throw new Error('the content of json file is invalid');
    }
}

/**
 * function that validates the schema of object
 * @function module:Helpers.validateJsonConfigSchema
 * @param {String} configContent object that will be validated that will be validate
 * @returns {configObject} object with the config object if the content is valid
 * @throws {Error} throws an error with the details of the validation error
 */
function validateConfigSchema(configContent) {
    const schema = Joi.object({
        outputFormat: Joi.string().valid('json', 'html').required(),
        outputResultFolderPath: Joi.string().required(),
        collectionsConfig: Joi.array()
            .items(
                Joi.object({
                    currentCollection: Joi.object({
                        url: Joi.string().required(),
                        dbName: Joi.string().required(),
                        collectionName: Joi.string().required(),
                        ignoreFields: Joi.array()
                            .items(Joi.string())
                            .optional(),
                        filterBy: Joi.alternatives()
                            .try(
                                Joi.string(),
                                Joi.array().items(Joi.string().min(2))
                            )
                            .required(),
                    }),
                    previousCollection: Joi.object({
                        url: Joi.string().required(),
                        dbName: Joi.string().required(),
                        collectionName: Joi.string().required(),
                        ignoreFields: Joi.array()
                            .items(Joi.string())
                            .optional(),
                        filterBy: Joi.alternatives()
                            .try(
                                Joi.string(),
                                Joi.array().items(Joi.string().min(2))
                            )
                            .required(),
                    }),
                })
            )
            .min(1),
    }).length(3);

    const result = schema.validate(configContent);

    if (result.error) {
        throw new Error(result.error.details[0].message);
    }

    return result.value;
}

/**
 * function that check if file or folder exists
 * @function module:Helpers.checkIfFileOrFolderExists
 * @param {String} fileOrFolderPath the path of file or folder
 * @returns {Boolean} boolean that indicates if the file or folder exists
 */
function checkIfFileOrFolderExists(fileOrFolderPath) {
    const fullPath = path.resolve(fileOrFolderPath);
    return fs.existsSync(fullPath);
}

/**
 * function that create a new file
 * @function module:Helpers.createNewFile
 * @param {String} filePath file path that will be created
 * @param {String} fileContent file content that will be created
 * @returns {void}
 */
function createNewFile(filePath, fileContent) {
    if (!filePath) {
        throw new Error('you should inform the file path');
    }

    const fullPath = path.resolve(filePath);
    return fs.writeFileSync(fullPath, fileContent);
}

/**
 * function that create a new folder
 * @function module:Helpers.createNewFolder
 * @param {String} folderPath folder path that will be created
 * @returns {void}
 */
function createNewFolder(folderPath) {
    if (!folderPath) {
        throw new Error('you should inform the folder path');
    }

    const fullPath = path.resolve(folderPath);
    return fs.mkdirSync(fullPath, { recursive: true });
}

/**
 * function that remove a folder
 * @function module:Helpers.removeFolder
 * @param {String} folderPath path of folder that will be removed
 * @returns {void}
 */
function removeFolder(folderPath) {
    if (!folderPath) {
        throw new Error('you should inform the folder path');
    }

    const fullPath = path.resolve(folderPath);
    return fs.rmdirSync(fullPath, { recursive: true });
}

/**
 * function that create a new Json config file
 * @function module:Helpers.createJsonConfigFile
 * @param {configOptions} configOptions configuration options that will be included on file
 * @returns {void}
 * @throws {Error} error if something unexpected happens during the process
 */
function createJsonConfigFile(configOptions) {
    try {
        const {
            outputFormat,
            outputConfigFilePath,
            outputResultFolderPath,
        } = configOptions;
        createNewFile(
            outputConfigFilePath ? `${outputConfigFilePath}.json` : '',
            JSON.stringify(
                {
                    outputFormat,
                    outputResultFolderPath,
                    collectionsConfig: [],
                },
                null,
                2
            )
        );

        return logger.info(
            `the config file (${outputConfigFilePath}.json) was successfully created.`
        );
    } catch (error) {
        logger.error(
            `error to create the config file, please check the configurations - [Error details: ${error.message}]`
        );

        throw error;
    }
}

/**
 * function that create js config file
 * @function module:Helpers.createJsConfigFile
 * @param {configOptions} configOptions configuration options that will be included on file
 * @returns {void}
 * @throws error if something unexpected happens during the process
 */
function createJsConfigFile(configOptions) {
    try {
        const {
            outputFormat,
            outputConfigFilePath,
            outputResultFolderPath,
        } = configOptions;
        createNewFile(
            outputConfigFilePath ? `${outputConfigFilePath}.js` : '',
            `module.exports = { outputFormat: '${outputFormat}', outputResultFolderPath: '${outputResultFolderPath}', collectionsConfig: [],  }`
        );
        return logger.info(
            `the config file (${outputConfigFilePath}.js) was successfully created.`
        );
    } catch (error) {
        logger.error(
            `error to create the config file, please check the configurations - [Error details: ${error.message}]`
        );

        throw error;
    }
}

/**
 * function that create the folder that will contains de the compare results
 * @function module:Helpers.createResultFolder
 * @param {any} folderPath path of the folder that will be created
 * @param {any} [overrideFolder=false] boolean that indicates if the old folder will be removed
 * @returns {void}
 * @throws error if something unexpected happens during the process
 */
function createResultFolder(folderPath, overrideFolder = false) {
    try {
        if (overrideFolder) {
            removeFolder(folderPath);
            logger.info(
                `the old folder ${chalk.yellow(
                    folderPath
                )} was successfully removed`
            );
        }

        createNewFolder(folderPath);
        return logger.info(
            `the folder ${chalk.yellow(folderPath)} was successfully created`
        );
    } catch (error) {
        logger.error(
            `error to create the new folder - [Error details: ${error.message}]`
        );

        throw error;
    }
}

module.exports = {
    removeFolder,
    createNewFile,
    loadJsonConfig,
    createNewFolder,
    createResultFolder,
    createJsConfigFile,
    createJsonConfigFile,
    validateConfigSchema,
    generateFileNameByDate,
    checkIfFileOrFolderExists,
};
