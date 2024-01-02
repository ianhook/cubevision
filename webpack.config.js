const path = require('path');

const config = {
    entry: './ui/index.js',
    mode: process.env.NODE_ENV,
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { test: /\.jsx?$/, use: 'babel-loader' },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            'react-dom$': 'react-dom/profiling',
            'scheduler/tracing': 'scheduler/tracing-profiling',
        },
    },
};

if (process.env.NODE_ENV !== 'production') {
    config.devtool = 'eval-source-map';
}

module.exports = config;
