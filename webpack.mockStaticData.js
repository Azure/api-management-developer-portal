const {mockStaticDataEnvironment, staticDataEnvironment} = require("./environmentConstants")
const webpack = require("webpack");
const publisherConfig = require("./webpack.publisher");
const CopyWebpackPlugin = require("copy-webpack-plugin");


let staticData = publisherConfig;

staticData.publisherConfig.mode = "none";
staticData.publisherConfig.plugins.push(new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(mockStaticDataEnvironment)
}));

staticData.publisherRuntimeConfig.mode = "none";

staticData.publisherConfig.mode = "none";
staticData.publisherConfig.plugins.push(new CopyWebpackPlugin({
    patterns: [
        { from: `./src/config.validate.publish.json`, to: `config.json`, force: true },
        { from: `./src/config.validate.runtime.json`, to: `assets/config.json` , force: true},
    ]
}));


staticData.publisherRuntimeConfig.plugins.push(new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(mockStaticDataEnvironment),
}));

module.exports = {
    default: [staticData.publisherConfig, staticData.publisherRuntimeConfig]
}