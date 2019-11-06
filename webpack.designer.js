const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {
    target: "web",
    devtool: "inline-source-map",
    entry: {
        "editors/scripts/paperbits": ["./src/startup.design.ts"],
        "editors/styles/paperbits": [`./src/themes/designer/styles/paperbits.scss`],
        "scripts/theme": ["./src/startup.runtime.ts"],
        "styles/theme": [`./src/themes/website/styles/styles.design.scss`]
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
                    { loader: "css-loader", options: { url: false } },
                    { loader: "postcss-loader" },
                    { loader: "sass-loader" }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                test: /\.html$/,
                loader: "html-loader?exportAsEs6Default"
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: "url-loader?limit=100000"
            },
            {
                test: /\.liquid$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin([
            { from: `./src/themes/designer/assets/index.html`, to: "index.html" },
            { from: `./src/themes/designer/styles/fonts`, to: "editors/styles/fonts" },
            { from: `./src/themes/website/assets` },
            { from: `./src/themes/website/styles/fonts`, to: "styles/fonts" },
            { from: `./js/HipObject.js`, to: "scripts/js" },
            { from: `./scripts/data.json`, to: "editors/themes/default.json" }
        ])
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};