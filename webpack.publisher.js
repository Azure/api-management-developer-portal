const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const runtimeConfig = require("./webpack.runtime");
const getArmToken = require("./auth/authenticator");
const config = require("./src/config.publish.json");

const publisherRuntimeConfig = merge(runtimeConfig, {
    entry: { "styles/theme": ["./src/themes/website/styles/styles.scss"] },
    output: { "path": path.resolve(__dirname, "dist/publisher/assets") }
});

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

    const publisherConfig = {
        mode: "development",
        target: "node",
        ignoreWarnings: [
            {
                module: /@paperbits[\\/]react[\\/]bindings[\\/]reactComponentBinder\.ts$/,
                message: /export 'render' \(imported as 'ReactDOM'\) was not found in 'react-dom'/
            },
            {
                module: /@paperbits[\\/]react[\\/]customElements\.ts$/,
                message: /export 'render' \(imported as 'ReactDOM'\) was not found in 'react-dom'/
            }
        ],
        node: {
            __dirname: false,
            __filename: false,
        },
        entry: {
            "index": ["./src/startup.publish.ts"]
        },
        output: {
            filename: "./[name].js",
            path: path.resolve(__dirname, "dist/publisher")
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: "css-loader", options: { url: false } },
                        { loader: "postcss-loader" },
                        {
                            loader: "sass-loader",
                            options: {
                                sassOptions: {
                                    silenceDeprecations: ["import", "global-builtin", "color-functions"]
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: {
                        allowTsInNodeModules: true,
                        reportFiles: ["src/**/*.ts", "src/**/*.tsx"]
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
                    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                    loader: "url-loader",
                    options: {
                        limit: 10000
                    }
                },
                {
                    test: /\.(raw|liquid)$/,
                    loader: "raw-loader"
                }
            ]
        },
        plugins: [
            new webpack.IgnorePlugin({ resourceRegExp: /canvas/ }, { resourceRegExp: /jsdom$/ }),
            new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: `./src/config.publish.json`, to: `config.json` },
                    { from: `./src/config.runtime.json`, to: `assets/config.json` },
                    { from: `./templates/default.json`, to: "editors/templates/default.json" },
                    { from: `./templates/default-old.json`, to: "editors/templates/default-old.json" }
                ]
            }),
            new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
            new webpack.DefinePlugin({ 'ARM_TOKEN': JSON.stringify(armToken) })
        ],
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"],
            alias: {
                react: path.resolve(__dirname, "node_modules/react"),
                "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
                "react/jsx-runtime": require.resolve("react/jsx-runtime"),
                "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime")
            },
            fallback: {
                buffer: require.resolve("buffer"),
                stream: require.resolve("stream-browserify"),
                querystring: require.resolve("querystring-es3")
            }
        }
    };


    return publisherConfig;
}

module.exports = async () => {
    const publisherConfig = await generateWebpackConfig();
    return [publisherConfig, publisherRuntimeConfig];
};