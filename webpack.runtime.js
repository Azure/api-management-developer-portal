const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");


const runtimeConfig = {
    mode: "development",
    target: "web",
    entry: {
        "scripts/theme": ["./src/startup.runtime.ts"]
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "dist/runtime")
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: { url: { filter: (url) => /\/icon-.*\.svg$/.test(url) } }
                    },
                    { loader: "postcss-loader" },
                    { loader: "sass-loader" }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    allowTsInNodeModules: true
                }
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                options: {
                    esModule: true,
                    sources: false,
                    minimize: {
                        removeComments: false,
                        collapseWhitespace: false
                    }
                }
            },
            {
                test: /\.(svg)$/i,
                type: "asset/inline"
            },
            {
                test: /\.liquid$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
        new CopyWebpackPlugin({
            patterns: [
                { from: `./src/themes/website/styles/fonts`, to: "styles/fonts" },
                { from: `node_modules/monaco-editor/min/vs`, to: `assets/monaco-editor/vs` },
                { from: `./src/themes/website/assets` }
            ]
        }),
        new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })
    ],
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".html", ".scss"],
        fallback: {
            buffer: require.resolve("buffer"),
            stream: require.resolve("stream-browserify"),
            querystring: require.resolve("querystring-es3")
        }
    }
}

module.exports = runtimeConfig;