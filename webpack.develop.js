const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const asyncDesignerConfig = require("./webpack.designer.arm.js");

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

module.exports = async () => {
    const resolvedDesignerConfig = await asyncDesignerConfig();
    return [
      merge(resolvedDesignerConfig.designerConfig, developmentConfig),
      resolvedDesignerConfig.designerRuntimeConfig
    ];
};