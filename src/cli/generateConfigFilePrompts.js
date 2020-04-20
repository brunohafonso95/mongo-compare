const inquirer = require('inquirer');

const { promptMessages, filesAndFolders } = require('../helpers');

/**
 * @typedef {object} configOptions
 * @property {String} outputConfigFilePath path where the config file will be generetaed
 * @property {String} outputConfigFileFormat format of the config file
 * @property {Boolean} generateConfigFileAgain boolean that indicates if the config file will be override
 * @property {String} outputResultFolderPath path of the folder that the results will be exported
 * @property {Boolean} generateResultsFolderAgain boolean that indicates if the current export folder will be override
 * @property {String} outputFormat format the re results will be exported
 */

/**
 * function that execute prompts asking the config options and execute the creation
 * of the config file and folder
 * @function module:Cli.generateConfigFilePrompts
 * @returns {configOptions} object with the mongo-compare config options
 */
module.exports = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'outputConfigFilePath',
            message: 'Whats the name of mongo-compare config file ?',
            default: () => 'mongo-compare-config',
            validate: (response) =>
                promptMessages.requiredResponse(
                    response,
                    'name of mongo-compare config file'
                ),
        },
        {
            type: 'list',
            name: 'outputConfigFileFormat',
            message: 'Whats the format of mongo-compare config file ?',
            choices: ['js', 'json'],
        },
        {
            type: 'confirm',
            name: 'generateConfigFileAgain',
            message(previousAnswers) {
                const {
                    outputConfigFilePath,
                    outputConfigFileFormat,
                } = previousAnswers;
                return promptMessages.fileAlreadyExists(
                    outputConfigFilePath,
                    outputConfigFileFormat
                );
            },
            when(previousAnswers) {
                return filesAndFolders.checkIfFileOrFolderExists(
                    `${previousAnswers.outputConfigFilePath}.${previousAnswers.outputConfigFileFormat}`
                );
            },
        },
        {
            type: 'input',
            name: 'outputResultFolderPath',
            message(previousAnswers) {
                if (
                    !previousAnswers.generateConfigFileAgain &&
                    previousAnswers.generateConfigFileAgain !== undefined
                ) {
                    console.log(promptMessages.byeMessage());
                    return process.exit(0);
                }

                return 'Whats the path to generate compare results ?';
            },
            default: () => 'mongo-compare-results',
            validate: (response) =>
                promptMessages.requiredResponse(
                    response,
                    'path to generate the folter with the compare results'
                ),
        },
        {
            type: 'confirm',
            name: 'generateResultsFolderAgain',
            message(previousAnswers) {
                const { outputResultFolderPath } = previousAnswers;
                return promptMessages.folderAlreadyExists(
                    outputResultFolderPath
                );
            },
            when(previousAnswers) {
                return filesAndFolders.checkIfFileOrFolderExists(
                    previousAnswers.outputResultFolderPath
                );
            },
        },
        {
            type: 'list',
            name: 'outputFormat',
            message(previousAnswers) {
                if (
                    !previousAnswers.generateResultsFolderAgain &&
                    previousAnswers.generateResultsFolderAgain !== undefined
                ) {
                    console.log(promptMessages.byeMessage());
                    return process.exit(0);
                }

                return 'Whats the format of compare results ?';
            },
            choices: ['json', 'html'],
        },
        {
            type: 'confirm',
            name: 'confirmConfig',
            message(previousAnswers) {
                return promptMessages.confirmConfig(previousAnswers);
            },
        },
    ]);

    if (answers.confirmConfig) {
        if (answers.outputConfigFileFormat === 'json') {
            filesAndFolders.createJsonConfigFile(answers);
        } else {
            filesAndFolders.createJsConfigFile(answers);
        }

        filesAndFolders.createResultFolder(
            answers.outputResultFolderPath,
            answers.generateResultsFolderAgain
        );
    }

    return answers;
};
