var webpack = require('webpack');
module.exports = {
    entry: {
        ban: "./src/js/bans/BanMain.ts",
        //map: "./src/js/map/MapMain.ts"
    },
    output: {
        path: __dirname,
        filename: "./release/js/[name].js"
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
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "windows.jQuery": "jquery"
        })
    ],
    mode: "production",
    resolve: {
        alias: {
            "jquery": __dirname + "/node_modules/jquery/dist/jquery.min.js",
            "jquery-ui": __dirname + "/node_modules/jquery-ui-dist/jquery-ui.min.js",
            "d3": __dirname + "/node_modules/d3/dist/d3.min.js",
             "vue$": __dirname + "/node_modules/vue/dist/vue.esm.js"
        },
        extensions: ['.js', '.ts','.html']
    },
};