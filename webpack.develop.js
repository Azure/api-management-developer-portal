const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { designerConfig, designerRuntimeConfig } = require("./webpack.designer.js");

const developmentConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        hot: true,
        historyApiFallback: true
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: `./src/config.design.json`, to: `./config.json` }
            ]
        })
    ]
}

module.exports = [
    merge(designerConfig, developmentConfig),
    designerRuntimeConfig
]