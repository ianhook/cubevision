import pg from 'pg';
import { isReserved, updateReserved } from './utils.js';

class CardDb {
    constructor(connectionString) {
        this.pool = new pg.Pool({
            connectionString,
            ssl: false,
        });
        this.client = null;
    }

    // async initialize() {
    //     await this.withClient();
    // }

    release() {
        if (this.client) {
            this.client.release();
        }
    }

    // async withClient() {
    //     if (this.client === null) {
    //         this.client = await this.pool.connect();
    //     }
    //     return this.client;
    // }

    withClient(func) {
        return new Promise((resolve) => this.pool.connect((connErr, client, done) => func(client)
            .then((value) => {
                resolve(value);
                done();
            })));
    }

    queryCardRange(start, end) {
        console.log(`select * from cards where card_id >= ${start} and card_id <= ${end};`);
        return this.withClient((client) => client.query(`select * from cards where card_id >= ${start} and card_id <= ${end};`));
    }

    updatePrintings(card, cardId, colors, printings) {
        const params = [
            card.cmc,
            card.manaCost,
            isReserved(card.name),
            cardId,
            colors,
            card.types.join(','),
            JSON.stringify(printings),
        ];
        console.log('update', params);
        return this.withClient((client) => client.query(
            'update cards set cmc = $1, mana_cost = $2, reserved = $3, \
            color = $5, types = $6, printings = $7 where card_id = $4',
            params,
        ));
    }

    updatePrintingsScryfall(card, cardId, colors, printings) {
        const params = [
            cardId,
            card.reserved,
            // card.scryfallId,
            card.usd || 0,
            card.usdUpdated,
            JSON.stringify(printings),
            colors,
            card.cmc,
            card.manaCost,
            card.types
        ];
        console.log('update', params);
        return this.withClient((client) => client.query(
            'update cards set reserved = $2, usd = $3, usd_updated = $4, printings = $5, color = $6, cmc = $7, mana_cost = $8, types = $9 where card_id = $1',
            params,
        ));
    }

    updateReservedCards() {
        this.withClient((client) => updateReserved(client));
    }
}

export default CardDb;
