import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { missingInCube } from './helper.js';

const PercentComplete = ({ missing, total, percent }) => (
    <span>&nbsp;{missing} / {total} - {(percent * 100.0).toPrecision(4)}</span>
);
PercentComplete.defaultProps = {
    missing: 0,
    total: 540,
    percent: 0.0,
};

PercentComplete.propTypes = {
    missing: PropTypes.number,
    total: PropTypes.number,
    percent: PropTypes.number,
};

const mapStateToProps = (state, ownProps) => {
    const missing = missingInCube(state, ownProps.cubeId);
    const total = (state.getCubeCards[ownProps.cubeId] || []);
    return {
        missing: missing.length,
        total: total.length,
        percent: 1.0 - (1.0 * missing.length) / total.length,
    };
};

const ConnectedPercentComplete = connect(mapStateToProps)(PercentComplete);

export default ConnectedPercentComplete;
