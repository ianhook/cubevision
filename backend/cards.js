const express = require('express');
const pg = require('pg');
// const Scry = require("scryfall-sdk");
const { getData } = require('./utils');

const {
    acquireCard,
    addCardToCube,
    checkCardInCube,
    removeCardFromCube,
    updatePrintings,
    setVersion,
    startTransaction,
    commitTransaction,
    rollbackTransaction,
} = require('./postgres');
const constants = require('../ui/consts');

pg.defaults.ssl = true;

const router = express.Router();

function pool() {
    return new pg.Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://ianhook@localhost:5432/ianhook',
        ssl: false,
    });
}

// define the home page route
router.get('/', (request, response) => {
    pool().connect((connErr, client, done) => {
        client.query('select * from cards;', (err, result) => {
            if (err) {
                response.send(`Error ${err}`);
            } else {
                response.send(result.rows);
            }
            done();
        });
    });
});

// router.post('/setversion', (request, response) => {
//     console.log('setversion');
//     const { cardId, multiverseid, scryfallId } = request.body;
//     console.log(request.body);
//     pool().connect((connErr, client, done) => {
//         setVersion(cardId, multiverseid, scryfallId, client)
//             .then(() => {
//                 response.send(true);
//                 done();
//             })
//             .catch((err) => {
//                 response.send(err);
//                 done();
//             });
//     });
// });

// router.post('/acquire', (request, response) => {
//     const { cardId } = request.body;
//     pool().connect((connErr, client, done) => acquireCard(cardId, client)
//         .then(() => {
//             console.log('acquired');
//             response.send(true);
//             done();
//         }));
// });

// router.post('/replace', (request, response) => {
//     const { newCardId, oldCardId } = request.body;
//     pool().connect((connErr, client, done) => {
//         Promise.all([
//             checkCardInCube(newCardId, constants.OUR_BINDER, client),
//             checkCardInCube(oldCardId, constants.OUR_CUBE, client),
//         ])
//             .then(() => startTransaction(client))
//             .then(Promise.all([
//                 addCardToCube(constants.OUR_CUBE, newCardId, client),
//                 addCardToCube(constants.OUR_BINDER, oldCardId, client),
//                 removeCardFromCube(constants.OUR_BINDER, newCardId, client),
//                 removeCardFromCube(constants.OUR_CUBE, oldCardId, client),
//             ]))
//             .then(() => commitTransaction(client))
//             .catch((err) => {
//                 console.log(err);
//                 return rollbackTransaction(client);
//             })
//             .then((json) => {
//                 response.send(json);
//                 done();
//             });
//     });
// });

// router.get('/update', (request, response) => {
//     pool().connect((connErr, client, done) => {
//         client.query('select * from cards where printings is null limit 2;', (err, result) => {
//             // console.log(result);
//             if (err) {
//                 response.send(`Error ${err}`);
//             } else {
//                 Promise.all(
//                     result.rows.map(row => getData(row, {})
//                         .then(data => updatePrintings(
//                             data.card, data.cardId,
//                             data.colors, data.printings, client,
//                         ))),
//                 )
//                     .then(() => response.send('success'))
//                     .catch((dataErr) => {
//                         console.log('update error', dataErr);
//                         return response.status(500).send(dataErr);
//                     })
//                     .finally(() => done());
//             }
//         });
//     });
// });

module.exports = router;
