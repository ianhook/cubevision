import { combineReducers } from 'redux';
import { MISSING_CUBE, OUR_CUBE, OUR_BINDER, REPLACEMENTS_CUBE } from './consts';

const merge = (a, b, predicate = (a, b) => a === b) => {
    const c = [...a]; // copy to avoid side effects
    // add all items from B to copy C if they're not already present
    b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
    return c;
};

const parseManaCosts = (manaCost) => {
    if (manaCost === '' || manaCost === null) {
        return null;
    }
    const re = /{([0-9/WRGBUCXP]+)}/;
    return manaCost.split(re).filter((x) => x !== '').map((y) => y.replaceAll('/', ''));
};

const cubes = (currentCubes = {}, action) => {
    switch (action.type) {
    case 'RECEIVE_CUBES':
        return action.cubes.reduce((init, cube) => ({ ...init, [cube.cube_id]: cube }));
    default:
        return currentCubes;
    }
};

const getCards = (cards = {}, action) => {
    switch (action.type) {
    case 'RECEIVE_CARDS':
        return action.cards.reduce((init, card) => ({
            ...init,
            [card.card_id]: {
                ...card,
                printings: JSON.parse(card.printings),
                manaCost: parseManaCosts(card.mana_cost),
            },
        }), {});
    default:
        return cards;
    }
};

const getCubeCards = (cards = {}, action) => {
    let outCards;
    let ownedCards;
    switch (action.type) {
    case 'RECEIVE_CUBE_CARDS':
        // eslint-disable-next-line camelcase
        outCards = action.cubes.reduce((init, { card_id, cube_id }) => {
            const ret = { ...init };
            if (!Object.hasOwnProperty.call(ret, cube_id)) {
                ret[cube_id] = [];
            }
            ret[cube_id].push(parseInt(card_id, 10));
            return ret;
        }, {});
        ownedCards = merge(outCards[OUR_BINDER], outCards[OUR_CUBE]);
        outCards[MISSING_CUBE] = Object.values(outCards).reduce((init, cardIds) => merge(init, cardIds.filter((id) => !ownedCards.includes(id))), []);
        outCards[REPLACEMENTS_CUBE] = outCards[OUR_BINDER];
        return outCards;
    case 'REPLACE_CARD':
        outCards = { ...cards };
        outCards[OUR_CUBE][cards[OUR_CUBE].indexOf(action.oldCardId)] = action.newCardId;
        outCards[OUR_BINDER][cards[OUR_BINDER].indexOf(action.newCardId)] = action.oldCardId;
        return outCards;
    default:
        return cards;
    }
};

const cardCubes = (cards = {}, action) => {
    switch (action.type) {
    case 'RECEIVE_CUBE_CARDS':
        // eslint-disable-next-line camelcase
        return action.cubes.reduce((init, { card_id, cube_id }) => {
            const ret = { ...init };
            const cubeId = parseInt(cube_id, 10);
            if (![OUR_CUBE, OUR_BINDER].includes(cube_id)) {
                if (!Object.hasOwnProperty.call(ret, card_id)) {
                    ret[card_id] = {
                        lastCube: cube_id,
                        cubeList: [],
                    };
                }
                ret[card_id].cubeList.push(cubeId);
                if (cubeId > ret[card_id].lastCube) {
                    ret[card_id].lastCube = cubeId;
                }
            }
            return ret;
        }, {});
    default:
        return cards;
    }
};

const sorter = (sortings = {
    sort: 'name',
}, action) => {
    switch (action.type) {
    case 'SET_SORTER':
        return { ...sortings, ...action.data };
    default:
        return sortings;
    }
};

const rootReducer = combineReducers({
    cubes,
    getCards,
    getCubeCards,
    cardCubes,
    sorter,
});

export default rootReducer;
