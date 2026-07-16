const { mockStaticDataEnvironment } = require("./environmentConstants");
const webpack = require("webpack");
const getPublisherConfigs = require("./webpack.publisher");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = async () => {
    const [publisherConfig, publisherRuntimeConfig] = await getPublisherConfigs({ skipArmToken: true });

    publisherConfig.mode = "none";
    publisherConfig.plugins.push(new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(mockStaticDataEnvironment)
    }));
    publisherConfig.plugins.push(new CopyWebpackPlugin({
        patterns: [
            { from: `./src/config.validate.publish.json`, to: `config.json`, force: true },
            { from: `./src/config.validate.runtime.json`, to: `assets/config.json`, force: true },
        ]
    }));

    publisherRuntimeConfig.mode = "none";
    publisherRuntimeConfig.plugins.push(new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(mockStaticDataEnvironment),
    }));

    return [publisherConfig, publisherRuntimeConfig];
};