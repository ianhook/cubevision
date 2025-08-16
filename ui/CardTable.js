import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CardRow from './CardRow.js';
import Sorter from './Sorter.js';
import {
    colorSort,
    costSort,
    sort,
    isNotOnlineOnly,
} from './helper.js';
import { cardType } from './propTypes.js';
import { OUR_CUBE } from './consts.js';

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
        const { sortedCards, cards, cubeId, lastCubeId } = this.props;
        const canEdit = cubeId === OUR_CUBE;
        return (
            <div>
                <Sorter isCurrentCube={cubeId === lastCubeId} />
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
    cubeId: -1,
};

CardTable.propTypes = {
    cards: PropTypes.arrayOf(cardType),
    sortedCards: PropTypes.arrayOf(cardType),
    cubeId: PropTypes.number,
};

const mapStateToProps = (state, props) => {
    const { lastCubeId } = state.constants;
    let sortedCards = props.cards;

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
            if (a.lastCube < b.lastCube) {
                return 1;
            }
            if (a.lastCube > b.lastCube) {
                return -1;
            }
            if (a.cubeList.length < b.cubeList.length ) {
                return 1;
            }
            if (a.cubeList.length  > b.cubeList.length ) {
                return -1;
            }
            return 0;
        });
    } else if (state.sorter.sort === 'age') {
        const backup = sort('name')
        sortedCards = sortedCards.sort((cardA, cardB) => {
            const a = cardA.printings
                .filter((set) => isNotOnlineOnly(set) && set.releasedAt)
                .reduce((init, set) => (init < set.releasedAt ? init : set.releasedAt), 0);
            const b = cardB.printings
                .filter((set) => isNotOnlineOnly(set) && set.releasedAt)
                .reduce((init, set) => (init < set.releasedAt ? init : set.releasedAt), 0);
            if (a > b) {
                return -1;
            }
            if (a < b) {
                return 1;
            }
            return backup(cardA, cardB);
        });
    } else if (state.sorter.sort === 'color') {
        sortedCards = sortedCards.sort(colorSort);
    } else if (state.sorter.sort === 'cost') {
        sortedCards = sortedCards.sort(costSort);
    }
    return {
        lastCubeId,
        sortedCards,
    };
};

const ConnectedCardTable = connect(mapStateToProps)(CardTable);

export default ConnectedCardTable;
