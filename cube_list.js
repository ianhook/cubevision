import fetch from 'node-fetch';
import parser from 'node-html-parser';
import pg from 'pg';

pg.defaults.ssl = true;

import {
    addCardToCube,
    findOrCreateCard,
}  from './backend/postgres.js';

// insert into cubes (name) values ('Aug 2024');
const NEWEST_CUBE = 39;
const CUBE_URL = 'https://www.mtgo.com/vintage-cube-cardlist';
// const CUBE_URL = 'https://magic.wizards.com/en/articles/archive/vintage-cube-cardlist';
// const CUBE_URL = 'https://magic.wizards.com/en/articles/archive/magic-online/vintage-cube-july-2021-update';
// const CUBE_URL = 'https://magic.wizards.com/en/articles/archive/magic-online/spotlight-cube-series-alt-vintage-cube-2021-05-26';

function pool() {
    const db_conn_str = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_URL}`;
    return new pg.Pool({
        connectionString: db_conn_str,
        ssl: false,
    });
}

function insertCards(cube, cards) {
    const out = [];
    // console.log(cube, cards);
    return pool().connect((connErr, client, done) => {
        console.log(connErr, client, done);
        return Promise.all(
            cards.map((name) => new Promise((resolve) => {
                findOrCreateCard(name, client, (id) => {
                    out.push(id);
                    resolve();
                });
            })),
        )
            .then(() => Promise.all(
                out.map((cardId) => {
                    console.log(cardId);
                    addCardToCube(cube, cardId, client);
                }),
            ))
            .then(() => {
                console.log(out);
                done();
            })
            .catch((err) => console.log(err));
    });
}

async function main() {
    await new Promise((resolve) => {
        fetch(CUBE_URL)
            .then((res) => res.text())
            .then((body) => parser.parse(body))
            // .then((el) => { console.log(el); return el; })
            .then((el) => el.querySelectorAll('tbody')[0])
            // .then((el) => { console.log(el); return el; })
            .then((table) => table.querySelectorAll('tr'))
            // .then((el) => { console.log(el, el.length); return el; })
            .then((rows) => rows.map((row) => row.querySelectorAll('td')[1]?.text).filter((c) => c))
            // .then((el) => { console.log(el, el.length); return el; })
            .then((cardNames) => insertCards(NEWEST_CUBE, cardNames))
            .then(() => resolve());
    });
}

// const readline = require('readline');
// const events = require('events');
// const fs = require('fs');

// async function main() {
//     const rl = readline.createInterface({
//         input: fs.createReadStream('dec_2022.clist'),
//         crlfDelay: Infinity,
//     });

//     let cards = [];
//     rl.on('line', (line) => {
//         // console.log(`Line from file: ${line}`);
//         cards = cards.concat(line);
//     });

//     await events.once(rl, 'close');
//     console.log(NEWEST_CUBE, cards.length);
//     p = await insertCards(NEWEST_CUBE, cards);
//     console.log(p)
//     await p;
// }

main();
