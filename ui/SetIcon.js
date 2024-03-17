import React from 'react';

import { setType } from './propTypes.js';
import { SET_CODES } from './consts.js';

const SetIcon = ({ set }) => {
    if (!Object.hasOwnProperty.call(set, 'set')) {
        return null;
    }
    let setCode = set.set.toLowerCase();
    if (Object.hasOwnProperty.call(SET_CODES, setCode)) {
        setCode = SET_CODES[setCode];
    }
    let rarity = 'rare';
    if (set.rarity === 'M') {
        rarity = 'mythic';
    } else if (set.rarity === 'U') {
        rarity = 'uncommon';
    } else if (set.rarity === 'C') {
        rarity = 'common';
    } else if (set.set === 'TSB') {
        rarity = 'timeshifted';
    }
    return (
        <i
            title={`${setCode.toUpperCase()} ${rarity}`}
            style={{ paddingRight: 1 }}
            className={`ss ss-grad ss-2x ss-fw ss-${setCode} ss-${rarity}`}
        />
    );
};

SetIcon.propTypes = {
    set: setType.isRequired,
};

export default SetIcon;
