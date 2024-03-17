import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import SetIcon from './SetIcon.js';
import { setType } from './propTypes.js';
import CardImage from './CardImage.js';

const handleSave = (cardId, multiverseid, scryfallId) => () =>
    fetch('/api/card/setversion', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
            cardId,
            multiverseid,
            scryfallId,
        }),
    });

const Sets = ({ printings, scryfallId, cardId }) => {
    const [matches, setMatches] = useState(
        window.matchMedia("(max-width: 750px)").matches
    );
    
    useEffect(() => {
        window
        .matchMedia("(max-width: 750px)")
        .addEventListener('change', e => setMatches( e.matches ));
    }, []);

    const style = {
        display: matches ? 'none' : 'inline-block',
    };
    
    const [showImage, setShowImage] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            {printings && printings
                .map((set, i, arr) => (
                    <div
                        key={`${set.set}-${set.scryfallId}-${i}`} // eslint-disable-line react/no-array-index-key
                        role="button"
                        tabIndex={0}
                        style={{
                            display: (!matches || scryfallId === set.scryfallId ||
                            (scryfallId === null && i === (arr.length - 1))) ? 'inline-block' : 'none'
                        }}
                        onClick={handleSave(cardId, set.multiverseid, set.scryfallId)}
                        onMouseEnter={() => setShowImage(set.scryfallId)}
                        onMouseLeave={() => showImage === set.scryfallId ? setShowImage(false) : null}
                    >
                        <SetIcon
                            set={set}
                        />
                        <div style={{ position: 'absolute' }}>
                            {showImage === set.scryfallId && <CardImage image={set.image} />}
                        </div>
                    </div>
                ))}
        </div>
    );
}

Sets.propTypes = {
    cardId: PropTypes.number.isRequired,
    scryfallId: PropTypes.number,
    printings: PropTypes.arrayOf(setType).isRequired,
};

Sets.defaultProps = {
    ownedId: null,
};

export default Sets;
