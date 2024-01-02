import React from 'react';
import {
    BrowserRouter,
    Route,
    Routes,
    Link,
} from 'react-router-dom';

import Cubes from './Cubes';
import Cube from './Cube';
import Updater from './Updater';
import Missing from './Missing';
import AcquireCard from './AcquireCard';
import { OUR_CUBE, OUR_BINDER, styles } from './consts';

const CubeRouter = () => (
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
                <li style={styles.hideOnSmall}><Link to={`/cube/${OUR_BINDER}`}>Current Binder</Link></li>
                <li style={styles.hideOnSmall}><Link to="/cubes">Cubes</Link></li>
                <li><Link to="/missing">Missing</Link></li>
                <li style={styles.hideOnSmall}><Link to="/update">Update</Link></li>
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

export default CubeRouter;
