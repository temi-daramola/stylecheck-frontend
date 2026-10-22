# Enforcing the Boundary (critical — do not skip)

Plain ES modules do **not** block deep imports on their own — both VS
Code's auto-import suggestions and a developer typing a path manually can
bypass `index.js` and reach a deep file directly. Two layers close this
gap.

## Stop VS Code from suggesting deep-path auto-imports

```json
// .vscode/settings.json — commit this so it applies to the whole team
{
  "javascript.preferences.autoImportFileExcludePatterns": [
    "**/modules/*/pages/**",
    "**/modules/*/controllers/**",
    "**/modules/*/components/**",
    "**/modules/*/store/**"
  ],
  "typescript.preferences.autoImportFileExcludePatterns": [
    "**/modules/*/pages/**",
    "**/modules/*/controllers/**",
    "**/modules/*/components/**",
    "**/modules/*/store/**"
  ]
}
```
This removes deep module paths from the autocomplete suggestion list, so
typing a symbol name only ever offers the `index.js` import. It does not
block a manually typed deep import — that's what 5.2 is for.

## Make a manually typed deep import a hard lint error

ESLint is a general-purpose code-quality linter (unused variables, common
bugs, style issues) — this uses one of its built-in rules,
`no-restricted-imports`, for the specific case of blocking deep module
imports. No extra plugin is required.

```js
// eslint.config.js (flat config — default for new Vite/React projects)
export default [
  // ...other config blocks
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*/pages/*",
                "@/modules/*/controllers/*",
                "@/modules/*/components/*",
                "@/modules/*/store/*",
              ],
              message:
                "Import from the module's index.js instead (e.g. '@/modules/invoice'), not a deep path.",
            },
          ],
        },
      ],
    },
  },
]
```

```json
// .eslintrc.json — legacy config, if not on flat config
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": [
              "@/modules/*/pages/*",
              "@/modules/*/controllers/*",
              "@/modules/*/components/*",
              "@/modules/*/store/*"
            ],
            "message": "Import from the module's index.js instead (e.g. '@/modules/invoice'), not a deep path."
          }
        ]
      }
    ]
  }
}
```

Any deep import now fails lint (and CI, if lint runs there) with a message
telling the developer exactly what to do instead.

**Optional — enforce at commit time, not just in-editor/CI:**
```bash
npm install husky lint-staged --save-dev
npx husky init
```
```json
// package.json
"lint-staged": {
  "*.{js,jsx}": "eslint"
}
```
```
// .husky/pre-commit
npx lint-staged
```
Only add this if the team needs the rule to be unskippable rather than
just visible.

**Setup checklist:**
```bash
npm install eslint --save-dev
npx eslint --init
# then add the no-restricted-imports rule block above to the generated config
```
