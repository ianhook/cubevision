import express from 'express';

import {
    addCardToCube,
    findOrCreateCard,
    pool,
} from './postgres.js';

const router = express.Router();
export default router;

// define the home page route
router.get('/', (request, response) => {
    pool().connect((connErr, client, done) => {
        console.log(connErr);
        client.query('select * from cubes;', (err, result) => {
            if (err) {
                response.send(`Error ${err}`);
            } else {
                response.send(result.rows);
            }
            done();
        });
    });
});

router.get('/cards', (request, response) => {
    const query = 'select * from cube_cards';
    pool().connect((connErr, client, done) => {
        client.query(query, (err, result) => {
            if (err) {
                response.send(`Error ${err}`);
            } else {
                response.send(result.rows);
            }
            done();
        });
    });
});

router.get('/:cubeId', (request, response) => {
    const { cubeId } = request.params;
    const query = `select * from cube_cards join cubes using(cube_id) join cards using (card_id) where cube_id = ${cubeId};`;
    pool().connect((connErr, client, done) => {
        console.log(connErr);
        client.query(query, (err, result) => {
            if (err) {
                response.send(`Error ${err}`);
            } else {
                response.send(result.rows);
            }
            done();
        });
    });
});
