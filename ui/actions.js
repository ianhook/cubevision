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
        cubes: json,
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
