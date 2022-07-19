module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "no-extra-boolean-cast": "off",
        "no-useless-escape": "off",
        "@typescript-eslint/quotes": [
            "warn",
            "double",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ]
    }
};