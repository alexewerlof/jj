# Tests

Tests run in Node with the built-in test runner, tsx, and JSDOM. Run them with `npm test`; run `npm run typecheck` separately.

Test files in this directory must import `./attach-jsdom.js` before using DOM globals. `src/internal.test.ts` uses `../test/attach-jsdom.js`.

Put public API behavior tests here and import through `../src/index.js`. Keep tests for internal-only helpers beside their source when appropriate.
