const chalk = require('chalk');

const requiredResponse = (response, fieldName) =>
    response ? true : chalk.red(`you must inform the ${fieldName} correctaly.`);

const folderAlreadyExists = (folderName) =>
    `${chalk.yellow(
        folderName
    )} already exists, do you want to remove and recreate it ?`;

const fileAlreadyExists = (filename, fileExtension) =>
    `${chalk.yellow(filename)}.${chalk.yellow(
        fileExtension
    )} already exists, do you want to override it ?`;

const byeMessage = () =>
    console.log(chalk.green('ok, the config wont be change, see yout later!'));

const confirmConfig = (configOptions) => {
    const {
        outputConfigFilePath,
        outputConfigFileFormat,
        generateConfigFileAgain,
        outputResultFolderPath,
        generateResultsFolderAgain,
        outputFormat,
    } = configOptions;
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
