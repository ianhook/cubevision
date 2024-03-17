import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import httpsRedirect from 'express-https-redirect';

import cubes from './backend/cubes.js';
import cards from './backend/cards.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
};

const app = express();

app.set('port', (process.env.PORT || 5001));

// app.use('/', httpsRedirect());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// setup CORS
app.use(allowCrossDomain);

app.use(express.static(path.resolve(__dirname, './public')));

app.use('/api/cube', cubes);
app.use('/api/card', cards);

app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, './public/index.html'));
});

app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});
