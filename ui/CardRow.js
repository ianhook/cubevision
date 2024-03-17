import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { cardType } from './propTypes.js';
import ManaCost from './ManaCost.js';
import Sets from './Sets.js';
import OwnedSet from './OwnedSet.js';
import Replacements from './Replacements.js';
import CubeName from './CubeName.js';

const getStyle = (card) => {
    let backgroundColor = 'rgb(135, 110, 90)';
    let color = 'white';
    if (!card.color || card.manaCost === null) {
        // return {};
    } else if (card.color.length > 1) {
        backgroundColor = 'rgb(223, 204, 151)';
        color = 'black';
    } else if (card.color === 'G') {
        backgroundColor = 'rgb(200, 217, 209)';
        color = 'black';
    } else if (card.color === 'W') {
        backgroundColor = 'rgb(248, 248, 246)';
        color = 'black';
    } else if (card.color === 'R') {
        backgroundColor = 'rgb(245, 210, 190)';
        color = 'black';
    } else if (card.color === 'B') {
        backgroundColor = 'rgb(194, 187, 187)';
        color = 'black';
    } else if (card.color === 'U') {
        backgroundColor = 'rgb(182, 216, 233)';
        color = 'black';
    } else if (card.types === 'Land') {
        backgroundColor = 'rgb(196, 177, 112)';
        color = 'black';
    }
    return {
        height: 31,
        backgroundColor,
        color,
    };
};

const CardRow = ({ card, isHeader, canEdit }) => {
    const [matches, setMatches] = useState(
        window.matchMedia("(max-width: 750px)").matches
    );
    
    useEffect(() => {
        window
        .matchMedia("(max-width: 750px)")
        .addEventListener('change', e => setMatches( e.matches ));
    }, []);

    const style = {
        display: matches ? 'none' : 'table-cell',
    };

    if (isHeader) {
        return (
            <tr>
                <th>
                    Name
                </th>
                <th style={style}>
                    Image
                </th>
                <th style={style}>
                    Mana Cost
                </th>
                <th>
                    Types
                </th>
                <th>
                    Sets
                </th>
                <th>
                    Last Cube
                </th>
                {canEdit && (
                    <th style={style}>
                        Remove
                    </th>
                )}
                <th style={style}>
                    Price
                </th>
            </tr>
        );
    }
    const rowStyle = useMemo(() => getStyle(card), [card]);
    let reserved = '';
    if (card.reserved) {
        reserved = (
            <span style={{
                fontWeight: 'normal',
                fontSize: 'x-small',
                verticalAlign: 'top',
            }}
            >
                &reg;
            </span>
        );
    }
    const { printings } = card;

    const multiverseId = useMemo(() => {
        let mId = card.owned_multiverseid || card.multiverse_id;
        if (!mId && printings) {
            printings.forEach((printing) => {
                if (printing.multiverseid && printing.multiverseid > mId) {
                    mId = printing.multiverseid;
                }
            });
        }
        return mId;
    }, [card]);
    return (
        <tr
            style={rowStyle}
        >
            <td style={{ fontWeight: 'bold' }}>
                { card.name }
                { reserved }
            </td>
            <td style={style}>
                <a
                    target="__blank"
                    rel="noopener noreferrer"
                    href={`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${multiverseId}&type=card`}
                >
                    {card.scryfall_id ? (
                        <OwnedSet
                            printings={printings}
                            ownedId={card.scryfall_id}
                            cardId={card.card_id}
                        />
                    ) : 'Image'}
                </a>
            </td>
            <td style={style}>
                <ManaCost manaCost={card.manaCost} />
            </td>
            <td>{card.types ? card.types.replace(',', ' ') : 'Unknown'}</td>
            <td>
                <Sets
                    printings={printings}
                    scryfallId={card.scryfall_id}
                    cardId={card.card_id}
                />
            </td>
            <td>
                <CubeName cubeId={card.lastCube} />
            </td>
            {canEdit && (
                <td style={style}>
                    <Replacements cardId={card.card_id} />
                </td>
            )}
            <td style={style}>
                {card.usd}
            </td>
        </tr>
    );
};

CardRow.defaultProps = {
    isHeader: false,
    card: {},
    canEdit: false,
};

CardRow.propTypes = {
    card: cardType,
    isHeader: PropTypes.bool,
    canEdit: PropTypes.bool,
};

export default CardRow;
