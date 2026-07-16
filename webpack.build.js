const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const { designerConfig, designerRuntimeConfig } = require("./webpack.designer.js");
const getPublisherConfigs = require("./webpack.publisher.js");


const productionConfig = {
    mode: "production",
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: false,
                    output: {
                        comments: false
                    }
                }
            })
        ]
    }
}

module.exports = async () => {
    const [publisherConfig, publisherRuntimeConfig] = await getPublisherConfigs();

    return [
        designerConfig,
        designerRuntimeConfig,
        publisherConfig,
        publisherRuntimeConfig
    ].map(x => merge(x, productionConfig));
};