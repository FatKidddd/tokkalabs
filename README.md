# Overview

This is a simple Node.js boilerplate project with TypeScript ( tsx + tsup ), Express, ESLint, Prettier, Husky + Lint-staged, and Vitest

## Getting Started

1. Clone this repository: `git clone git@github.com:FatKidddd/tokkalabs.git`
2. Navigate to the project directory: `cd tokkalabs`
3. Install dependencies: `yarn install`
4. Start the server: `yarn start`

## Scripts

- `start`: Start the server using `tsx src/server.ts`.
- `build`: Build the project using `tsup src`.
- `start:dev`: Start the server in development mode using `tsx watch src/server.ts`.
- `husky:prepare`: Install Husky hooks.
- `test`: Run tests using Vitest.
- `test:lint`: Run linting tests using Vitest.

## Linting and Formatting

Linting and formatting are enforced using ESLint and Prettier. Husky is set up to run lint-staged before each commit.

Lint-staged configuration:

```json
"*.{js,jsx,ts,tsx}": [
  "yarn eslint --fix",
  "yarn prettier --write \"src/**/*.{ts,tsx}\"",
  "yarn test:lint --passWithNoTests"
]
```

## Testing

Testing is done using Vitest. Run tests with `yarn test`.

## Dependencies

- `@types/express`: TypeScript definitions for Express.
- `@types/node`: TypeScript definitions for Node.js.
- `@typescript-eslint/eslint-plugin`: ESLint plugin for TypeScript.
- `@typescript-eslint/parser`: TypeScript parser for ESLint.
- `eslint`: ESLint for linting.
- `eslint-config-prettier`: ESLint config for Prettier.
- `express`: Web framework for Node.js.
- `husky`: Git hooks made easy.
- `lint-staged`: Run linters on pre-committed files.
- `prettier`: Opinionated code formatter.
- `tsup`: Zero-config TypeScript bundler.
- `tsx`: CLI command for seamlessly running TypeScript & ESM in both CommonJS & module package types.
- `typescript`: TypeScript language support.
- `vitest`: Modern and minimalist JavaScript test framework.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
