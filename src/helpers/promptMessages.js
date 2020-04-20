const chalk = require('chalk');

/**
 * function that check if the response if informed, if not return a message with field name concatened
 * @function module:Helpers.requiredResponse
 * @param {String} response response for the prompt
 * @param {String} fieldName name of the field
 * @returns {String | Boolean} returns a boolean if the response exists and returns a string if not
 */
const requiredResponse = (response, fieldName) =>
    response ? true : chalk.red(`you must inform the ${fieldName} correctaly.`);

/**
 * funcion that return a string concatened with the folder name informed by parameter
 * @function module:Helpers.folderAlreadyExists
 * @param {String} folderName name of the folder
 * @returns {String} string concatened with the folderName informed by parameter
 */
const folderAlreadyExists = (folderName) =>
    `${chalk.yellow(
        folderName
    )} already exists, do you want to remove and recreate it ?`;

/**
 * function that returns a message with the file name and file extension concatened
 * @function module:Helpers.fileAlreadyExists
 * @param {String} filename name of the file
 * @param {String} fileExtension extension of the file
 * @returns {String} string with the file name and file extension concatened
 */
const fileAlreadyExists = (filename, fileExtension) =>
    `${chalk.yellow(filename)}.${chalk.yellow(
        fileExtension
    )} already exists, do you want to override it ?`;

/**
 * function that return the bye message
 * @function module:Helpers.byeMessage
 * @returns {String} string with the bye message
 */
const byeMessage = () =>
    chalk.green('ok, the config wont be change, see yout later!');

/**
 * function that return the message with the confirmation of config options
 * @function module:Helpers.confirmConfig
 * @param {configOptions} confirmOptions object with the config options to be concatened on string
 * @returns {String} string with the config options concatened
 */
const confirmConfig = (confirmOptions) => {
    const {
        outputConfigFilePath,
        outputConfigFileFormat,
        generateConfigFileAgain,
        outputResultFolderPath,
        generateResultsFolderAgain,
        outputFormat,
    } = confirmOptions;
    return `you inform this options bellow:\n\nmongo-compare config file: ${chalk.yellow(
        outputConfigFilePath
    )}\nmongo-compare config file extension: ${chalk.yellow(
        outputConfigFileFormat
    )}\n${
        typeof generateConfigFileAgain === 'boolean'
            ? `override mongo-compare config file: ${chalk.yellow(
                  generateConfigFileAgain
              )}\n`
            : ''
    }folder path to output the results: ${chalk.yellow(
        outputResultFolderPath
    )}\n${
        typeof generateResultsFolderAgain === 'boolean'
            ? `remove folder with actual results and create it again: ${chalk.yellow(
                  generateResultsFolderAgain
              )}\n`
            : ''
    }output format: ${chalk.yellow(outputFormat)}\n\nis this config ok ?`;
};

module.exports = {
    byeMessage,
    confirmConfig,
    requiredResponse,
    fileAlreadyExists,
    folderAlreadyExists,
};
