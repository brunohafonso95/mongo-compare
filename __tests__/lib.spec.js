const { MongoClient } = require('mongodb');

const {
    filterByKeys,
    connectToDataBase,
    removeDuplicateResults,
    getDocumentsDifference,
    getCollectionDocuments,
    getCollectionDifferences,
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
        it('should return an an error on connection', async () => {
            try {
                await connectToDataBase('mongodb://127.0.0.1:52717', 'jest');
            } catch (error) {
                expect('connect ECONNREFUSED 127.0.0.1:52717').toEqual(
                    error.message
                );
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
            console.table({ info: 'inserting on db' });
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
            connection.close();
        });

        it('should return an array with the documents with differences', async () => {
            const collectionsConfig = [
                {
                    url: process.env.MONGO_URL,
                    dbName: 'jest',
                    collectionName: 'test1',
                    filterBy: 'name',
                },
                {
                    url: process.env.MONGO_URL,
                    dbName: 'jest',
                    collectionName: 'test2',
                    filterBy: 'name',
                },
            ];
            const result = await getCollectionDifferences(collectionsConfig);
            expect(result).toEqual([
                {
                    collectionName: 'test1',
                    differences: {
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
});
