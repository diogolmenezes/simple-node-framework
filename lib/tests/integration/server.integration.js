// const supertest = require('supertest');
const chai = require('chai');
// const chaiExclude = require('chai-exclude');
// const nock = require('nock');
// const { clone } = require('@rededor/td-shared-components-backend');
const { class: Database } = require('../../database');
const fixtures = require('./fixtures');

describe('Resultados Test Integration ', () => {
    let database;
    // before((done) => {
    //     CustomTestHelper.before();

    //     // eslint-disable-next-line global-require
    //     ({ app, customServer } = require('../../../../../index'));
    // });

    beforeEach (() => {
        database = new Database(fixtures.database);
    });

    afterEach(async () => {
        database.close();
        database = null;
    });

    describe('# DESCRIBE', () => {
        it('# IT', async () => {
            // const result = await database.connect();

            return true;
        });
    });
});
