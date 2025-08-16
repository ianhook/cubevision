export const REQUEST_CUBES = 'REQUEST_CUBES';
function requestCubes() {
    return {
        type: REQUEST_CUBES,
    };
}

export const RECEIVE_CUBES = 'RECEIVE_CUBES';
function receiveCubes(json) {
    return {
        type: RECEIVE_CUBES,
        cubes: json,
        receivedAt: Date.now(),
    };
}

export function fetchCubes() {
    return (dispatch) => {
        dispatch(requestCubes());
        return fetch('/api/cube')
            .then(
                response => response.json(),
                error => console.log('An error occured.', error),
            )
            .then(json => dispatch(receiveCubes(json)));
    };
}

export const REQUEST_CARDS = 'REQUEST_CARDS';
function requestCards() {
    return {
        type: REQUEST_CARDS,
    };
}

export const RECEIVE_CARDS = 'RECEIVE_CARDS';
function receiveCards(json) {
    return {
        type: RECEIVE_CARDS,
        cards: json,
        receivedAt: Date.now(),
    };
}

export const REPLACE_CARD = 'REPLACE_CARD';
export function replaceCard(newCardId, oldCardId) {
    return {
        type: REPLACE_CARD,
        newCardId,
        oldCardId,
    };
}

export function fetchCards() {
    return (dispatch) => {
        dispatch(requestCards());
        return fetch('/api/card')
            .then(
                response => response.json(),
                error => console.log('An error occured.', error),
            )
            .then(json => dispatch(receiveCards(json)));
    };
}

export const REQUEST_CUBE_CARDS = 'REQUEST_CUBE_CARDS';
function requestCubeCards() {
    return {
        type: REQUEST_CUBE_CARDS,
    };
}

export const RECEIVE_CUBE_CARDS = 'RECEIVE_CUBE_CARDS';
function receiveCubeCards(json) {
    return {
        type: RECEIVE_CUBE_CARDS,
        cardCubes: json,
        receivedAt: Date.now(),
    };
}

export function fetchCubeCards() {
    return (dispatch) => {
        dispatch(requestCubeCards());
        return fetch('/api/cube/cards')
            .then(
                response => response.json(),
                error => console.log('An error occured.', error),
            )
            .then(json => dispatch(receiveCubeCards(json)));
    };
}

export const ACQUIRE_CARD = 'ACQUIRE_CARD';
function acquireCardAction(cardId) {
    return {
        type: ACQUIRE_CARD,
        cardId,
    };
}
export function acquireCard(cardId) {
    return (dispatch) => {
        dispatch(acquireCardAction(cardId));
        return fetch('/api/card/acquire', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ cardId }),
        });
    };
}
