import React from 'react';

import { SET_CODES } from './consts';

type SetIconParams = {
    set: SetType;
}

type SetType = {
    set: string;
    rarity: string;
    multiverseid: number;
}

const SetIcon = ({ set }: SetIconParams) => {
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

export default SetIcon;
