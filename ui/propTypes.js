import PropTypes from 'prop-types';

const cardType = PropTypes.shape({
    card_id: PropTypes.number,
    name: PropTypes.string,
});

const cubeType = PropTypes.shape({
    name: PropTypes.string,
});

const setType = PropTypes.shape({
    set: PropTypes.string,
    rarity: PropTypes.string,
    multiverseid: PropTypes.oneOf(PropTypes.number, PropTypes.string),
});

export {
    cardType,
    cubeType,
    setType,
};
