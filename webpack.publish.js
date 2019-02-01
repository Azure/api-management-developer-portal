const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const themeConfig = require("./webpack.theme");


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
                    { loader: "css-loader", options: { url: false, minimize: true, sourceMap: true } },
                    { loader: "postcss-loader", options: { sourceMap: true, options: { plugins: () => [autoprefixer] } } },
                    { loader: "sass-loader", options: { sourceMap: true } }
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
        new CleanWebpackPlugin(["dist/publisher"]),
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
        new CopyWebpackPlugin([
            { from: `./src/config.publish.json`, to: `./config.json` },
            { from: `./src/config.runtime.json`, to: `./assets/config.json` }
        ])
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    sourceMap: false,
                    mangle: false,
                    output: {
                        comments: false,
                    }
                }
            })
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};


themeConfig.output.path = path.resolve(__dirname, "dist/publisher");

module.exports = [publisherConfig, themeConfig];