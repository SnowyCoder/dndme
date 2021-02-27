const path = require('path');

const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const DotEnv = require('dotenv-webpack');

const webpack = require('webpack');

const gitRevisionPlugin = new GitRevisionPlugin();

const config = {
    entry: './src/app/index.ts',
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
                    }
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                use: 'file-loader',
            },
            {
                test: /\.(eot|woff|woff2|ttf)$/,
                use: 'file-loader',
                /*
                use: [
                    'file-loader',
                    {
                        loader: ,
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                        }
                    }
                ]*/
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            },
        ],
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
    },
    resolve: {
        extensions: ['.ts', '.js', '.json', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',

            'App': path.resolve(__dirname, 'src/app/'),
            'Public': path.resolve(__dirname, 'src/public/'),
        }
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    cache: {
        type: 'filesystem',
        cacheLocation: path.resolve(__dirname, '.test_cache')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "DrawNDice",
            favicon: "src/public/favicon.ico",
            template: "src/public/index.html"
        }),
        new VueLoaderPlugin(),
        new DotEnv({
            path: './.env',
            safe: true
        }),
        gitRevisionPlugin,
        new webpack.ProvidePlugin({
            PIXI: 'pixi.js',
        }),
        new webpack.DefinePlugin({
            __COMMIT_HASH__: JSON.stringify(gitRevisionPlugin.version()),
        })
    ]
};

module.exports = (env, argv) => {
    if (argv.mode === "development") {
        // https://webpack.js.org/configuration/devtool/
        config.devtool = "inline-source-map";
    }
    return config;
};
