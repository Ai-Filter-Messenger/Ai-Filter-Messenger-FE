import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
  {
    root: true,
    files: ["**/*.{ts,tsx}"],
    ignores: ["dist"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser, // TypeScript를 위한 파서 설정
    },
    extends: [
      js.configs.recommended,
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended", // prettier 관련 설정 추가
    ],
    env: {
      browser: true, // 브라우저 환경에서 동작하도록 설정
      es2020: true, // ECMAScript 2020 지원
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint,
      prettier, // prettier 플러그인 추가
    },
    rules: {
      // React 컴포넌트만 export하도록 경고
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // 타입 임포트를 일관되게 사용하도록 강제
      "@typescript-eslint/consistent-type-imports": "error",
      // 함수 반환 타입을 명시하도록 강제
      "@typescript-eslint/explicit-function-return-type": "error",
      // 네이밍의 일관성을 위한 규칙을 설정
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: [
            "variableLike",
            "classProperty",
            "objectLiteralProperty",
            "typeProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor",
          ],
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: ["variable"],
          types: ["function"],
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: ["variable"],
          modifiers: ["global"],
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        {
          selector: [
            "classProperty",
            "objectLiteralProperty",
            "typeProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor",
            "enumMember",
          ],
          format: null,
          modifiers: ["requiresQuotes"],
        },
      ],
      // import 형식 통일성 강제
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ],
      // Prettier 관련 규칙을 ESLint에서 실행
      "prettier/prettier": "warn", // Prettier 관련 규칙을 위반하면 경고로 처리
    },
  },
];
