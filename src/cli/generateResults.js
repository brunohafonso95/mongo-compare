const fs = require('fs');
const path = require('path');

module.exports = (configFilePath = 'mongo-compare-config.json') => {
    try {
        const fullPath = path.resolve(configFilePath);
        const test = fs.readFileSync(fullPath, 'utf8');
        console.table({ test });
    } catch (error) {
        console.log(`error: ${error.message}`);
    }
};
