const pg = require('pg');
const fs = require('fs');
const Scry = require("scryfall-sdk");
// const mtg = require('mtgsdk');
const path = require('path');

const {
    updatePrintings,
    reserveDB,
} = require('./postgres');

pg.defaults.ssl = true;

const isNotOnlineOnly = (set) => !(/ME[D1-4]|VMA|TPR|PZ1|PMODO/i.test(set.set));

function getColors(card) {
    if (!Object.hasOwnProperty.call(card, 'colors')) {
        return 'C';
    }
    const unsortedColors = card.colors.reduce((out, c) => {
        if (c === 'Blue') {
            return out + ['U'];
        }
        return out + [c[0]];
    }, []);

    if (unsortedColors.length === 0) {
        return '';
    }
    const order = ['W', 'U', 'B', 'R', 'G'];
    return order.reduce((current, color) => {
        if (unsortedColors.includes(color)) {
            return `${current}${color}`;
        }
        return current;
    }, '');
}

function getData(row) {
    const splitName = row.name.split(' // ');
    // console.log(splitName);
    return Promise.all(splitName.map((cName) => new Promise((resolve, reject) => {
        const data = {
            printings: [],
        };
        const ev = mtg.card
            .all({ name: cName });
        ev.on('data', (card) => {
            // console.log('data');
            // console.log(cName);
            // console.log(row.name);
            console.log(card.name);
            const { printings } = data;
            let tmpName = card.name;
            if (card.name.indexOf(' // ') > 0) {
                // some cards are only listed as the front half
                tmpName = card.name.substr(0, card.name.indexOf(' // '));
            }
            if (tmpName === cName) {
                // console.log('data: ', cName);
                // console.log(card.set);
                const copy = {
                    rarity: card.rarity[0],
                    set: card.set,
                };
                if (Object.hasOwnProperty.call(card, 'multiverseid')) {
                    copy.multiverseid = card.multiverseid;
                }
                printings.push(copy);
            } else {
                return;
            }

            data.card = card;
            data.colors = getColors(card);
            data.printings = printings.filter((set) => isNotOnlineOnly(set) && set.multiverseid);
            data.cardId = row.card_id;
        });
        ev.on('end', () => {
            console.log('end', data);
            resolve(data);
        });
        ev.on('error', (err) => {
            console.log('err', err);
            reject(err);
        });
    })))
        .then((data) => {
            const outData = data[0];
            console.log('getData data:', data);
            data.forEach((curr, i) => {
                console.log(curr);
                const colors = outData.colors.split();
                if (curr.colors) {
                    curr.colors.split().forEach((c) => {
                        if (colors.indexOf(c) === -1) {
                            colors.push(c);
                        }
                    });
                    if (i > 0) {
                        outData.card.manaCost = `${outData.card.manaCost} // ${curr.card.manaCost}`;
                    }
                    outData.colors = colors.sort((a, b) => {
                        if (a === 'W') { return -1; }
                        if (b === 'W') { return 1; }
                        if (a === 'U') { return -1; }
                        if (b === 'U') { return 1; }
                        if (a === 'B') { return -1; }
                        if (b === 'B') { return 1; }
                        if (a === 'R') { return -1; }
                        if (b === 'R') { return 1; }
                        if (a === 'G') { return -1; }
                        if (b === 'G') { return 1; }
                        return 0;
                    }).join('');
                }
            });
            return outData;
        });
}

const reserveList = [];

function isReserved(cardName) {
    if (reserveList.length === 0) {
        const list = fs.readFileSync(path.resolve('./reserve_list.txt'), { encoding: 'utf8', flag: 'r' });
        list.split('\n').forEach((card) => {
            // console.log('card', card)
            reserveList.push(card);
        });
        // console.log(reserveList);
    }
    return reserveList.indexOf(cardName) !== -1;
}

function updateReserved(client) {
    return client.query('select * from cards;')
        .then((result) => Promise.all(
            result.rows.map((row) => reserveDB(client, row, isReserved(row.name))),
        ));
}

function queryPrintings(start, end, client) {
    return client.query(`select * from cards where card_id between ${start} and ${end};`)
        .then((result) => Promise.all(
            result.rows.map((row) => getData(row, {})
                .then((data) => {
                    // console.log(data.card);
                    updatePrintings(
                        data.card, data.cardId,
                        data.colors, data.printings, client, isReserved(data.card.name),
                    );
                    return data.card;
                })),
        )
            .then(() => console.log('success'))
            .catch((dataErr) => {
                console.log('update error', dataErr);
            }))
        .catch((err) => console.log(`Error ${err}`));
}

function moveToHashes(newHash, client) {
    const query = 'insert into cube_card_hash (cube_id, card_ids, hash_id, hash_divisor) values ($1, $2, $3, $4)';
    return client.query(`select cube_id, card_id % ${newHash} as hash, array_agg(card_id) as cards from cube_cards  group by cube_id, card_id % ${newHash};`)
        .then((result) => Promise.all(
            result.rows.map((row) => {
                console.log(row);
                client.query(query, [row.cube_id, row.cards, row.hash, newHash]);
            }),
        ))
        .catch((err) => console.log(`Error ${err}`));
}

function moveFromHashes(client) {
    const query = 'insert into cube_cards (cube_id, card_id) values ($1, $2)';
    return client.query('select cube_id, card_ids from cube_card_hash;')
        .then((result) => Promise.all(
            result.rows.map((row) => {
                Promise.all(row.card_ids.map((cardId) => {
                    // console.log(row.cube_id, cardId);
                    client.query(query, [row.cube_id, cardId]);
                }));
            }),
        ))
        .catch((err) => console.log(`Error ${err}`));
}

module.exports = {
    queryPrintings,
    getData,
    updateReserved,
    isReserved,
    moveToHashes,
    moveFromHashes,
};
