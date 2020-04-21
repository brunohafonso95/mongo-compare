const Joi = require('@hapi/joi');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const logger = require('./logger');

function loadJsonConfig(filePath) {
    const fullPath = path.resolve(filePath);
    if (checkIfFileOrFolderExists(filePath)) {
        if (validateExtension(fullPath)) {
            const jsonContent = fs.readFileSync(fullPath, 'utf8');
            return validateJson(jsonContent);
        }

        throw new Error('you must inform a json file');
    }

    throw new Error('the file informed does not exists');
}

function validateExtension(filePath) {
    const extension = path.extname(filePath);
    return ['.json'].includes(extension);
}

function validateJson(jsonContent) {
    try {
        return JSON.parse(jsonContent);
    } catch (error) {
        throw new Error('the content of json file is invalid');
    }
}

function validateJsonSchema(jsonContent) {
    const schema = Joi.object({
        outputFormat: Joi.string(),
        outputResultFolderPath: Joi.string(),
        collectionsConfig: Joi.string(),
    }).length(3);
    return { jsonContent, schema };
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
    validateJsonSchema,
    createJsConfigFile,
    createJsonConfigFile,
    checkIfFileOrFolderExists,
};
