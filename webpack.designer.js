const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const runtimeConfig = require("./webpack.runtime.js");


const designerConfig = {
    mode: "none",
    target: "web",
    entry: {
        "editors/scripts/paperbits": ["./src/startup.design.ts"],
        "editors/styles/paperbits": [`./src/themes/designer/styles/styles.scss`],
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "./dist/designer")
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            url: (url) => /\/icon-.*\.svg$/.test(url)
                        }
                    },
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
                loader: "html-loader",
                options: {
                    esModule: true,
                    minimize: {
                        removeComments: false,
                        collapseWhitespace: false
                    }
                }
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            },
            {
                test: /\.liquid$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: `./src/themes/designer/assets/index.html`, to: "index.html" },
                { from: `./src/themes/designer/styles/fonts`, to: "editors/styles/fonts" },
                { from: `./src/libraries`, to: "data" },
                { from: `./scripts.v3/data.json`, to: "editors/themes/default.json" },
                { from: "./src/config.design.json", to: "config.json" }
            ]
        })
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};

module.exports = [runtimeConfig(true), designerConfig]