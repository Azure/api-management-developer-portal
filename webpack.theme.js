const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const websiteTheme = "apim";

module.exports = {
    mode: "development",
    target: "web",
    entry: {
        "assets/styles/theme": [`./src/themes/${websiteTheme}/styles/styles.scss`],
        "assets/scripts/theme": ["./src/startup.runtime.ts"]
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "dist"),
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
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
        new CopyWebpackPlugin([
            { from: `./src/config.runtime.json`, to: `./assets/config.json` },
            { from: `./src/themes/${websiteTheme}/styles/fonts`, to: "styles/fonts" },
        ])
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};