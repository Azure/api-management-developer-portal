const webpack = require("webpack");
const publisherConfig = require("./webpack.publisher");


let staticData = publisherConfig;

staticData.publisherConfig.plugins.push(new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("staticData")
}));

staticData.publisherRuntimeConfig.plugins.push(new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("staticData")
}));

module.exports = {
    default: [staticData.publisherConfig, staticData.publisherRuntimeConfig]
}