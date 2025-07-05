import { OUR_BINDER } from '../ui/consts.js';
import pg from 'pg';
import fs from 'fs';

pg.defaults.ssl = true;

export const pool = () => {
    const pass = process.env.POSTGRES_PASSWORD || fs.readFileSync(process.env.POSTGRES_PASSWORD_FILE, 'utf8').trim()
    const db_conn_str = `postgresql://${process.env.POSTGRES_USER}:${pass}@${process.env.POSTGRES_URL}`;
    console.log(db_conn_str);
    console.log(process.env)
    return new pg.Pool({
        connectionString: db_conn_str,
        ssl: false,
    });
}

export const findOrCreateCard = (name, client, cb) => {
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
    }); //641
};

export const addCardToCube = (cubeId, cardId, client) => new Promise((resolve, reject) => {
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

export const removeCardFromCube = (cubeId, cardId, client) => new Promise((resolve, reject) => {
    const query = 'delete from cube_cards where cube_id = $1 and card_id = $2';
    client.query(query, [cubeId, cardId], (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

export const acquireCard = (cardId, client) => addCardToCube(OUR_BINDER, cardId, client);

export const setVersion = (cardId, multiverseid, scryfallId, client) => new Promise((resolve, reject) => {
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

export const checkCardInCube = (cardId, cubeId, client) => new Promise((resolve, reject) => {
    const query = 'select card_id from cube_cards where card_id = $1 and cube_id = $2';
    client.query(query, [cardId, cubeId], (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

export const updatePrintings = (card, cardId, colors, printings, client, reserved) => {
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

export const reserveDB = (client, row, reserved) => {
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

export const startTransaction = (client) => new Promise((resolve, reject) => {
    client.query('BEGIN', (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

export const rollbackTransaction = (client) => new Promise((resolve, reject) => {
    client.query('ROLLBACK', (err) => {
        if (err) {
            reject(err);
        } else {
            resolve('rolled back');
        }
    });
});

export const commitTransaction = (client) => new Promise((resolve, reject) => {
    client.query('COMMIT', (err) => {
        if (err) {
            reject(err);
        } else {
            resolve('commited');
        }
    });
});


