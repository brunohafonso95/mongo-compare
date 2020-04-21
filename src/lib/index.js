const chai = require('chai');
const chaiExclude = require('chai-exclude');
const chalk = require('chalk');
const { MongoClient } = require('mongodb');

const { logger } = require('../helpers');

chai.use(chaiExclude);

/**
 * @module Lib
 */

/**
 * @typedef {object} collectionsConfig
 * @property {collectionConfig} currentCollection current collection config
 * @property {collectionConfig} previousCollection previous collection config
 */

/**
 * @typedef {object} collectionConfig
 * @property {String} url URI of the database
 * @property {String} dbName name of the database
 * @property {String} collectionName name of the collection
 * @property {String[]} [ignoreFields=['_id']] fields that will be ignored on validation
 * @property {String | String[]} filterBy field or array of fields that will be used by primary key on the collection
 */

/**
 * @typedef {Object} connectionObject
 * @property {MongoClient.db} db database instance
 * @property {MongoClient} client MongoClient instance
 */

/**
 * @typedef {object} differenceDetails
 * @property {String} dbName name of the database
 * @property {String} [result='not exists'] if one of the documents on compare does no exists this property is returned
 * @property {object} theRestOfPropsOnTheObjectResult all the properties on document that throws error on compare
 */

/**
 * @typedef {object} differenceObject
 * @property {differenceDetails} currentDocument
 * @property {differenceDetails} previousDocument
 */

/**
 * @typedef {object} differenceResult
 * @property {String} collectionName name of the collection
 * @property {differenceObject} differences object with the two document's differences
 */

/**
 * @typedef {object} collectionDocumentsResult
 * @property {String} dbName database name
 * @property {object[]} documents array with the documents of collection
 */

/**
 * @typedef {object} documentDifferenceOptions
 * @property {String} currentDbName current database name
 * @property {String} previousDbName previous database name
 * @property {String} collectionName name of the collection
 * @property {String[]} [ignoreFields=['_id']] array with the fields that will be ignored on validation
 */

/**
 * function that connect with database
 * @function module:Lib.connectToDataBase
 * @param {String} databaseUrl URI of database
 * @param {String} databaseName name of the database
 * @returns {Promise<connectionObject>} promise that contains the database instance and the MongoClient instance
 */
function connectToDataBase(databaseUrl, databaseName) {
    return new Promise((resolve, reject) => {
        logger.info(
            `Connecting to ${chalk.yellow(databaseName)} on ${chalk.yellow(
                databaseUrl
            )}`
        );
        MongoClient.connect(
            databaseUrl,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                serverSelectionTimeoutMS: 3000,
            },
            async (err, client) => {
                if (err) {
                    return reject(err);
                }

                const databaseExists = await checkIfDatabaseExists(
                    client,
                    databaseName
                );

                if (databaseExists) {
                    logger.info(
                        `Connected with success to ${chalk.yellow(
                            databaseName
                        )} on ${chalk.yellow(databaseUrl)}`
                    );

                    return resolve({ db: client.db(databaseName), client });
                }

                client.close();
                return reject(
                    new Error(
                        `the database ${chalk.red(
                            databaseName
                        )} does not exists`
                    )
                );
            }
        );
    });
}

async function checkIfDatabaseExists(mongoClient, databaseName) {
    let databaseList = await mongoClient
        .db()
        .admin()
        .listDatabases({ nameOnly: true });
    databaseList = databaseList.databases.map(({ name }) => name);
    return databaseList.includes(databaseName);
}

/**
 * function that get all the documents of a collection
 * @function module:Lib.getCollectionDocuments
 * @param {String} databaseUrl URI of the database
 * @param {String} databaseName name of the database
 * @param {String} collectionName name of the collection
 * @returns {Promise<collectionDocumentsResult>} promise with the collection documents and the name of database
 */
async function getCollectionDocuments(
    databaseUrl,
    databaseName,
    collectionName
) {
    const { db, client } = await connectToDataBase(databaseUrl, databaseName);
    logger.info(
        `Getting documents from ${chalk.yellow(
            collectionName
        )} on ${chalk.yellow(databaseName)}`
    );
    const documents = await db.collection(collectionName).find({}).toArray();
    client.close();
    logger.info(
        `Documents from ${chalk.yellow(collectionName)} on ${chalk.yellow(
            databaseName
        )} was get with success`
    );

    if (!documents.length) {
        logger.warn(
            `the collection ${chalk.yellow(collectionName)} on ${chalk.yellow(
                databaseName
            )} does not have documents`
        );
    }

    return {
        dbName: databaseName,
        documents,
    };
}

/**
 * function that get the differences between two documents
 * @function module:Lib.getDocumentsDifference
 * @param {object<any>} currentDocument the actual document
 * @param {object<any>} previousDocument the old document
 * @param {documentDifferenceOptions} documentDifferenceOptions options to configure the parser result
 * @returns {differenceResult | object<{ differences: 'no diff' }>} return an object with the diferrence details
 * @throws {Error} error with the message 'you must inform at least one document' in case the document parameters are not informed
 */
function getDocumentsDifference(
    currentDocument,
    previousDocument,
    { currentDbName, previousDbName, collectionName, ignoreFields = ['_id'] }
) {
    try {
        if (!currentDocument && !previousDocument) {
            throw new Error('you must inform at least one document');
        }

        if (!currentDocument && previousDocument) {
            return {
                collectionName,
                differences: {
                    currentDocument: {
                        dbName: currentDbName,
                        result: 'not exists',
                    },
                    previousDocument: {
                        dbName: previousDbName,
                        ...previousDocument,
                    },
                },
            };
        }

        if (currentDocument && !previousDocument) {
            return {
                collectionName,
                differences: {
                    currentDocument: {
                        dbName: currentDbName,
                        ...currentDocument,
                    },
                    previousDocument: {
                        dbName: previousDbName,
                        result: 'not exists',
                    },
                },
            };
        }

        chai.expect(currentDocument)
            .excluding(ignoreFields)
            .to.deep.equal(previousDocument);
        return { differences: 'no diff' };
    } catch (error) {
        if (error.name === 'AssertionError') {
            return {
                collectionName,
                differences: {
                    currentDocument: {
                        dbName: currentDbName,
                        ...error.actual,
                    },
                    previousDocument: {
                        dbName: previousDbName,
                        ...error.expected,
                    },
                },
            };
        }

        throw error;
    }
}

/**
 * function that return a filter a object by key or array of keys
 * @function module:Lib.filterByKeys
 * @param {object} currentObject the current object that the property will be compared
 * @param {object} nextObject the next object that the property will be compared
 * @param {String | String[]} keys the keys os keys that will be compared on objet
 * @returns {Boolean} boolean that indicates if the property or propeties of the objects are equals
 */
function filterByKeys(currentObject, nextObject, keys) {
    if (!Array.isArray(keys)) {
        return currentObject[String(keys)] === nextObject[String(keys)];
    }

    return keys
        .map((key) => {
            return typeof currentObject[String(key)] === 'string'
                ? currentObject[String(key)] === nextObject[String(key)]
                : JSON.stringify(currentObject[String(key)]) ===
                      JSON.stringify(nextObject[String(key)]);
        })
        .every((res) => res);
}

/**
 * function that get the differences between two collections
 * @function module:Lib.getCollectionDifferences
 * @param {collectionsConfig} collectionsConfig object with the collections config to make the compare
 * @returns {differenceResult[]}
 */
async function getCollectionDifferences(collectionsConfig) {
    const { currentCollection, previousCollection } = collectionsConfig;
    const currCollection = await getCollectionDocuments(
        currentCollection.url,
        currentCollection.dbName,
        currentCollection.collectionName
    );

    const prevCollection = await getCollectionDocuments(
        previousCollection.url,
        previousCollection.dbName,
        previousCollection.collectionName
    );

    logger.info(
        `Comparing the collection ${chalk.yellow(
            currentCollection.collectionName
        )} on the databases [${chalk.yellow(
            currentCollection.dbName
        )}, ${chalk.yellow(
            previousCollection.dbName
        )}] filtering by ${chalk.yellow(
            currentCollection.filterBy
        )} and ignoring this fields [${
            currentCollection.ignoreFields
                ? chalk.yellow(currentCollection.ignoreFields)
                : chalk.yellow('_id')
        }]`
    );

    let results = [];

    currCollection.documents.forEach((document) => {
        const oldDocument = prevCollection.documents.find((d) =>
            filterByKeys(d, document, currentCollection.filterBy)
        );

        results.push(
            getDocumentsDifference(document, oldDocument, {
                currentDbName: currentCollection.dbName,
                previousDbName: previousCollection.dbName,
                collectionName: currentCollection.collectionName,
                ignoreFields: currentCollection.ignoreFields,
            })
        );
    });

    prevCollection.documents.forEach((document) => {
        const newDocument = currCollection.documents.find((d) =>
            filterByKeys(d, document, previousCollection.filterBy)
        );

        results.push(
            getDocumentsDifference(newDocument, document, {
                currentDbName: currentCollection.dbName,
                previousDbName: previousCollection.dbName,
                collectionName: currentCollection.collectionName,
                ignoreFields: previousCollection.ignoreFields,
            })
        );
    });

    results = results.filter((result) => result.differences !== 'no diff');
    logger.info(
        `Comparassion in the collection ${chalk.yellow(
            currentCollection.collectionName
        )} on the databases [${chalk.yellow(
            currentCollection.dbName
        )}, ${chalk.yellow(
            previousCollection.dbName
        )}] filtering by ${chalk.yellow(
            currentCollection.filterBy
        )} and ignoring this fields [${
            currentCollection.ignoreFields
                ? chalk.yellow(currentCollection.ignoreFields)
                : chalk.yellow('_id')
        }] was finished`
    );

    return removeDuplicateResults(results);
}

/**
 * function that remove the duplicate items on results array
 * @function module:Lib.removeDuplicateResults
 * @param {differenceResult[]} results array with the results
 * @returns {differenceResult[]} array with the results without duplicate items
 */
function removeDuplicateResults(results) {
    logger.info('removing the duplicates of results');
    return Array.from(new Set(results.map(JSON.stringify))).map(JSON.parse);
}

module.exports = {
    filterByKeys,
    connectToDataBase,
    removeDuplicateResults,
    getDocumentsDifference,
    getCollectionDocuments,
    getCollectionDifferences,
};
