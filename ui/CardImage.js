import React from 'react';
import PropTypes from 'prop-types';

const CardImage = ({ multiverseId }) => {
    if (multiverseId === 0) {
        return null;
    }
    const style = {
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 10000,
        // width:auto;
        // max-width:320px;
        // min-height:128px;
        // border:1px solid black;
        // margin-top:12px;
        marginRight: 43,
        overflow: 'hidden',
        // padding: 8,
    };
    return (
        <img
            alt={multiverseId}
            style={style}
            src={`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${multiverseId}&type=card`}
        />
    );
};

CardImage.defaultProps = {
    multiverseId: 0,
};

CardImage.propTypes = {
    multiverseId: PropTypes.number,
};

export default CardImage;
