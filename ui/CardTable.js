import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CardRow from './CardRow';
import Sorter from './Sorter';
import {
    colorSort,
    costSort,
    sort,
    isInStandard,
    isNotOnlineOnly,
    missingInCube,
} from './helper';
import { cardType } from './propTypes';
import { OUR_CUBE, LAST_CUBE } from './consts';

class CardTable extends React.PureComponent {
    constructor(props) {
        super(props);
        this.copyBuylist = this.copyBuylist.bind(this);
    }

    copyBuylist() {
        const { sortedCards } = this.props;
        const list = sortedCards.map((card) => `1 ${card.name}`).join('\n');
        navigator.clipboard.writeText(list);
    }

    render() {
        const { sortedCards, cards, cubeId } = this.props;
        const canEdit = cubeId === OUR_CUBE;
        return (
            <div>
                <Sorter isCurrentCube={cubeId === LAST_CUBE} />
                <button type="button" onClick={this.copyBuylist}>Copy Buylist</button>
                <div style={{ margin: 4, fontWeight: 'bold' }}>
                    {`${sortedCards.length} of ${cards.length}`}
                </div>
                <div style={{ margin: 4, fontWeight: 'bold' }}>
                    ${(sortedCards.filter((c) => c.usd)
                        .reduce((val, c) => val + parseFloat(c.usd.replace('$','')), 0.0))
                        .toLocaleString()}
                </div>
                <table>
                    <thead>
                        <CardRow isHeader canEdit={canEdit} />
                    </thead>
                    <tbody>
                        {sortedCards.map((card) => (
                            <CardRow
                                key={card.card_id}
                                card={card}
                                canEdit={canEdit}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

CardTable.defaultProps = {
    cards: [],
    sortedCards: [],
    cubeId: OUR_CUBE,
};

CardTable.propTypes = {
    cards: PropTypes.arrayOf(cardType),
    sortedCards: PropTypes.arrayOf(cardType),
    cubeId: PropTypes.number,
};

const mapStateToProps = (state, props) => {
    let sortedCards = props.cards.filter((card) => card).map((card) => {
        const cubes = Object.keys(state.getCubeCards).filter((cubeId) => {
            if (cubeId === '8' || cubeId === '9') {
                return false;
            }
            const cube = state.getCubeCards[cubeId];
            return cube.indexOf(card.card_id) >= 0;
        });
        const lastCube = Math.max(...cubes.map((c) => parseInt(c, 10)));
        return { ...card, lastCube };
    });
    if (state.sorter.standard) {
        sortedCards = sortedCards.filter((card) => !isInStandard(card));
    }
    const filterCube = props.cubeId === LAST_CUBE ? OUR_CUBE : LAST_CUBE;
    if (state.sorter.current) {
        sortedCards = sortedCards.filter((card) => (
            state.getCubeCards[filterCube].indexOf(card.card_id) > -1));
    }
    if (state.sorter.excludeCurrent) {
        sortedCards = sortedCards.filter((card) => (
            state.getCubeCards[filterCube].indexOf(card.card_id) === -1));
    }
    if (state.sorter.reserved) {
        sortedCards = sortedCards.filter((card) => card.reserved);
    }
    if (state.sorter.missing) {
        const missing = missingInCube(state, props.cubeId).map((id) => parseInt(id, 10));
        sortedCards = sortedCards.filter((card) => missing.includes(card.card_id));
    }
    if (state.sorter.sort === 'name' || state.sorter.sort === 'types') {
        sortedCards = sortedCards.sort(sort(state.sorter.sort));
    } else if (state.sorter.sort === 'price') {
        sortedCards = sortedCards.sort((a, b) => {
            if (a.usd === null) {
                return -1;
            }
            if (b.usd === null) {
                return  1;
            }
            const aUSD = parseFloat(a.usd.replace('$',''),10);
            const bUSD = parseFloat(b.usd.replace('$',''),10);
            if (aUSD > bUSD) {
                return -1;
            }
            if (aUSD < bUSD) {
                return 1;
            }
            return 0;
        });
    } else if (state.sorter.sort === 'lastCube') {
        sortedCards = sortedCards.sort((a, b) => {
            if (a.lastCube > b.lastCube) {
                return -1;
            }
            if (a.lastCube < b.lastCube) {
                return 1;
            }
            return 0;
        });
    } else if (state.sorter.sort === 'age') {
        sortedCards = sortedCards.sort((cardA, cardB) => {
            const a = cardA.printings
                .filter((set) => isNotOnlineOnly(set) && set.multiverseid)
                .reduce((init, set) => (init > set.multiverseid ? init : set.multiverseid), 0);
            const b = cardB.printings
                .filter((set) => isNotOnlineOnly(set) && set.multiverseid)
                .reduce((init, set) => (init > set.multiverseid ? init : set.multiverseid), 0);
            if (a > b) {
                return -1;
            }
            if (a < b) {
                return 1;
            }
            return sort('name');
        });
    } else if (state.sorter.sort === 'color') {
        sortedCards = sortedCards.sort(colorSort);
    } else if (state.sorter.sort === 'cost') {
        sortedCards = sortedCards.sort(costSort);
    }
    return {
        sortedCards,
    };
};

const ConnectedCardTable = connect(mapStateToProps)(CardTable);

export default ConnectedCardTable;
