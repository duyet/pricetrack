module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parser": "@babel/eslint-parser",
    "parserOptions": {
        "ecmaVersion": 2022,
        "sourceType": "module",
        "babelOptions": {
            "requireConfigFile": false
        }
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-console": 0
    }
};
