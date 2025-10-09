const { merge } = require("webpack-merge");
const webpack = require("webpack");
const {
    designerConfig,
    designerRuntimeConfig,
} = require("./webpack.designer.js");
const { getArmToken } = require("./auth/arm-auth");

module.exports = async (env) => {
    const armToken = await getArmToken({});
    const patterns = designerConfig.plugins[1].patterns;
    const rules = designerConfig.module.rules;

    patterns.push({
        from: `./src/config.design.json`,
        to: `./editor-config.json`,
    });

    for (let i = 0; i < rules.length; i++) {
        if (rules[i].test.source === "\\.tsx?$") {
            rules[i].use = [
                {
                    loader: "ts-loader",
                    options: { allowTsInNodeModules: true },
                }
            ];
        }
    }

    const developmentConfig = {
        mode: "development",
        devtool: "inline-source-map",
        devServer: {
            hot: true,
            historyApiFallback: true,
        },
    };

    const resultDesignerConfig = merge(designerConfig, developmentConfig);

    // Comment out if you need to sumulate SKUv2 editor sign-in flow
    resultDesignerConfig.plugins.push(
        new webpack.DefinePlugin({
            "ARM_TOKEN": JSON.stringify(armToken),
        })
    );

    return [resultDesignerConfig, designerRuntimeConfig];
};
