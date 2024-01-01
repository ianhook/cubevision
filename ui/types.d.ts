type CubeType = {
    name: string;
    cube_id: number;
}

type CardType = {
    card_id: number;
    name: string;
    printings: string;
    mana_cost: string;
}

type ReduxState = {
    getCubeCards: number[][];
    getCards: CardType[];
    cubes: CubeType[];
}

export {
    CubeType,
    ReduxState,
    CardType,
}