import express from 'express';
// const Scry = require("scryfall-sdk");
import { getData } from './utils.js';

import {
    acquireCard,
    addCardToCube,
    checkCardInCube,
    removeCardFromCube,
    updatePrintings,
    setVersion,
    startTransaction,
    commitTransaction,
    rollbackTransaction,
    pool,
} from './postgres.js';
import { OUR_BINDER, OUR_CUBE } from '../ui/consts.js';

const router = express.Router();
export default router;


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

if (process.env.NODE_ENV === 'dev') {
    router.post('/setversion', (request, response) => {
        const { cardId, multiverseid, scryfallId } = request.body;
        console.log(request.body);
        pool().connect((connErr, client, done) => {
            setVersion(cardId, multiverseid, scryfallId, client)
                .then(() => {
                    response.send(true);
                    done();
                })
                .catch((err) => {
                    response.send(err);
                    done();
                });
        });
    });

    router.post('/acquire', (request, response) => {
        const { cardId } = request.body;
        pool().connect((connErr, client, done) => acquireCard(cardId, client)
            .then(() => {
                console.log('acquired');
                response.send(true);
                done();
            }));
    });

    router.post('/replace', (request, response) => {
        const { newCardId, oldCardId } = request.body;
        pool().connect((connErr, client, done) => {
            Promise.all([
                checkCardInCube(newCardId, OUR_BINDER, client),
                checkCardInCube(oldCardId, OUR_CUBE, client),
            ])
                .then(() => startTransaction(client))
                .then(Promise.all([
                    addCardToCube(OUR_CUBE, newCardId, client),
                    addCardToCube(OUR_BINDER, oldCardId, client),
                    removeCardFromCube(OUR_BINDER, newCardId, client),
                    removeCardFromCube(OUR_CUBE, oldCardId, client),
                ]))
                .then(() => commitTransaction(client))
                .catch((err) => {
                    console.log(err);
                    return rollbackTransaction(client);
                })
                .then((json) => {
                    response.send(json);
                    done();
                });
        });
    });
}

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
