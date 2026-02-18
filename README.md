# Submittable ROI Quiz Component

A React ROI calculator component with industry-specific formulas, HubSpot form integration, and Webflow support.

## ROI Result Calculations

Results depend on the selected industry. All formulas use `floor` for hours (e.g. 68.8 → 68) and `ROUND_TO_NEAREST_5` where specified (round to nearest 5, e.g. 123 → 125).

### Inputs (all sectors)

| Input                          | Range                               | Step    |
| ------------------------------ | ----------------------------------- | ------- |
| Administrators                 | 0–25                                | 1       |
| Reviewers                      | 0–100                               | 1       |
| Average salary                 | $10,000–$250,000                    | $1,000  |
| Launch time                    | &lt;1 mo, 1 mo, 2 mo … 6 mo or more | 1 month |
| Total employees (Private only) | Numeric text                        | —       |

### Nonprofit sector

| Result                               | Formula                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| Save administrators X hours per week | `floor(Administrators × 3.46)`                          |
| Save $X per year                     | `(Average Salary slider × 0.2645)` rounded, no decimals |
| Save reviewer X hours per week       | `floor(Reviewers × 2.4)`                                |
| Launch X weeks faster                | See table below                                         |

### Public sector

| Result                               | Formula                                        |
| ------------------------------------ | ---------------------------------------------- |
| Save administrators X hours per week | `floor(Administrators × 3.56)`                 |
| Save $X per year                     | `round_to_nearest_5(Admins × AvgSalary × 0.247705)` |
| Save reviewer X hours per week       | `floor(Reviewers × 3.71)`                      |
| Launch X weeks faster                | See table below                                |

### Private sector

| Result                                 | Formula                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| Save administrators X hours per week   | `floor(Administrators × 3.2)`                           |
| Reclaim $X per program in admin cost   | `ROUND_TO_NEAREST_5(Admins × AvgSalary × 0.1717286858)` |
| Save reviewer X hours per week         | `floor(Reviewers × 3.71)`                               |
| Launch X weeks faster                  | See table below                                         |
| Save $X per year in improved retention | `(Employees × AvgSalary) × 0.001`                       |

### Launch time → weeks faster

Slider: 1 = &lt;1 month, 2 = 1 month, 3 = 2 months, 4 = 3 months, 5 = 4 months, 6 = 5 months, 7 = 6 months or more.

| Launch           | Nonprofit    | Public | Private |
| ---------------- | ------------ | ------ | ------- |
| &lt;1 month      | 0            | 0      | 0       |
| 1 month          | 1 (few days) | 0.4    | 1       |
| 2 months         | 4            | 4      | 5       |
| 3 months         | 8            | 8      | 9       |
| 4 months         | 12           | 12     | 13      |
| 5 months         | 16           | 16     | 17      |
| 6 months or more | 20           | 20     | 21      |

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
