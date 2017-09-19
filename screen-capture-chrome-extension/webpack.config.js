const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: {
        content: path.join(__dirname, 'src/content.ts'),
        background: path.join(__dirname, 'src/background.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist/'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            exclude: /node_modules/,
            test: /\.tsx?$/,
            loader: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        // minify
        // new webpack.optimize.UglifyJsPlugin()
    ]
};
