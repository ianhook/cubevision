import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { CubeType, CardType, ReduxState } from './types';
import CardTable from './CardTable';

type CubeParams = {
    cube: CubeType;
    cards: CardType[];
    cubeId: number;
}

const Cube = ({ cube, cards, cubeId }: CubeParams) => (
    <div>
        <h2>{cube.name}</h2>
        <CardTable cards={cards} cubeId={cubeId} />
    </div>
);

Cube.defaultProps = {
    cube: {},
    cards: [],
};

const mapStateToProps = (state: ReduxState, { cubeId }: CubeParams) => {
    let cards: CardType[] = [];
    if (Object.hasOwnProperty.call(state.getCubeCards, cubeId)) {
        cards = state.getCubeCards[cubeId]
            .map((cardId: number) => state.getCards[cardId]);
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
