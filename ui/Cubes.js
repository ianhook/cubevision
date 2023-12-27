import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { cubeType } from './propTypes';
import PercentComplete from './PercentComplete';

const Cubes = ({ cubes }) => (
    <div>
        <h2>Cubes</h2>
        <ul>
            {Object.keys(cubes).filter(cubeId => cubes[cubeId].name).map(cubeId => (
                <li key={cubeId}>
                    <Link to={`/cube/${cubeId}`}>
                        {cubes[cubeId].name}
                    </Link>
                    <PercentComplete cubeId={cubeId} />
                </li>
            ))}
        </ul>
    </div>
);
Cubes.defaultProps = {
    cubes: {},
};

Cubes.propTypes = {
    cubes: cubeType,
};

const mapStateToProps = state => ({ cubes: state.cubes });

const ConnectedCubes = connect(mapStateToProps)(Cubes);

export default ConnectedCubes;
