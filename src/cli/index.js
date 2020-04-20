#!/usr/bin/env node
const chalk = require('chalk');
const Commander = require('commander');

const generateConfigFile = require('./generateConfigFilePrompts');

/**
 * @module Cli
 */

async function main() {
    Commander.version(
        `${chalk.green('Mongo-compare')}: ${chalk.bgGreen.black('v1.0.0')}`
    )
        .option('-i, --init', 'create the config file to mongo-compare')
        .parse(process.argv);

    const { init } = Commander;
    if (init) {
        await generateConfigFile();
    }
}

main();
