require("ts-node").register({
    ignore: ["node_modules\/(?!@paperbits)"],
    compilerOptions: {
        "module": "commonjs"
    }
});