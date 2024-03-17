import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CardTable from './CardTable.js';
import { getMissing } from './helper.js';

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

const mapStateToProps = (state) => ({
    cards: getMissing(state).map((card) => state.getCards[card]),
});

const ConnectedMissing = connect(mapStateToProps)(Missing);

export default ConnectedMissing;
