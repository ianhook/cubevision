const pg = require('pg');
const { moveToHashes, moveFromHashes } = require('./backend/utils');
const constants = require('./ui/consts');

function pool() {
    const db_conn_str = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_URL}`;
    return new pg.Pool({
        connectionString: db_conn_str,
        ssl: false,
    });
}

pool().connect((connErr, client, done) => {
    console.log(connErr);
    // moveToHashes(constants.HASH_DIVISOR, client).then(() => done());
    moveFromHashes(client).then(() => done());
});
