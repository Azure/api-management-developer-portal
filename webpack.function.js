const webpack = require("webpack");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const themeConfig = require("./webpack.theme");

const functionConfig = {
    mode: "development",
    target: "node",
    node: {
        __dirname: false,
        __filename: false,
    },
    entry: {
        "publish/index": ["./examples/function/publish/index.ts"],
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "dist/function"),
        library: "function",
        libraryTarget: "commonjs2"
    },
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
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
        new CopyWebpackPlugin([
            { from: `./examples/function`, to: `./` },
            { from: `./src/config.publish.json`, to: `./publish/config.json` },
        ]),
        new webpack.DefinePlugin({	
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};

themeConfig.output.path = path.resolve(__dirname, "dist/function/publish"),

module.exports = [ functionConfig, themeConfig ];