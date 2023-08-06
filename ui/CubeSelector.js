import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { cubeType } from './propTypes';

const CubeSelector = ({ cubes, onChange }) => (
    <select onChange={(e) => onChange(e.target.value)}>
        {Object.keys(cubes).map(cubeId => (
            <option key={cubeId} value={cubeId}>
                {cubes[cubeId].name}
            </option>
        ))}
    </select>
);
CubeSelector.defaultProps = {
    cubes: {},
};

CubeSelector.propTypes = {
    cubes: cubeType,
    onChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({ cubes: state.cubes });

const ConnectedCubeSelector = connect(mapStateToProps)(CubeSelector);

export default ConnectedCubeSelector;
