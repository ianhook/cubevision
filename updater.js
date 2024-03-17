import { getData } from './backend/utils.js';
import CardDB from './backend/card_db.js';

const args = process.argv.slice(2);

const startParam = parseInt(args[0], 10);
const endParam = parseInt(args[1], 10);
const STEP = 1;

async function doUpdate(resolve, start, end) {
    let current = start;
    let currentEnd = end;
    const db = new CardDB(process.env.DATABASE_URL || 'postgresql://ianhook:postgres@localhost:5432/ianhook');
    // await db.initialize();
    while (current <= end) {
        console.log(current, end)
        currentEnd = current + STEP - 1;
        await db.queryCardRange(current, currentEnd)
            .then((result) => Promise.all(
                result.rows.map((row) => getData(row, {})
                    .then((data) => {
                        // console.log(data);
                        if (!data.card?.name) {
                            return;
                        }
                        // console.log(data.card.name);
                        return db.updatePrintingsScryfall(
                            data.card, data.cardId,
                            data.colors, data.printings,
                        );
                    })
                    .catch((dataErr) => {
                        console.log('update error', dataErr);
                    })
                )
            ))
            .then(() => console.log('success'))
            .catch((err) => console.log(`Error ${err}`));
        current = currentEnd + 1;
        console.log('~~~~~~~~~~ batch:', currentEnd);
    }
    db.release();
    resolve();
}

async function updateReserved() {
    const db = new CardDB(process.env.DATABASE_URL);
    await db.updateReservedCards();
}

if (!Number.isNaN(startParam) && !Number.isNaN(endParam)) {
    (new Promise((resolve) => doUpdate(resolve, startParam, endParam)))
        .then(() => {
            console.log('done');
            process.exit(); // probably not closing everything correctly
        });
}

// updateReserved();
