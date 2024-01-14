import React from 'react';
import PropTypes from 'prop-types';

import Sets from './Sets';
import { setType } from './propTypes';

const OwnedSet = ({ printings, ownedId, cardId }) => {
    let owned = [];
    if (ownedId.trim() === '-1') {
        return <>Proxy</>;
    }
    printings
        .forEach((set) => {
            if (set.scryfallId === ownedId) {
                owned.push(set);
            }
        });

    return <Sets cardId={cardId} ownedId={ownedId} printings={owned} />;
};

OwnedSet.propTypes = {
    ownedId: PropTypes.number,
    printings: PropTypes.arrayOf(setType).isRequired,
    cardId: PropTypes.number,
};

OwnedSet.defaultProps = {
    ownedId: 0,
};

export default OwnedSet;
