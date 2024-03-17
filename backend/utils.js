import pg from 'pg';
import fs from 'fs';
import Scry  from 'scryfall-sdk';
// const mtg = require('mtgsdk');
import path from 'path';

import {
    updatePrintings,
    reserveDB,
} from './postgres.js';

pg.defaults.ssl = true;

const isNotOnlineOnly = (set) => !(/ME[D1-4]|VMA|TPR|PZ1|PRM|PMODO|EA[1-9]|HA[1-9]|SIR|AJMP|J21|KLR|AKR/i.test(set));

export function getColors(card) {
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

export function colorString(colors) {
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

export function parseTypes(typeLine) {
    const types = typeLine.split('—')[0];
    return [
        'Land', 'Creature', 'Artifact', 'Enchantment',
        'Planeswalker', 'Battle', 'Instant', 'Sorcery'
    ].filter((type) => types.indexOf(type) >= 0).sort().join(',');
}

export async function getData(row) {
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
        usd: card.prices.usd || row.usd, // usd vs usd_foil vs tix(?)
        usdUpdated: (new Date()).toISOString(),
        name: card.name,
        reserved: card.reserved,
    };
    // const card = await Scry.Cards.byMultiverseId(row.owned_multiverseid);
    const printings = (await card.getPrints())
        .filter((p) => isNotOnlineOnly(p.set.toUpperCase()))
        .map((p) => {
            console.log(p)
            if (row.scryfall_id) {
                if (p.id === row.scryfall_id) {
                    data.usd = parseFloat(p.prices.usd || p.prices.usd_foil || p.prices.usd_etched);
                }
            } else if (!(data.usd)) {
                data.usd = parseFloat(p.prices.usd || p.prices.usd_foil || p.prices.usd_etched);
            } else if (!!(p.prices.usd) && parseFloat(p.prices.usd) < data.usd) {
                data.usd = parseFloat(p.prices.usd);
            } else if (!!(p.prices.usd_foil) && parseFloat(p.prices.usd_foil) < data.usd) {
                data.usd = parseFloat(p.prices.usd_foil);
            } else if (!!(p.prices.usd_etched) && parseFloat(p.prices.usd_etched) < data.usd) {
                data.usd = parseFloat(p.prices.usd_etched);
            }
            return {
                set: p.set.toUpperCase(),
                multiverseid: p.multiverse_ids[0],
                scryfallId: p.id,
                rarity: p.rarity[0].toUpperCase(),
                releasedAt: p.released_at,
                image: p.image_uris?.normal || p.card_faces[0].image_uris?.normal,
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
    // console.log(card);
    return {
        card: data,
        cardId: row.card_id,
        printings,
        colors: colorString(card.colors || card.card_faces[0].colors),
    };
}

const reserveList = [];

export function isReserved(cardName) {
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

export function updateReserved(client) {
    return client.query('select * from cards;')
        .then((result) => Promise.all(
            result.rows.map((row) => reserveDB(client, row, isReserved(row.name))),
        ));
}

export function queryPrintings(start, end, client) {
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

export function moveToHashes(newHash, client) {
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

export function moveFromHashes(client) {
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
