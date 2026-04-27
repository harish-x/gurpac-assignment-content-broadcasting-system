import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import prettier from "eslint-plugin-prettier";

export default defineConfig([
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        ignores: ["node_modules/**", "dist/**", "build/**"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: true,
            },
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
            ecmaVersion: 2022,
            sourceType: "module",
        },

        plugins: {
            "@typescript-eslint": tseslint,
            prettier,
        },

        rules: {
            "prettier/prettier": "error",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "warn",

            "no-console": "off",
            "no-var": "error",
            "prefer-const": "error",
            eqeqeq: "error",
        },
    },
]);
