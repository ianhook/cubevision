const constants = require('../ui/consts');

const findOrCreateCard = (name, client, cb) => {
    const query = 'select card_id from cards where name = $1';
    client.query(query, [name], (err, result) => {
        console.log(name);
        if (err) {
            console.log(err);
            throw new Error(err);
        } else if (result.rows.length === 1) {
            cb(result.rows[0].card_id);
        } else {
            client.query('insert into cards (name) values ($1)', [name], (inErr) => {
                if (inErr) {
                    throw new Error(inErr);
                } else {
                    client.query(query, [name], (err2, result2) => {
                        if (err2) {
                            throw new Error(err2);
                        } else {
                            cb(result2.rows[0].card_id);
                        }
                    });
                }
            });
        }
    });
};

const addCardToCube = (cubeId, cardId, client) => new Promise((resolve, reject) => {
    const query = 'insert into cube_cards (cube_id, card_id) values ($1, $2)';
    client.query(query, [cubeId, cardId], (err) => {
        if (err) {
            console.log(err);
            if (err.code === '23505') {
                // card is already a part of this cube
                resolve();
            } else {
                console.log(err);
                reject(err);
            }
        } else {
            console.log('added');
            resolve();
        }
    });
});

const removeCardFromCube = (cubeId, cardId, client) => new Promise((resolve, reject) => {
    const query = 'delete from cube_cards where cube_id = $1 and card_id = $2';
    client.query(query, [cubeId, cardId], (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

const acquireCard = (cardId, client) => addCardToCube(constants.OUR_BINDER, cardId, client);

const setVersion = (cardId, multiverseid, scryfallId, client) => new Promise((resolve, reject) => {
    const query = 'update cards set owned_multiverseid = $2, scryfall_id = $3 where card_id = $1';
    client.query(query, [cardId, multiverseid, scryfallId], (err) => {
        console.log(err);
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

const checkCardInCube = (cardId, cubeId, client) => new Promise((resolve, reject) => {
    const query = 'select card_id from cube_cards where card_id = $1 and cube_id = $2';
    client.query(query, [cardId, cubeId], (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

const updatePrintings = (card, cardId, colors, printings, client, reserved) => {
    const params = [
        card.cmc,
        card.manaCost,
        reserved || false,
        cardId,
        colors,
        card.types.join(','),
        card.multiverseid,
        JSON.stringify(printings),
    ];
    // console.log(card.name, params);
    return new Promise((resolve, reject) => client.query(
        'update cards set cmc = $1, mana_cost = $2, reserved = $3, color = $5, types = $6, multiverse_id = $7, printings = $8 where card_id = $4',
        params,
        (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        },
    ));
};

const reserveDB = (client, row, reserved) => {
    if (!reserved) {
        return null;
    }
    const params = [
        row.card_id,
        reserved,
    ];
    console.log('updating', row, reserved);
    return new Promise((resolve, reject) => client.query(
        'update cards set reserved = $2 where card_id = $1',
        params,
        (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        },
    ));
};

const startTransaction = (client) => new Promise((resolve, reject) => {
    client.query('BEGIN', (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

const rollbackTransaction = (client) => new Promise((resolve, reject) => {
    client.query('ROLLBACK', (err) => {
        if (err) {
            reject(err);
        } else {
            resolve('rolled back');
        }
    });
});

const commitTransaction = (client) => new Promise((resolve, reject) => {
    client.query('COMMIT', (err) => {
        if (err) {
            reject(err);
        } else {
            resolve('commited');
        }
    });
});

module.exports = {
    acquireCard,
    addCardToCube,
    checkCardInCube,
    findOrCreateCard,
    removeCardFromCube,
    setVersion,
    updatePrintings,
    reserveDB,

    startTransaction,
    commitTransaction,
    rollbackTransaction,
};
