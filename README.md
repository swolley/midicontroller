# midicontroller

## SetUp

```sh
npm install
```

- **Husky**: il hook viene attivato automaticamente dopo `npm install` (script `prepare`). Se il file `.husky/commit-msg` non esiste ancora (primo clone), esegui una volta:

  ```sh
  ./install.sh
  ```
  oppure manualmente: `npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'`

- **Commit convenzionali**: `npm run cm` (Commitizen). La config è già in `package.json`.

---

## Note su Commit e Release

```sh
npm run cm
```

[Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/)

### Version Release

```sh
npm run release
```

#### NB: in caso di prima commit del progetto il comando corretto è

```sh
npm run release -- --first-release
```

Per effettuare la prima release è necessario che il progetto abbia almeno una commit.

---

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Unit tests ([Vitest](https://vitest.dev/))

```sh
npm run test          # run once
npm run test:unit     # watch mode
npm run test:coverage # con report coverage
```

### E2E ([Cypress](https://www.cypress.io/))

```sh
npm run build
npm run test:e2e      # UI
npm run test:e2e:ci   # headless
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

---

## Scripts principali

| Comando | Uso |
|--------|-----|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Typecheck + build produzione |
| `npm run test` | Unit test (run once) |
| `npm run test:coverage` | Unit test + coverage |
| `npm run typecheck` | Solo type check |
| `npm run lint` | ESLint + fix |
| `npm run cm` | Commit con Commitizen (conventional) |
| `npm run release` | Bump version + CHANGELOG + push tag (branch `main`) |

---

## Useful links

-   [Vue](https://vuejs.org/guide/introduction.html) - Framework di sviluppo interfaccia grafica
-   [Vue Router](https://router.vuejs.org/) - Routing system built-in in Vue
-   [Vite](https://vitejs.dev/guide/) - Developement server con HRM
-   [Vitest](https://vitest.dev/guide/) - Test runner per Unit Test
-   [Cypress](https://docs.cypress.io/guides/overview/why-cypress) - FrontEnd E2E testing tool
-   [Pinia](https://pinia.vuejs.org/introduction.html) - Library di gestione degli stati
-   [Tailwindcss](https://tailwindcss.com/docs/installation) - CSS Framework
-   [StackOverflow](https://stackoverflow.com/) - La Bibbia
