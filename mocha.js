require("ts-node").register({
    transpileOnly: true,
    ignore: ["node_modules\/(?!@paperbits)"],
    compilerOptions: {
        "module": "commonjs",
        "rootDir": ".",
        "incremental": false,
        "composite": false,
        "sourceMap": false
    }
});