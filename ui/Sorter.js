import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Radium from 'radium';

const Sorter = ({ onChange, isCurrentCube }) => (
    <div>
        <div style={{
            display: 'flex', // Use flexbox to align elements horizontally
            alignItems: 'center', // Align items vertically centered
            justifyContent: 'space-between',
            '@media (min-width: 500px)': {
                justifyContent: 'start',
            },
        }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="standard"
                    type="checkbox"
                    onChange={(e) => onChange('standard', e.target.checked)}
                />
                <label htmlFor="standard" style={{ marginLeft: '4px' }}>
                    Exclude Standard
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="current"
                    type="checkbox"
                    onChange={(e) => onChange('current', e.target.checked)}
                />
                <label htmlFor="current" style={{ marginLeft: '4px' }}>
                    { `Only ${isCurrentCube ? 'Our' : 'Current'} Cube` }
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="excludeCurrent"
                    type="checkbox"
                    onChange={(e) => onChange('excludeCurrent', e.target.checked)}
                />
                <label htmlFor="excludeCurrent" style={{ marginLeft: '4px' }}>
                    { `Exclude ${isCurrentCube ? 'Our' : 'Current'} Cube` }
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="reserved"
                    type="checkbox"
                    onChange={(e) => onChange('reserved', e.target.checked)}
                />
                <label htmlFor="reserved" style={{ marginLeft: '4px' }}>
                    Only Reserved
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="missing"
                    type="checkbox"
                    onChange={(e) => onChange('missing', e.target.checked)}
                />
                <label htmlFor="missing" style={{ marginLeft: '4px' }}>
                    Missing
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="replacements"
                    type="checkbox"
                    onChange={(e) => onChange('replacements', e.target.checked)}
                />
                <label htmlFor="replacements" style={{ marginLeft: '4px' }}>
                    Suggest Replacements
                </label>
            </div>
        </div>
        <div style={{
            marginTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            '@media (min-width: 500px)': {
                justifyContent: 'start',
            },
        }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="color"
                    type="radio"
                    name="sort"
                    onChange={(e) => onChange(e.target.name, e.target.id)}
                />
                <label htmlFor="color" style={{ marginLeft: '4px' }}>
                    Color
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="name"
                    type="radio"
                    name="sort"
                    onChange={(e) => onChange(e.target.name, e.target.id)}
                />
                <label htmlFor="name" style={{ marginLeft: '4px' }}>
                    Name
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="types"
                    type="radio"
                    name="sort"
                    onChange={(e) => onChange(e.target.name, e.target.id)}
                />
                <label htmlFor="types" style={{ marginLeft: '4px' }}>
                    Types
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="age"
                    type="radio"
                    name="sort"
                    onChange={(e) => onChange(e.target.name, e.target.id)}
                />
                <label htmlFor="age" style={{ marginLeft: '4px' }}>
                    Age(?)
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="cost"
                    type="radio"
                    name="sort"
                    onChange={(e) => onChange(e.target.name, e.target.id)}
                />
                <label htmlFor="cost" style={{ marginLeft: '4px' }}>
                    Mana Cost
                </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <input
                    id="lastCube"
                    type="radio"
                    name="sort"
                    onChange={(e) => onChange(e.target.name, e.target.id)}
                />
                <label htmlFor="lastCube" style={{ marginLeft: '4px' }}>
                    Last Cube
                </label>
            </div>
        </div>
    </div>
);


Sorter.propTypes = {
    onChange: PropTypes.func.isRequired,
    isCurrentCube: PropTypes.bool,
};

Sorter.defaultProps = {
    isCurrentCube: false,
};

const mapStateToProps = (state) => ({
    sorter: state.sorter,
});
const mapDispatchToProps = (dispatch) => ({
    onChange: (sort, value) => dispatch({
        type: 'SET_SORTER',
        data: {
            [sort]: value,
        },
    }),
});

const ConnectedSorter = connect(mapStateToProps, mapDispatchToProps)(Radium(Sorter));

export default ConnectedSorter;
