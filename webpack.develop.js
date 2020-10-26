const webpack = require("webpack");
const { merge } = require("webpack-merge");
const designerConfig = require("./webpack.designer.js");


const developmentConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        hot: true,
        historyApiFallback: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}

module.exports = []
    .concat(designerConfig)
    .map(x => merge(x, developmentConfig));