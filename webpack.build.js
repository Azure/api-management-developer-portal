const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const { designerConfig, designerRuntimeConfig } = require("./webpack.designer.js");
const { publisherConfig, publisherRuntimeConfig } = require("./webpack.publisher.js");


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

module.exports = [
    designerConfig,
    designerRuntimeConfig,
    publisherConfig,
    publisherRuntimeConfig
].map(x => merge(x, productionConfig));