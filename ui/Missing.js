import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CardTable from './CardTable.js';
import { cardFilter, getMissing } from './helper.js';
import { MISSING_CUBE } from './consts.js';

const Missing = ({ cards }) => (
    <div>
        <h2>Missing</h2>
        <CardTable cards={cards} />
    </div>
);

Missing.defaultProps = {
    cards: [],
};

Missing.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.shape({
        // card
        name: PropTypes.string,
    })),
};

const mapStateToProps = (state) => {
    let cards = getMissing(state).map((card) => state.getCards[card])
            .filter(cardFilter(state, MISSING_CUBE));
    return ({
        cards,
    });
};

const ConnectedMissing = connect(mapStateToProps)(Missing);

export default ConnectedMissing;
