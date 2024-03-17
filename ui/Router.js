import React, { useState, useEffect } from 'react';
import {
    BrowserRouter,
    Route,
    Routes,
    Link,
} from 'react-router-dom';

import Cubes from './Cubes.js';
import Cube from './Cube.js';
import Updater from './Updater.js';
import Missing from './Missing.js';
import AcquireCard from './AcquireCard.js';
import { OUR_CUBE, OUR_BINDER, styles } from './consts.js';

const CubeRouter = () => {
    const [matches, setMatches] = useState(
        window.matchMedia("(max-width: 750px)").matches
    );
    
    useEffect(() => {
        window
        .matchMedia("(max-width: 750px)")
        .addEventListener('change', e => setMatches( e.matches ));
    }, []);

    const style = {
        display: matches ? 'none' : 'list-item',
    };

    return (
        <BrowserRouter>
            <div>
                <ul style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    listStyleType: 'none',
                    paddingLeft: 8,
                }}
                >
                    <li><Link to={`/cube/${OUR_CUBE}`}>Our Cube</Link></li>
                    <li style={style}><Link to={`/cube/${OUR_BINDER}`}>Current Binder</Link></li>
                    <li style={style}><Link to="/cubes">Cubes</Link></li>
                    <li><Link to="/missing">Missing</Link></li>
                    <li style={style}><Link to="/update">Update</Link></li>
                    <li><Link to="/acquire">Acquire</Link></li>
                </ul>

                <hr />

                <Routes>
                    <Route path="/cubes" element={<Cubes />} />
                    <Route path="/cube/:cubeId" element={<Cube />} />
                    <Route path="/missing" element={<Missing />} />
                    <Route path="/update" element={<Updater />} />
                    <Route path="/acquire" element={<AcquireCard />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default CubeRouter;
