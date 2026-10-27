require("ts-node").register({
    files: true,
    ignore: ["node_modules\/(?!@paperbits)"],
    compilerOptions: {
        "module": "commonjs"
    }
});