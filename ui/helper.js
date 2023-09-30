import { MISSING_CUBE } from './consts';

const standardSets = [
    'ZNR',
    'KHM',
    'STX',
    'AFR',
    'MID',
    'VOW',
    'NEO',
    'SNC',
];

const isInStandard = (card) => JSON.parse(card.printings)
    .reduce((init, set) => init || standardSets.indexOf(set.set) !== -1, false);

const isNotOnlineOnly = (set) => !(/ME[D1-4]|VMA|TPR|PZ1|PMODO/i.test(set.set));

const getMissing = (state) => {
    let missingCards = [];
    if (Object.hasOwnProperty.call(state.getCubeCards, MISSING_CUBE)) {
        missingCards = state.getCubeCards[MISSING_CUBE];
    }
    return missingCards;
};

const missingInCube = (state, cubeId) => {
    const missingCards = getMissing(state);
    const cardsInCube = state.getCubeCards[cubeId] || [];

    return missingCards.filter((card) => cardsInCube.includes(parseInt(card, 10)));
};

const colorSortHelper = (cardA, cardB) => {
    let a = cardA.color;
    let b = cardB.color;

    if (a === '') {
        a = 'C';
    }
    if (b === '') {
        b = 'C';
    }

    if (a === 'C' && b === 'C') {
        if (cardA.types.includes('Land') && cardB.types.includes('Land')) {
            return 0;
        }
        if (cardA.types.includes('Land')) {
            return 1;
        }
        if (cardB.types.includes('Land')) {
            return -1;
        }
    }
    if (a === b) {
        return 0;
    }

    if (a.length > b.length) {
        return 1;
    }
    if (a.length < b.length) {
        return -1;
    }

    const orders = ['W', 'U', 'B', 'R', 'G', 'C'];

    if (a.length > orders.length) {
        return 0;
    }
    let res = 0;
    const aArray = a.split('');
    const bArray = b.split('');
    let i = 0;

    res = aArray.reduce((tmp, color) => {
        if (tmp !== 0) {
            return tmp;
        }
        const colorB = bArray[i];
        let subRes = 0;
        if (color === colorB) {
            // pass
        } else if (orders.indexOf(color) > orders.indexOf(colorB)) {
            subRes = 1;
        } else {
            subRes = -1;
        }
        i += 1;

        return subRes;
    }, res);
    return res;
};

const sort = (field = 'name', directionIn = false) => (a, b) => {
    const direction = directionIn ? 1 : -1;
    if (a[field] < b[field]) {
        return direction;
    }
    if (a[field] > b[field]) {
        return direction * -1;
    }
    if (field !== 'name') {
        return colorSort(a, b);
    }
    return 0;
};

const colorSort = (cardA, cardB) => {
    const colorSorting = colorSortHelper(cardA, cardB);
    if (colorSorting !== 0) {
        return colorSorting;
    }
    return sort('name')(cardA, cardB);
};

const costSort = (cardA, cardB) => {
    const returnValue = colorSortHelper(cardA, cardB);
    if (returnValue === 0) {
        if (cardA.cmc === cardB.cmc) {
            return sort('name')(cardA, cardB);
        }
        if (cardA.cmc > cardB.cmc) {
            return 1;
        }
        return -1;
    }
    return returnValue;
};

export {
    colorSort,
    costSort,
    getMissing,
    isInStandard,
    isNotOnlineOnly,
    missingInCube,
    sort,
};
