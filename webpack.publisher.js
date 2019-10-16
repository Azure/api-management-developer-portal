const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const runtimeConfig = require("./webpack.runtime");

const websiteTheme = "apim";

const publisherConfig = {
    mode: "development",
    devtool: "inline-source-map",
    target: "node",
    node: {
        __dirname: false,
        __filename: false,
    },
    entry: {
        "index": ["./src/startup.publish.ts"],
        "assets/styles/theme": [`./src/themes/${websiteTheme}/styles/styles.scss`]
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "dist/publisher"),
        library: "publisher",
        libraryTarget: "commonjs2"
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: "css-loader", options: { url: false } },
                    { loader: "postcss-loader" },
                    { loader: "sass-loader" }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                test: /\.html$/,
                loader: "html-loader?exportAsEs6Default"
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: "url-loader?limit=100000"
            },
            {
                test: /\.liquid$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
        new CopyWebpackPlugin([
            { from: `./src/config.publish.json`, to: `config.json` },
            { from: `./src/config.runtime.json`, to: `assets/config.json` },
            { from: `./src/themes/${websiteTheme}/styles/fonts`, to: "assets/styles/fonts" },
            { from: `./js/HipObject.js`, to: "assets/scripts/js" }
        ])
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};

runtimeConfig.output.path = path.resolve(__dirname, "dist/publisher");

module.exports = [runtimeConfig, publisherConfig];