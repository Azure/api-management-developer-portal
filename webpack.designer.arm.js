const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const runtimeConfig = require("./webpack.runtime");
const packageJson = require("./package.json");
const { getArmToken } = require("./auth/arm-auth");
const config = require("./src/config.design.json");

async function generateWebpackConfig() {
    const tokenOptions = {};
    if (config.tenantId) {
        console.log(`Using tenantId: ${config.tenantId}`);
        tokenOptions.tenantId = config.tenantId;
    }
    if (config.clientId) {
        console.log(`Using clientId: ${config.clientId}`);
        tokenOptions.clientId = config.clientId;
    }
    const armToken = await getArmToken(tokenOptions);

    const designerConfig = {
        mode: "development",
        target: "web",
        entry: {
            "editors/scripts/paperbits": ["./src/startup.design.ts"],
            "editors/styles/paperbits": [`./src/themes/designer/styles/styles.scss`],
        },
        output: {
            filename: "./[name].js",
            path: path.resolve(__dirname, "./dist/designer")
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: { url: { filter: (url) => /\/icon-.*\.svg$/.test(url) } }
                        },
                        { loader: "postcss-loader" },
                        { loader: "sass-loader" }
                    ]
                },
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: {
                        allowTsInNodeModules: true
                    }
                },
                {
                    test: /\.html$/,
                    loader: "html-loader",
                    options: {
                        esModule: true,
                        sources: false,
                        minimize: {
                            removeComments: false,
                            collapseWhitespace: false
                        }
                    }
                },
                {
                    test: /\.(svg)$/i,
                    type: "asset/inline"
                },
                {
                    test: /\.(raw|liquid)$/,
                    loader: "raw-loader"
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: `./src/libraries`, to: "data" },
                    { from: `./src/config.design.json`, to: `./config.json` },
                    { from: `./src/themes/designer/assets/index.html`, to: "index.html" },
                    { from: `./src/themes/designer/styles/fonts`, to: "editors/styles/fonts" },
                    { from: `./templates/default.json`, to: "editors/templates/default.json" },
                    { from: `./templates/default-old.json`, to: "editors/templates/default-old.json" }
                ]
            }),
            new webpack.ProvidePlugin({ Buffer: ["buffer", "Buffer"] }),
            new webpack.DefinePlugin({
                "process.env.VERSION": JSON.stringify(packageJson.version),
                "process.env.ARM_TOKEN": JSON.stringify(armToken)
            })
        ],
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"],
            fallback: {
                buffer: require.resolve("buffer"),
                stream: require.resolve("stream-browserify"),
                querystring: require.resolve("querystring-es3"),
                crypto: false
            }
        }
    };

    const designerRuntimeConfig = merge(runtimeConfig, {
        entry: { "styles/theme": `./src/themes/website/styles/styles.design.scss` },
        output: { "path": path.resolve(__dirname, "dist/designer") }
    });

    return {
        default: [designerConfig, designerRuntimeConfig],
        designerRuntimeConfig,
        designerConfig
    };
}

// Export the async function directly
module.exports = async () => generateWebpackConfig();