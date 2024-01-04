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

function colorString(colors) {
    console.log(colors);
    return colors.sort((a, b) => {
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

function parseTypes(typeLine) {
    const types = typeLine.split('—')[0];
    return [
        'Land', 'Creature', 'Artifact', 'Enchantment',
        'Planeswalker', 'Battle', 'Instant', 'Sorcery'
    ].filter((type) => types.indexOf(type) >= 0).sort().join(',');
}

async function getData(row) {
    // console.log(row);
    // if (!row.owned_multiverseid) {
    //     return {};
    // }
    const card = await Scry.Cards.byName(row.name);
    const data = {
        cmc: card.cmc, // no change
        manaCost: card.mana_cost || card.card_faces[0].mana_cost, // no change
        scryfallId: card.id, // replace multiverseid
        types: parseTypes(card.type_line), // pull out types
        usd: card.prices.usd, // usd vs usd_foil vs tix(?)
        usdUpdated: (new Date()).toISOString(),
        name: card.name,
        reserved: card.reserved,
    };
    // const card = await Scry.Cards.byMultiverseId(row.owned_multiverseid);
    const printings = (await card.getPrints())
        .filter((p) => isNotOnlineOnly(p.set.toUpperCase()))
        .map((p) => {
            if (row.owned_multiverseid && p.multiverse_ids[0] === row.owned_multiverseid) {
                data.usd = p.prices.usd;
            }
            return {
                set: p.set.toUpperCase(),
                multiverseid: p.multiverse_ids[0],
                scryfallId: p.id,
                rarity: p.rarity[0].toUpperCase(),
                releasedAt: p.released_at,
                image: p.image_uris?.normal,
            };
        })
        .sort((a, b) => {
            if (a.releasedAt > b.releasedAt) {
                return 1;
            } else if (a.releasedAt < b.releasedAt) {
                return -1;
            } else {
                return 0;
            }
        });
    console.log(card)
    return {
        card: data,
        cardId: row.card_id,
        printings,
        colors: colorString(card.colors || card.card_faces[0].colors),
    };
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
