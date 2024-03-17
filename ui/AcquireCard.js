import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getMissing } from './helper.js';
import { acquireCard } from './actions.js';

class Acquire extends React.Component {
    render() {
        const { cards, doAcquireCard } = this.props;
        return (
            <div>
                {cards.map((card) => (
                    <div key={card.card_id} style={{ padding: 8 }}>
                        {card.name}
                        <button onClick={() => doAcquireCard(card.card_id)}>Save</button>
                    </div>
                ))}
            </div>
        );
    }
}

Acquire.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        card_id: PropTypes.number,
    })).isRequired,
    doAcquireCard: PropTypes.func,
};

const mapStateToProps = (state) => ({
    cards: getMissing(state).map((card) => state.getCards[card]).filter((a) => a).sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    }),
});

const mapDispatchToProps = (dispatch) => ({
    doAcquireCard: (cardId) => dispatch(acquireCard(cardId)),
});

const ConnectedAcquire = connect(mapStateToProps, mapDispatchToProps)(Acquire);

export default ConnectedAcquire;
