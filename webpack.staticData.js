const { staticDataEnvironment } = require("./environmentConstants");
const webpack = require("webpack");
const getPublisherConfigs = require("./webpack.publisher");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const staticDataCopyPatterns = [
    { from: `./templates/default-old.json`, to: "editors/templates/default.json" },
    { from: `./tests/mocks/defaultStaticData.json`, to: "tests/mocks/defaultStaticData.json" }
];

module.exports = async () => {
    const [publisherConfig, publisherRuntimeConfig] = await getPublisherConfigs({ skipArmToken: true });

    publisherConfig.mode = "none";
    publisherConfig.plugins.push(new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(staticDataEnvironment)
    }));
    publisherConfig.plugins.push(new CopyWebpackPlugin({
        patterns: staticDataCopyPatterns
    }));

    publisherRuntimeConfig.mode = "none";
    publisherRuntimeConfig.plugins.push(new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(staticDataEnvironment),
        "process.env.ACCESS_TOKEN": "\"\"",
    }));
    publisherRuntimeConfig.plugins.push(new CopyWebpackPlugin({
        patterns: staticDataCopyPatterns
    }));

    return [publisherConfig, publisherRuntimeConfig];
};