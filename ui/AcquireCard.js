import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getMissing } from './helper';

class Acquire extends React.Component {
    constructor(props) {
        super(props);
        this.handleSave = this.handleSave.bind(this);
    }

    handleSave() {
        fetch('/api/card/acquire', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                cardId: this.cards.value,
            }),
        });
    }

    render() {
        const { cards } = this.props;
        return (
            <div>
                <select ref={(cardList) => { this.cards = cardList; }}>
                    {cards.map((card) => (
                        <option value={card.card_id} key={card.card_id}>{card.name}</option>
                    ))}
                </select>
                <button onClick={this.handleSave}>Save</button>
            </div>
        );
    }
}

Acquire.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        card_id: PropTypes.number,
    })).isRequired,
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

const ConnectedAcquire = connect(mapStateToProps)(Acquire);

export default ConnectedAcquire;
