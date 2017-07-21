const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        })
    ],
    context: path.resolve(__dirname, './src'),
    entry: {
        app: ['./js/main.js', './js/draw.js'],
        "stoopid-worker": './js/stoopid-worker'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
    },

    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/, query: {presets: ['es2015']}
            },
            {
                test: /\.(jpg|jpeg|gif|png)$/,
                use: 'url-loader',
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: 'url-loader',
            }
        ],
    }
};