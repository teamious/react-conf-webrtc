var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


// NOTE(andrews): Set default environment to "development".
const NODE_ENV = process.env.NODE_ENV || 'development';

// NOTE(andrews): Use config files setting environment variables.
// This build system looks for env variables by each location
// and stops once a value is found:
//
// 1. Process (eg. LOCALE=en npm start)
// 2. Environment specific file (eg. config/development.js)
// 3. Default file (eg. config/default.js)

// NOTE(andrews): By default, this only looks up ENV variables
// for the environment you are trying to build. It uses
// the keys within the environment's congif file to do
// the lookup.
const config = require('./src/config/' + NODE_ENV + '.js');
const defaultConfig = require('./src/config/default.js');

// NOTE(andrews): html-webpack-plugin creates an index.html in dist.
var HtmlWebpackPlugin = require('html-webpack-plugin');

var envConfig = {}
for (var prop in config) {
    envConfig[prop] = JSON.stringify(process.env[prop] || config[prop] || defaultConfig[prop]);
}

envConfig['NODE_ENV'] = JSON.stringify(NODE_ENV);

// NOTE(andrews): Eliminate double quoted string for FAVICON_URL.
var faviconUrl = JSON.parse(envConfig['FAVICON_URL'])

var alias = {
    'react': path.resolve(__dirname, 'node_modules', 'react'),
}

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]-[hash].js',
        publicPath: '',
    },

    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        modules: [
            'node_modules'
        ],
        alias: alias,
    },

    devServer: {
        https: true,
        host: '0.0.0.0',
        port: 8080,
        disableHostCheck: true,
        historyApiFallback: {
            index: '/',
        },
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
            },

            {
                test: /\.(s)css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            },

            {
                test: /\.js$/,
                loader: 'source-map-loader',
                enforce: 'pre',
            },
        ],
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),

        new webpack.DefinePlugin({
            'process.env': envConfig,
        }),

        new HtmlWebpackPlugin({
            template: 'index.html',
            inject: 'body',
            faviconUrl: faviconUrl,
        }),

        new ExtractTextPlugin('style-[hash].css'),
    ]
};
