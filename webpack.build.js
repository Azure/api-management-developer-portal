const webpack = require("webpack");
const merge = require("webpack-merge");
const designerConfig = require("./webpack.designer.js");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(designerConfig, {
    mode: "production",
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: false,
                terserOptions: {
                    mangle: false,
                    output: {
                        comments: false,
                    }
                }
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            { from: `./src/config.design.json`, to: `./config.json` }
        ]),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ]
});