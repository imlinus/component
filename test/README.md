# Framework Tests

This directory contains the unit tests for the Component Framework. The tests are designed to run in Node.js (v18+) without any external dependencies.

## Structure

- `test.js`: Main test runner/entry point.
- `runner.js`: Shared testing utilities (`test`, `assertEqual`, `report`).
- `*.test.js`: Feature-specific test suites.

## Running Tests

To run the full test suite, execute the following command from the project root:

```bash
node test/test.js
```

## Features Tested

- **Diff Engine**: Validates the non-blocking generator-based tree diffing.
- **Template System**: Ensures HTML tagged templates are parsed and rewritten correctly.
- **Class Components**: Verifies rendering and state updates.
- **Hooks**: Simulates and validates hook persistence and isolation.
