import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { replaceCard } from './actions';
import { OUR_BINDER, LAST_CUBE } from './consts';
import { sort } from './helper';
import { cardType } from './propTypes';

class Replacements extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleSave = this.handleSave.bind(this);
    }

    handleSave() {
        const { cardId, doReplaceCard } = this.props;
        fetch('/api/card/replace', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                newCardId: this.cards.value,
                oldCardId: cardId,
            }),
        }).then((result) => {
            if (result.status === 200) {
                doReplaceCard(parseInt(this.cards.value, 10), cardId);
            }
        });
    }

    render() {
        const { cards } = this.props;
        if (cards.length === 0) {
            return null;
        }
        return (
            <div>
                <select ref={(cardList) => { this.cards = cardList; }}>
                    {cards.map((card) => (
                        <option value={card.card_id} key={card.card_id}>
                            { `${card.name} (${card.lastCube})` }
                        </option>
                    ))}
                </select>
                <button type="button" onClick={this.handleSave}>Save</button>
            </div>
        );
    }
}

Replacements.defaultProps = {
    cards: [],
};

Replacements.propTypes = {
    cardId: PropTypes.number.isRequired,
    cards: PropTypes.arrayOf(cardType),
    doReplaceCard: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    oldCard: cardType.isRequired,
};

const validReplacement = (oldCard, card) => {
    if ((card.color.length === 0 || card.color === 'C')
        && (oldCard.color.length === 0 || oldCard.color === 'C')
        && (oldCard.types === card.types || (oldCard.types !== 'Land' && card.types !== 'Land'))) {
        return true;
    }
    if (card.color.length === 1 && oldCard.color.length === 1
        && card.color !== 'C' && card.color === oldCard.color) {
        return true;
    }
    if (card.color.length >= 2 && oldCard.color.length >= 2) {
        return true;
    }
    return false;
};

const mapStateToProps = (state, props) => {
    let cards = [];
    const oldCard = state.getCards[props.cardId];
    const oldCardLastCube = state.cardCubes[props.cardId]?.lastCube;
    if (oldCardLastCube < LAST_CUBE) {
        const suggestReplacements = state.sorter.replacements;
        const sorter = suggestReplacements ? sort('lastCube', true) : sort();
        if (Object.hasOwnProperty.call(state.getCubeCards, OUR_BINDER)) {
            cards = state.getCubeCards[OUR_BINDER]
                .map((cardId) =>  ({ ...state.getCards[cardId], lastCube: state.cardCubes[cardId]?.lastCube || 0 }))
                .filter((card) => card.lastCube > 0
                    && (!suggestReplacements || (oldCardLastCube < card.lastCube
                        && validReplacement(oldCard, card))))
                .sort(sorter);
        }
    }
    return ({
        oldCard,
        cards,
    });
};

const mapDispatchToProps = (dispatch) => ({
    doReplaceCard: (newCardId, oldCardId) => dispatch(replaceCard(newCardId, oldCardId)),
});

const ConnectedReplacements = connect(mapStateToProps, mapDispatchToProps)(Replacements);

export default ConnectedReplacements;
