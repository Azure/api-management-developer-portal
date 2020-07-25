const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const designerConfig = require("./webpack.designer.js");
const publisherConfig = require("./webpack.publisher.js");


const productionConfig = {
    mode: "production",
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: false,
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

module.exports = []
    .concat(designerConfig, publisherConfig)
    .map(x => merge(x, productionConfig));