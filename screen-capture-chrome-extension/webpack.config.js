const webpack = require("webpack");
const path = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');
const crxWebpackPlugin = require('crx-webpack-plugin');

module.exports = {
    entry: {
        content: path.join(__dirname, 'src/content.ts'),
        background: path.join(__dirname, 'src/background.ts'),
        message: path.join(__dirname, 'src/message.ts'),
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

        new copyWebpackPlugin([
            { from: 'src/assets' }
        ]),

        new crxWebpackPlugin({
            keyFile: 'teamious.screen.pem',
            contentPath: 'dist',
            outputPath: '../docs/ext',
            name: 'teamious.screen.chrome'
        })
    ]
};
