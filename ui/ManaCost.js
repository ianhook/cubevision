import React from 'react';
import PropTypes from 'prop-types';

const colors = {
    'W': 'white',
    'G': 'green',
    'B': 'black',
    'U': 'blue',
    'R': 'red',
    'C': 'colorless'
};

const numberStyle = {
    backgroundColor: '#bfb5b4',
    borderRadius: '3.40282e+38px',
    display: 'flex',
    justifyContent: 'center',
    width: '25px',
    height: '25px',
    fontSize: '1.4rem',
    lineHeight: '1.6rem',
    fontFamily: 'cursive',
    color: 'black',
};

const ManaCost = ({ manaCost }) => {
    if (manaCost === null) {
        return null;
    }
    return (
        <div style={{ whiteSpace: 'nowrap', display: 'flex' }}>
            {manaCost.map((x, i) => {
                if (x === ' / ' || x === '  ') {
                    return ' // ';
                }
                if (!isNaN(x)) {
                    return (
                        <div style={numberStyle}>{x}</div>
                    );
                }
                if (colors.hasOwnProperty(x)) {
                    return (
                        <img
                            key={i} // eslint-disable-line react/no-array-index-key
                            alt={x}
                            src={`/img/${colors[x]}.svg`}
                        />
                    )
                }
                return (
                    <img
                        key={i} // eslint-disable-line react/no-array-index-key
                        alt={x}
                        src={`https://gatherer.wizards.com/Handlers/Image.ashx?size=medium&name=${x}&type=symbol`}
                    />
                );
            })}
        </div>
    );
};

ManaCost.defaultProps = {
    manaCost: '',
};

ManaCost.propTypes = {
    manaCost: PropTypes.arrayOf(PropTypes.string),
};

export default ManaCost;
