const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const logger = require('./logger');

function checkIfFileOrFolderExists(fileOrFolderPath) {
    const fullPath = path.resolve(fileOrFolderPath);
    return fs.existsSync(fullPath);
}

function createNewFile(filePath, fileContent) {
    const fullPath = path.resolve(filePath);
    return fs.writeFileSync(fullPath, fileContent);
}

function createNewFolder(folderPath) {
    const fullPath = path.resolve(folderPath);
    return fs.mkdirSync(fullPath, { recursive: true });
}

function removeFolder(folderPath) {
    const fullPath = path.resolve(folderPath);
    return fs.rmdirSync(fullPath, { recursive: true });
}

function createJsonConfigFile(configOptions) {
    try {
        const {
            outputFormat,
            outputConfigFilePath,
            outputResultFolderPath,
        } = configOptions;
        createNewFile(
            `${outputConfigFilePath}.json`,
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

        logger.info(
            `the config file (${outputConfigFilePath}.json) was successfully created.`
        );
    } catch (error) {
        logger.error(
            `error to create the config file, please check the configurations - [Error details: ${error.message}]`
        );
    }
}

function createJsConfigFile(configOptions) {
    try {
        const {
            outputFormat,
            outputConfigFilePath,
            outputResultFolderPath,
        } = configOptions;
        createNewFile(
            `${outputConfigFilePath}.js`,
            `module.exports = { outputFormat: '${outputFormat}', outputResultFolderPath: '${outputResultFolderPath}', collectionsConfig: [],  }`
        );
        logger.info(
            `the config file (${outputConfigFilePath}.js) was successfully created.`
        );
    } catch (error) {
        logger.error(
            `error to create the config file, please check the configurations - [Error details: ${error.message}]`
        );
    }
}

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
        return logger.error(
            `error to create the new folder - [Error details: ${error.message}]`
        );
    }
}

module.exports = {
    removeFolder,
    createNewFile,
    createNewFolder,
    createResultFolder,
    createJsConfigFile,
    createJsonConfigFile,
    checkIfFileOrFolderExists,
};
