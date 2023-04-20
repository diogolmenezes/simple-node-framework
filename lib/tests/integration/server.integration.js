const { expect } = require('chai');
const { class: Database } = require('../../database');
const { class: Redis } = require('../../redis');
const Server = require('../../server');

describe('Resultados Test Integration ', () => {
    let database;
    let redis;
    let server;

    beforeEach(() => {
        database = new Database();
        redis = new Redis();
        server = new Server();
    });

    afterEach(async () => {
        if (server.isListening()) {
            await server.close();
        }

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

        it('Should start the server and database and redis connections be immediately available', async () => {
            await server.configure({ port: 8080 })
            expect(Object.keys(server.database.connections).length).to.be.equals(3);
            expect(server.redis.isConnected()).to.be.true;

            return true;
        });
    });
});
