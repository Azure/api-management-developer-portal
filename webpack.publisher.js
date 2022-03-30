const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const runtimeConfig = require("./webpack.runtime");


const publisherConfig = {
    mode: "development",
    target: "node",
    node: {
        __dirname: false,
        __filename: false,
    },
    entry: {
        "index": ["./src/startup.publish.ts"]
    },    
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "dist/publisher")
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
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            },
            {
                test: /\.(raw|liquid)$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin({ resourceRegExp: /canvas/ }, { resourceRegExp: /jsdom$/ }),
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
        new CopyWebpackPlugin({
            patterns: [
                { from: `./src/config.publish.json`, to: `config.json` },
                { from: `./src/config.runtime.json`, to: `assets/config.json` },
                { from: `./templates/default.json`, to: "editors/templates/default.json" }
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

const publisherRuntimeConfig = merge(runtimeConfig, {
    entry: { "styles/theme": `./src/themes/website/styles/styles.scss` },
    output: { "path": path.resolve(__dirname, "dist/publisher/assets") }
});

module.exports = {
    default: [publisherConfig, publisherRuntimeConfig],
    publisherConfig,
    publisherRuntimeConfig
}