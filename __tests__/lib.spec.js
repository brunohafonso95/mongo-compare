const chalk = require('chalk');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const {
    filterByKeys,
    connectToDataBase,
    removeDuplicateResults,
    getDocumentsDifference,
    getCollectionDocuments,
    getCollectionDifferences,
    generateMongoCompareResult,
} = require('../src');

describe('Suite tests of the auxiliar functions that make the comparasions', () => {
    describe('removeDuplicateResults()', () => {
        it('should return an array with not duplicate results', () => {
            const expected = [
                {
                    collectionName: 'test',
                    differences: {
                        currentDocument: {
                            dbName: 'test',
                            result: 'not exists',
                        },
                        previousDocument: {
                            _id: 'daskdhsald',
                            name: 'test',
                        },
                    },
                },
            ];
            const testData = new Array(2).fill(expected[0]);
            const result = removeDuplicateResults(testData);
            expect(expected).toEqual(result);
        });

        it('should return an array with not duplicate results', () => {
            const expected = [
                {
                    collectionName: 'test',
                    differences: {
                        currentDocument: {
                            dbName: 'test',
                            result: 'not exists',
                        },
                        previousDocument: {
                            _id: 'daskdhsald',
                            name: 'test',
                        },
                    },
                },
            ];
            const testData = new Array(2)
                .fill(expected[0])
                .map((item, index) => ({ ...item, collectionName: index }));
            const result = removeDuplicateResults(testData);
            expect(testData).toEqual(result);
        });
    });

    describe('filterByKeys()', () => {
        it('should return true with a string key name passed in parameters', () => {
            const currObject = {
                name: 'test',
            };
            const nextObject = {
                name: 'test',
            };
            const result = filterByKeys(currObject, nextObject, 'name');
            expect(true).toEqual(result);
        });

        it('should return false with a string key name passed in parameters', () => {
            const currObject = {
                name: 'test',
            };
            const nextObject = {
                name: 'tes',
            };
            const result = filterByKeys(currObject, nextObject, 'name');
            expect(false).toEqual(result);
        });

        it('should return true with a array of string key names passed in parameters', () => {
            const currObject = {
                name: 'test',
                base: 1,
            };
            const nextObject = {
                name: 'test',
                base: 1,
            };
            const result = filterByKeys(currObject, nextObject, [
                'name',
                'base',
            ]);
            expect(true).toEqual(result);
        });

        it('should return false with a array of string key names passed in parameters', () => {
            const currObject = {
                name: 'test',
                base: 1,
            };
            const nextObject = {
                name: 'tes',
                base: 1,
            };
            const result = filterByKeys(currObject, nextObject, [
                'name',
                'base',
            ]);
            expect(false).toEqual(result);
        });
    });

    describe('connectToDataBase()', () => {
        let connection;

        beforeAll(() => {
            MongoClient.connect(process.env.MONGO_URL, (err, client) => {
                if (err) {
                    throw new Error(
                        `Error to connect to database - ${err.message}`
                    );
                }

                connection = client;

                client
                    .db('jest')
                    .collection('test1')
                    .insert({ name: 'test', prop1: 1 });
            });
        });

        afterAll(() => {
            connection.db('jest').dropCollection('test1');
            connection.close();
        });

        it('should return an error on connection', async () => {
            try {
                await connectToDataBase('mongodb://127.0.0.1:52717', 'jest');
            } catch (error) {
                expect('connect ECONNREFUSED 127.0.0.1:52717').toEqual(
                    error.message
                );
            }
        });

        it('should return an error on connection informing that the database does not exists', async () => {
            try {
                await connectToDataBase(process.env.MONGO_URL, 'gest');
            } catch (error) {
                expect(
                    `the database ${chalk.red('gest')} does not exists`
                ).toEqual(error.message);
            }
        });

        it('should return an object with the mongoClient and database instance', async () => {
            const dbObject = await connectToDataBase(
                process.env.MONGO_URL,
                'jest'
            );

            expect(true).toEqual(dbObject.client.isConnected());
            dbObject.client.close();
        });
    });

    describe('getCollectionDocuments()', () => {
        let connection;

        beforeAll(() => {
            MongoClient.connect(process.env.MONGO_URL, (err, client) => {
                if (err) {
                    throw new Error(
                        `Error to connect to database - ${err.message}`
                    );
                }

                connection = client;

                client
                    .db('jest')
                    .collection('test1')
                    .insert({ name: 'test', prop1: 1 });
            });
        });

        afterAll(() => {
            connection.db('jest').dropCollection('test1');
            connection.close();
        });

        it('should return an object with the databaseName and the documents array', async () => {
            const result = await getCollectionDocuments(
                process.env.MONGO_URL,
                'jest',
                'test'
            );
            expect(result).toEqual({ dbName: 'jest', documents: [] });
        });
    });

    describe('getDocumentsDifference()', () => {
        it('should return an object with the differences between the documents', () => {
            const result = getDocumentsDifference(
                {
                    _id: '123345',
                    name: 'test',
                    prop1: 'test',
                },
                { _id: '123345', name: 'tes', prop1: 'test' },
                {
                    currentDbName: 'jest',
                    previousDbName: 'jest',
                    collectionName: 'test',
                }
            );
            expect(result).toEqual({
                collectionName: 'test',
                differences: {
                    diffKeys: ['name'],
                    currentDocument: {
                        dbName: 'jest',
                        name: 'test',
                        prop1: 'test',
                    },
                    previousDocument: {
                        dbName: 'jest',
                        name: 'tes',
                        prop1: 'test',
                    },
                },
            });
        });

        it('should return an object with the differences between the documents informing that the current not exists', () => {
            const result = getDocumentsDifference(
                undefined,
                { _id: '123345', name: 'tes', prop1: 'test' },
                {
                    currentDbName: 'jest',
                    previousDbName: 'jest',
                    collectionName: 'test',
                }
            );
            expect(result).toEqual({
                collectionName: 'test',
                differences: {
                    diffKeys: [],
                    currentDocument: {
                        dbName: 'jest',
                        result: 'not exists',
                    },
                    previousDocument: {
                        _id: '123345',
                        dbName: 'jest',
                        name: 'tes',
                        prop1: 'test',
                    },
                },
            });
        });

        it('should return an object with the differences between the documents informing that the previous does no exists', () => {
            const result = getDocumentsDifference(
                { _id: '123345', name: 'tes', prop1: 'test' },
                undefined,
                {
                    currentDbName: 'jest',
                    previousDbName: 'jest',
                    collectionName: 'test',
                }
            );
            expect(result).toEqual({
                collectionName: 'test',
                differences: {
                    diffKeys: [],
                    currentDocument: {
                        dbName: 'jest',
                        _id: '123345',
                        name: 'tes',
                        prop1: 'test',
                    },
                    previousDocument: {
                        dbName: 'jest',
                        result: 'not exists',
                    },
                },
            });
        });

        it('should return an object with a string informing that does not exist difference', () => {
            const result = getDocumentsDifference(
                { _id: '123345', name: 'tes', prop1: 'test' },
                { _id: '123345', name: 'tes', prop1: 'test' },
                {
                    currentDbName: 'jest',
                    previousDbName: 'jest',
                    collectionName: 'test',
                }
            );
            expect(result).toEqual({
                differences: 'no diff',
            });
        });

        it('should throw the error you must inform at least one document', () => {
            try {
                getDocumentsDifference(undefined, undefined, {
                    currentDbName: 'jest',
                    previousDbName: 'jest',
                    collectionName: 'test',
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'you must inform at least one document'
                );
            }
        });
    });

    describe('getCollectionDifferences()', () => {
        let connection;

        beforeAll(() => {
            MongoClient.connect(process.env.MONGO_URL, (err, client) => {
                if (err) {
                    throw new Error(
                        `Error to connect to database - ${err.message}`
                    );
                }

                connection = client;

                client
                    .db('jest')
                    .collection('test1')
                    .insert({ name: 'test', prop1: 1 });
                client
                    .db('jest')
                    .collection('test2')
                    .insert({ name: 'test2', prop1: 2 });
            });
        });

        afterAll(() => {
            connection.db('jest').dropCollection('test1');
            connection.db('jest').dropCollection('test2');
            connection.close();
        });

        it('should return an array with the documents with differences', async () => {
            const collectionsConfig = {
                currentCollection: {
                    url: process.env.MONGO_URL,
                    dbName: 'jest',
                    collectionName: 'test1',
                    filterBy: 'name',
                    ignoreFields: '_id',
                },
                previousCollection: {
                    url: process.env.MONGO_URL,
                    dbName: 'jest',
                    collectionName: 'test2',
                    filterBy: 'name',
                },
            };
            const result = await getCollectionDifferences(collectionsConfig);
            expect(result).toEqual([
                {
                    collectionName: 'test1',
                    differences: {
                        diffKeys: [],
                        currentDocument: {
                            dbName: 'jest',
                            _id: result[0].differences.currentDocument._id,
                            name: 'test',
                            prop1: 1,
                        },
                        previousDocument: {
                            dbName: 'jest',
                            result: 'not exists',
                        },
                    },
                },
                {
                    collectionName: 'test1',
                    differences: {
                        diffKeys: [],
                        currentDocument: {
                            dbName: 'jest',
                            result: 'not exists',
                        },
                        previousDocument: {
                            dbName: 'jest',
                            _id: result[1].differences.previousDocument._id,
                            name: 'test2',
                            prop1: 2,
                        },
                    },
                },
            ]);
        });

        it('using the default ignoreFields should return an array with the documents with differences', async () => {
            const collectionsConfig = {
                currentCollection: {
                    url: process.env.MONGO_URL,
                    dbName: 'jest',
                    collectionName: 'test1',
                    filterBy: 'name',
                },
                previousCollection: {
                    url: process.env.MONGO_URL,
                    dbName: 'jest',
                    collectionName: 'test2',
                    filterBy: 'name',
                },
            };
            const result = await getCollectionDifferences(collectionsConfig);
            expect(result).toEqual([
                {
                    collectionName: 'test1',
                    differences: {
                        diffKeys: [],
                        currentDocument: {
                            dbName: 'jest',
                            _id: result[0].differences.currentDocument._id,
                            name: 'test',
                            prop1: 1,
                        },
                        previousDocument: {
                            dbName: 'jest',
                            result: 'not exists',
                        },
                    },
                },
                {
                    collectionName: 'test1',
                    differences: {
                        diffKeys: [],
                        currentDocument: {
                            dbName: 'jest',
                            result: 'not exists',
                        },
                        previousDocument: {
                            dbName: 'jest',
                            _id: result[1].differences.previousDocument._id,
                            name: 'test2',
                            prop1: 2,
                        },
                    },
                },
            ]);
        });
    });

    describe('generateMongoCompareResult()', () => {
        let connection;

        beforeAll(() => {
            MongoClient.connect(process.env.MONGO_URL, (err, client) => {
                if (err) {
                    throw new Error(
                        `Error to connect to database - ${err.message}`
                    );
                }

                connection = client;

                client
                    .db('jest')
                    .collection('test1')
                    .insert({ name: 'test', prop1: 1 });
                client
                    .db('jest')
                    .collection('test2')
                    .insert({ name: 'test', prop1: 2 });

                client
                    .db('jest')
                    .collection('test3')
                    .insert({ name: 'test', prop1: 1 });
                client
                    .db('jest')
                    .collection('test4')
                    .insert({ name: 'test', prop1: 2 });
            });
            fs.writeFileSync(
                'mongo-compare-config.json',
                JSON.stringify({
                    outputFormat: 'json',
                    outputResultFolderPath: 'mongo-compare-results',
                    collectionsConfig: [
                        {
                            currentCollection: {
                                url: process.env.MONGO_URL,
                                dbName: 'jest',
                                collectionName: 'test1',
                                filterBy: 'name',
                                ignoreFields: ['_id'],
                            },
                            previousCollection: {
                                url: process.env.MONGO_URL,
                                dbName: 'jest',
                                collectionName: 'test2',
                                filterBy: 'name',
                            },
                        },
                        {
                            currentCollection: {
                                url: process.env.MONGO_URL,
                                dbName: 'jest',
                                collectionName: 'test3',
                                filterBy: 'name',
                                ignoreFields: ['_id'],
                            },
                            previousCollection: {
                                url: process.env.MONGO_URL,
                                dbName: 'jest',
                                collectionName: 'test4',
                                filterBy: 'name',
                            },
                        },
                    ],
                })
            );
            fs.mkdirSync('mongo-compare-results');
        });

        afterAll(() => {
            fs.unlinkSync('mongo-compare-config.json');
            fs.rmdirSync('mongo-compare-results', { recursive: true });
            connection.close();
        });

        it('should generate a file with the diff results in the mongo collection', async () => {
            await generateMongoCompareResult('mongo-compare-config.json');
            const [newFile] = fs.readdirSync('mongo-compare-results');
            const result = fs.readFileSync(
                `mongo-compare-results/${newFile}`,
                'utf8'
            );

            expect(JSON.parse(result)).toEqual([
                {
                    collectionName: 'test1',
                    differences: {
                        diffKeys: ['prop1'],
                        currentDocument: {
                            dbName: 'jest',
                            prop1: 1,
                            name: 'test',
                        },
                        previousDocument: {
                            dbName: 'jest',
                            prop1: 2,
                            name: 'test',
                        },
                    },
                },
                {
                    collectionName: 'test3',
                    differences: {
                        diffKeys: ['prop1'],
                        currentDocument: {
                            dbName: 'jest',
                            prop1: 1,
                            name: 'test',
                        },
                        previousDocument: {
                            dbName: 'jest',
                            prop1: 2,
                            name: 'test',
                        },
                    },
                },
            ]);
        });
    });
});
