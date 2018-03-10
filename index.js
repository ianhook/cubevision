const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const httpsRedirect = require('express-https-redirect');

const cubes = require('./backend/cubes');
const cards = require('./backend/cards');

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use('/', httpsRedirect());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, './public')));

app.use('/api/cube', cubes);
app.use('/api/card', cards);

app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, './public/index.html'));
});

app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});
