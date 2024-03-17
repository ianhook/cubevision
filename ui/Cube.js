import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import CardTable from './CardTable.js';
import { cubeType, cardType } from './propTypes.js';

const Cube = ({ cube, cards, cubeId }) => (
    <div>
        <h2>{cube.name}</h2>
        <CardTable cards={cards} cubeId={cubeId} />
    </div>
);

Cube.defaultProps = {
    cube: {},
    cards: [],
};

Cube.propTypes = {
    cubeId: PropTypes.number,
    cube: cubeType,
    cards: PropTypes.arrayOf(cardType),
};

const mapStateToProps = (state, { cubeId }) => {
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


function SomeComponent() {
    const { cubeId } = useParams();
    return (<ConnectedCube cubeId={parseInt(cubeId, 10)} />);
}

export default SomeComponent;
