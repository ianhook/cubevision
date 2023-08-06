import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CardTable from './CardTable';
import { cubeType, cardType } from './propTypes';

const Cube = ({ cube, cards }) => (
    <div>
        <h2>{cube.name}</h2>
        <CardTable cards={cards} cubeId={cube.cube_id} />
    </div>
);

Cube.defaultProps = {
    cube: {},
    cards: [],
};

Cube.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    cube: cubeType,
    cards: PropTypes.arrayOf(cardType),
};

const mapStateToProps = (state, props) => {
    const cubeId = props.match.params.id;
    let cards = [];
    if (Object.hasOwnProperty.call(state.getCubeCards, cubeId)) {
        cards = state.getCubeCards[cubeId]
            .map((cardId) => state.getCards[cardId]);
    }
    return ({
        cube: state.cubes[cubeId],
        cards,
    });
};

const ConnectedCube = connect(mapStateToProps)(Cube);

export default ConnectedCube;
