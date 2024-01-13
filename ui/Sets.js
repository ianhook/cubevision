import React from 'react';
import PropTypes from 'prop-types';

import SetIcon from './SetIcon';
import { setType } from './propTypes';
import { styles } from './consts';
import { isNotOnlineOnly } from './helper';
import CardImage from './CardImage';

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


class Sets extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showImage: false,
        };
    }

    showImage(showImage) {
        this.setState({ showImage });
    }

    hideImage(image) {
        this.setState((prevState) => {
            if (prevState.showImage === image) {
                return { showImage: false };
            }
            return {};
        });
    }

    render() {
        const { printings, scryfallId, cardId } = this.props;
        const { showImage } = this.state;
        const style = {
            display: 'inline-block',
        };
        return (
            <div style={{ position: 'relative' }}>
                {printings && printings
                    .map((set, i, arr) => (
                        <div
                            key={`${set.set}-${set.scryfallId}-${i}`} // eslint-disable-line react/no-array-index-key
                            role="button"
                            tabIndex={0}
                            style={scryfallId === set.scryfallId ||
                                (scryfallId === null && i === (arr.length - 1)) ? style : styles.hideOnSmall}
                            onClick={handleSave(cardId, set.multiverseid, set.scryfallId)}
                            onMouseEnter={() => this.showImage(set.scryfallId)}
                            onMouseLeave={() => this.hideImage(set.scryfallId)}
                        >
                            <SetIcon
                                set={set}
                            />
                            {showImage === set.scryfallId && <CardImage image={set.image} />}
                        </div>
                    ))}
            </div>
        );
    };
}

Sets.propTypes = {
    cardId: PropTypes.number.isRequired,
    ownedId: PropTypes.number,
    printings: PropTypes.arrayOf(setType).isRequired,
};

Sets.defaultProps = {
    ownedId: null,
};

export default Sets;
