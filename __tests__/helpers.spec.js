const chalk = require('chalk');
const fs = require('fs');

const { promptMessages, filesAndFolders } = require('../src/helpers');

describe('Test suite to helpers module', () => {
    describe('promptMessages.byeMessage()', () => {
        it('should return a string with the bye message', () => {
            const result = promptMessages.byeMessage();
            expect(result).toEqual(
                chalk.green('ok, the config wont be change, see yout later!')
            );
        });
    });

    describe('promptMessages.folderAlreadyExists()', () => {
        it('should return a string with the parameter concatened', () => {
            const result = promptMessages.folderAlreadyExists('test');
            expect(result).toEqual(
                `${chalk.yellow(
                    'test'
                )} already exists, do you want to remove and recreate it ?`
            );
        });
    });

    describe('promptMessages.fileAlreadyExists()', () => {
        it('should return a string with the parameter concatened', () => {
            const result = promptMessages.fileAlreadyExists('test', 'js');
            expect(result).toEqual(
                `${chalk.yellow('test')}.${chalk.yellow(
                    'js'
                )} already exists, do you want to override it ?`
            );
        });
    });

    describe('promptMessages.requiredResponse()', () => {
        it('should return a string with the message concated with the parameter', () => {
            const result = promptMessages.requiredResponse('', 'test');
            expect(result).toEqual(
                chalk.red(`you must inform the test correctaly.`)
            );
        });

        it('should return a string with the message concated with the parameter', () => {
            const result = promptMessages.requiredResponse('test', 'test');
            expect(result).toEqual(true);
        });
    });

    describe('promptMessages.confirmConfig()', () => {
        it('should return a string with the config options concatened and another data', () => {
            const result = promptMessages.confirmConfig({
                outputConfigFilePath: 'test',
                outputConfigFileFormat: 'js',
                generateConfigFileAgain: true,
                outputResultFolderPath: 'test',
                generateResultsFolderAgain: true,
                outputFormat: 'json',
            });
            expect(result).toEqual(
                `you inform this options bellow:\n\nmongo-compare config file: ${chalk.yellow(
                    'test'
                )}\nmongo-compare config file extension: ${chalk.yellow(
                    'js'
                )}\n${`override mongo-compare config file: ${chalk.yellow(
                    true
                )}\n`}folder path to output the results: ${chalk.yellow(
                    'test'
                )}\n${`remove folder with actual results and create it again: ${chalk.yellow(
                    true
                )}\n`}output format: ${chalk.yellow(
                    'json'
                )}\n\nis this config ok ?`
            );
        });

        it('should return a string with the config options concatened', () => {
            const result = promptMessages.confirmConfig({
                outputConfigFilePath: 'test',
                outputConfigFileFormat: 'js',
                outputResultFolderPath: 'test',
                outputFormat: 'json',
            });
            expect(result).toEqual(
                `you inform this options bellow:\n\nmongo-compare config file: ${chalk.yellow(
                    'test'
                )}\nmongo-compare config file extension: ${chalk.yellow(
                    'js'
                )}\nfolder path to output the results: ${chalk.yellow(
                    'test'
                )}\noutput format: ${chalk.yellow(
                    'json'
                )}\n\nis this config ok ?`
            );
        });
    });

    describe('filesAndFolders.checkIfFileOrFolderExists()', () => {
        it('should return true because node_modules exists', () => {
            const result = filesAndFolders.checkIfFileOrFolderExists(
                'node_modules'
            );
            expect(result).toEqual(true);
        });

        it('should return false because node_module does not exists', () => {
            const result = filesAndFolders.checkIfFileOrFolderExists(
                'node_module'
            );
            expect(result).toEqual(false);
        });
    });

    describe('filesAndFolders.createJsConfigFile()', () => {
        afterAll(() => {
            fs.unlinkSync('test.js');
        });

        it('should create a new js config file', () => {
            filesAndFolders.createJsConfigFile({
                outputFormat: 'json',
                outputConfigFilePath: 'test',
                outputResultFolderPath: 'test',
            });

            const result = fs.readFileSync('test.js', 'utf8');
            expect(result).toEqual(
                `module.exports = { outputFormat: 'json', outputResultFolderPath: 'test', collectionsConfig: [],  }`
            );
        });

        it('should throw an error', () => {
            expect(() => {
                filesAndFolders.createJsConfigFile({
                    outputFormat: 'json',
                    outputConfigFilePath: '* test',
                    outputResultFolderPath: 'test',
                });
            }).toThrow();
        });
    });

    describe('filesAndFolders.createJsonConfigFile()', () => {
        afterAll(() => {
            fs.unlinkSync('test.json');
        });

        it('should create a new json config file', () => {
            filesAndFolders.createJsonConfigFile({
                outputFormat: 'json',
                outputConfigFilePath: 'test',
                outputResultFolderPath: 'test',
            });

            const result = fs.readFileSync('test.json', 'utf8');
            expect(result).toEqual(
                `{\n  "outputFormat": "json",\n  "outputResultFolderPath": "test",\n  "collectionsConfig": []\n}`
            );
        });

        it('should throw an error', () => {
            expect(() => {
                filesAndFolders.createJsonConfigFile({
                    outputFormat: 'json',
                    outputConfigFilePath: '* test',
                    outputResultFolderPath: 'test',
                });
            }).toThrow();
        });
    });

    describe('filesAndFolders.createResultFolder()', () => {
        afterEach(() => {
            fs.rmdirSync('test', { recursive: true });
        });

        it('should create a new folder', () => {
            filesAndFolders.createResultFolder('test');
            const result = fs.existsSync('test');
            expect(result).toEqual(true);
        });

        it('should create a new folder', () => {
            fs.mkdirSync('test');
            filesAndFolders.createResultFolder('test/test', true);
            const result = fs.existsSync('test/test');
            expect(result).toEqual(true);
        });

        it('should create a new folder', () => {
            expect(() => {
                filesAndFolders.createResultFolder('* test/test', true);
            }).toThrow();
        });
    });
});
