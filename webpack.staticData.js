const {staticDataEnvironment} = require("./environmentConstants")
const webpack = require("webpack");
const publisherConfig = require("./webpack.publisher");
const CopyWebpackPlugin = require("copy-webpack-plugin");


let staticData = publisherConfig;

staticData.publisherConfig.mode = "none";
staticData.publisherConfig.plugins.push(new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(staticDataEnvironment)
}));
staticData.publisherConfig.plugins.push(new CopyWebpackPlugin({
    patterns: [
        { from: `./templates/default.json`, to: "editors/templates/default.json" },
        { from: `./tests/mocks/defaultStaticData.json`, to: "tests/mocks/defaultStaticData.json" }
    ]
}));

staticData.publisherRuntimeConfig.mode = "none";
staticData.publisherRuntimeConfig.plugins.push(new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(staticDataEnvironment),
    "process.env.ACCESS_TOKEN": "\"\"",
}));

staticData.publisherRuntimeConfig.plugins.push(new CopyWebpackPlugin({
    patterns: [
        { from: `./templates/default.json`, to: "editors/templates/default.json" },
        { from: `./tests/mocks/defaultStaticData.json`, to: "tests/mocks/defaultStaticData.json" }
    ]
}));

module.exports = {
    default: [staticData.publisherConfig, staticData.publisherRuntimeConfig]
}