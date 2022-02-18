const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const runtimeConfig = require("./webpack.runtime");


const designerConfig = {
    mode: "development",
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
                test: /\.(raw|liquid)$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: `./src/libraries`, to: "data" },
                { from: `./src/config.design.json`, to: `./config.json` },
                { from: `./src/themes/designer/assets/index.html`, to: "index.html" },
                { from: `./src/themes/designer/styles/fonts`, to: "editors/styles/fonts" },
                { from: `./src/libraries`, to: "data" },
                { from: "./src/config.design.json", to: "config.json" }
            ]
        }),
        new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"],
        fallback: {
            buffer: require.resolve("buffer"),
            stream: require.resolve("stream-browserify"),
            querystring: require.resolve("querystring-es3")
        }
    }
};

const designerRuntimeConfig = merge(runtimeConfig, {
    entry: { "styles/theme": `./src/themes/website/styles/styles.design.scss` },
    output: { "path": path.resolve(__dirname, "dist/designer") }
});

module.exports = {
    default: [designerConfig, designerRuntimeConfig],
    designerRuntimeConfig,
    designerConfig
};