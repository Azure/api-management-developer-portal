const path = require("path");
// const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    target: "web",
    mode: "development",
    // mode: "production",
    // optimization: {
    //     minimizer: [
    //         new TerserPlugin({
    //             sourceMap: false,
    //             terserOptions: {
    //                 mangle: false,
    //                 output: {
    //                     comments: false,
    //                 }
    //             }
    //         })
    //     ]
    // },
    entry: {
        "assets/scripts/theme": ["./src/startup.runtime.ts"]
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
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
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};