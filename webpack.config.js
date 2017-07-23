const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const PurifyCSSPlugin = require('purifycss-webpack');
const CompressionPlugin = require("compression-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const glob = require('glob-all');
module.exports = {
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.html$|\.css$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        new ExtractTextPlugin('styles.css'),
        // new PurifyCSSPlugin({
        //     // Give paths to parse for rules. These should be absolute!
        //     paths: glob.sync(path.join(__dirname, '/dist/static/*.html')),
        // }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /styles.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {discardComments: {removeAll: true}},
            canPrint: true
        }),
    ],
    context: path.resolve(__dirname, './src'),
    entry: {
        app: ['./js/main.js', './js/draw.js'],
        "stoopid-worker": './js/stoopid-worker',
        // colorPicker: ['colorPicker/colors.js', 'colorPicker/colorPicker.data.js', 'colorPicker/colorPicker.js', 'colorPicker/javascript_implementation/jsColor', 'colorPicker/javascript_implementation/jsColorPicker.min.js'],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
    },

    module: {
        rules: [
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader", "less-loader"]
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
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