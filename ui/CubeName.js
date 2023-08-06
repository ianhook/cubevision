import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const CubeName = ({ cube }) => {
    return <>{cube?.name}</>;
};

CubeName.defaultProps = {
    cube: {},
};

CubeName.propTypes = {
    cubeId: PropTypes.number.isRequired,
    cube: PropTypes.shape({
        name: PropTypes.string,
    }),
};

const mapStateToProps = (state, props) => ({
    cube: state.cubes[props.cubeId],
});

const ConnectedCubeName = connect(mapStateToProps)(CubeName);

export default ConnectedCubeName;
