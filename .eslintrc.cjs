module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', "plugin:import/typescript"],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', "unused-imports"],
    root: true,
    rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
    },
    settings: {
        "import/resolver": {
            typescript: true,
            node: true
        }
    }
}
