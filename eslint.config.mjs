// eslint.config.mjs

import next from "@next/eslint-plugin-next";

export default [
  {
    ignores: ["**/build/**", "**/.next/**"],
  },
  {
    plugins: {
      "@next/next": next,
    },
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];
