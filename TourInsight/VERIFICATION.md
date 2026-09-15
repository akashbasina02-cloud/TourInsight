# Verification notes

Checks completed while preparing this GitHub-ready folder:

- All local `@/` and relative imports resolve to files in the repository.
- Backend JavaScript files pass `node --check` syntax validation.
- The TypeScript parser (`tsc --noEmit`) reports no syntax errors for the project sources.
- No private API keys, tokens, or private-key blocks were found in the repository scan.
- No old platform/vendor SDK names or hosted-asset references remain in the standalone source.

A full `npm install && npm run build` could not be executed in the preparation environment because DNS/network access to the npm registry was unavailable. Run those commands on a normal internet-connected development machine before deployment.
