import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import { fetchCubes, fetchCards, fetchCubeCards } from './actions';
import Router from './Router';
import todoApp from './reducers';

const store = createStore(
    todoApp,
    applyMiddleware(
        thunk,
    ),
);

store.dispatch(fetchCubes());
store.dispatch(fetchCards());
store.dispatch(fetchCubeCards());

window.store = store;

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <Provider store={store}>
        <Router />
    </Provider>
);
