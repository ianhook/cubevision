import React from 'react';

import CubeSelector from './CubeSelector.js';

export default class Updater extends React.Component {
    constructor(props) {
        super(props);
        this.handleSave = this.handleSave.bind(this);
        this.state = {};
    }
    handleSave() {
        if (!this.state.cubeId) {
            alert('You must select a cube');
            return
        }
        fetch('/api/cube/postcube', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                cube: this.state.cubeId,
                cards: this.cards.value,
            }),
        });
    }
    updateCards() {
        fetch('/api/card/update', {
            method: 'GET',
            headers: new Headers({ 'Content-Type': 'application/json' }),
        }).then((result) => {
            if (result.ok) {
                alert('Success');
            } else {
                alert('Failure');
            }
        });
    }
    render() {
        return (
            <React.Fragment>
                <div>
                    <CubeSelector onChange={(cubeId) => this.setState({ cubeId })} />
                    <textarea ref={(cards) => { this.cards = cards; }} />
                    <button onClick={this.handleSave}>Save</button>
                </div>
                <button onClick={this.updateCards}>Update Cards</button>
            </React.Fragment>
        );
    }
}
