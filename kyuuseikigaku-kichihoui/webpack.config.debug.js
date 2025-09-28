var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry: {
        ban: "./src/js/bans/BanMain.ts",
      //  map: "./src/js/map/MapMain.ts"
    },
    output: {
        path: __dirname,
        publicPath: '/',
        filename: "./js/[name].js"
    },
    devServer: {
        contentBase: path.join(__dirname, './src/'),
        port: 3001,
        proxy: {
            '/*.php': {
                target: 'http://localhost:3001',
                pathRewrite: { "php": "html" }
            },
            '/qsei': {
                target: 'http://localhost:3001',
                pathRewrite: { "^/qsei": "" }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loaders: ['ts-loader']
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
                exclude: [/node_modules/]
            },
            {
                test: /\.png$/,
                loader: 'url-loader',
                exclude: [/node_modules/]
            },
            {
                test: /\.html$/,
                loader: 'html-loader?minimize=false'
            },		
        ]
    },
    devtool: 'source-map',
    mode: "development",
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "windows.jQuery": "jquery",

        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    resolve: {
        alias: {
            "jquery": __dirname + "/node_modules/jquery/dist/jquery.min.js",
            "jquery-ui": __dirname + "/node_modules/jquery-ui-dist/jquery-ui.min.js",
            "d3": __dirname + "/node_modules/d3/dist/d3.min.js",
            "vue$": __dirname + "/node_modules/vue/dist/vue.esm.js"
        },
        extensions: ['.js', '.ts', '.html']
    }
};