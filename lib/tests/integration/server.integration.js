const { expect } = require('chai');
const { class: Database } = require('../../database');
const { class: Redis } = require('../../redis');
const fixtures = require('./fixtures');

describe('Resultados Test Integration ', () => {
    let database;
    let redis;

    beforeEach(() => {
        database = new Database(fixtures.config);
        redis = new Redis(fixtures.config);
    });

    afterEach(async () => {
        if (database.isConnected()) {
            await database.close();
            database = null;
        }

        if (redis.isConnected()) {
            await redis.close();
            redis = null;
        }
    });

    describe('Test services', () => {
        it('Connect on databases', async () => {
            const result = await database.connect();

            expect(database.connections).to.have.all.keys('oracle', 'mongodb', 'sqlserver')
            expect(result.length).to.be.equals(3);

            expect(database.connections.sqlserver.db3._connected).to.be.true;
            expect(database.connections.mongodb.db1._readyState).to.be.equals(1)
            expect(database.connections.oracle.db2.poolAlias).to.be.equals('oracle.db2')
        });

        it('Connect on Redis', async () => {
            const result = await redis.connect();

            expect(result.connected).to.be.true;
        });

        it('Should connect on one after another', async () => {
            const databaseResult = await database.connect();
            const redisResult = await redis.connect();

            expect(databaseResult.length).to.be.equals(3);
            expect(redisResult.connected).to.be.true;
        });

        it('Should disconnect invoking close', async () => {
            await database.connect();
            expect(Object.keys(database.connections).length).to.be.equals(3);
            await database.close();

            expect(database.connections.mongodb).to.be.undefined;
            expect(database.connections.sqlserver).to.be.undefined;
            expect(database.connections.oracle).to.be.undefined;

            await redis.connect();
            expect(redis.isConnected()).to.be.true;
            await redis.close();
            expect(redis.isConnected()).to.be.false;
        });
    });
});
