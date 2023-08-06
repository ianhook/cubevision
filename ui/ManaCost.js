import React from 'react';
import PropTypes from 'prop-types';

const ManaCost = ({ manaCost }) => {
    if (manaCost === null) {
        return null;
    }
    return (
        <div style={{ whiteSpace: 'nowrap' }}>
            {manaCost.map((x, i) => {
                if (x === ' / ' || x === '  ') {
                    return ' // ';
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
