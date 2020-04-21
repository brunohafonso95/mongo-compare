#!/usr/bin/env node
const chalk = require('chalk');
const Commander = require('commander');

const generateConfigFile = require('./generateConfigFilePrompts');
const generateResults = require('./generateResults');

/**
 * @module Cli
 */

async function main() {
    Commander.version(
        `${chalk.green('Mongo-compare')}: ${chalk.bgGreen.black('v1.0.0')}`
    )
        .option(
            '-i, --init',
            'create the config file to mongo-compare and the folder to compare results'
        )
        .option('-y, --yes', 'use default options')
        .option(
            '-c, --config <path>',
            'The path to the configuration file. Default: mongo-compare-config.json'
        )
        .parse(process.argv);

    const { init, yes, config } = Commander;

    if (init) {
        await generateConfigFile(yes);
    } else {
        generateResults(config);
    }

    return process.exit(0);
}

main();
