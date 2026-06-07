```markdown
# K-Vault Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the K-Vault JavaScript codebase, which is built on the Hono framework. You'll learn how to structure files, write imports/exports, follow commit message standards, and write tests in a way that's consistent with the repository's style.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userRoutes.js`, `vaultService.js`

### Imports
- Use **relative imports** for modules.
  - Example:
    ```javascript
    import { getUser } from './userService.js';
    ```

### Exports
- Use **named exports** instead of default exports.
  - Example:
    ```javascript
    // userService.js
    export function getUser(id) { ... }
    export function createUser(data) { ... }
    ```

### Commit Messages
- Follow **conventional commit** style.
- Use the `feat` prefix for new features.
- Keep commit messages concise (average 28 characters).
  - Example:
    ```
    feat: add user authentication
    ```

## Workflows

### Creating a New Feature
**Trigger:** When adding a new feature to the codebase  
**Command:** `/new-feature`

1. Create a new file using camelCase naming.
2. Implement your feature using relative imports and named exports.
3. Write or update tests in a corresponding `*.test.*` file.
4. Commit your changes using the conventional commit style with the `feat` prefix.
   - Example: `feat: implement vault search`
5. Push your branch and open a pull request.

### Writing Tests
**Trigger:** When adding or updating functionality  
**Command:** `/write-test`

1. Create a test file matching the pattern `*.test.*` (e.g., `vaultService.test.js`).
2. Write tests for your functions or components.
3. Run the test suite (framework unknown; see project documentation for details).
4. Ensure all tests pass before committing.

## Testing Patterns

- Test files follow the `*.test.*` naming pattern.
  - Example: `vaultService.test.js`
- Testing framework is not specified; check the project documentation for setup and running instructions.
- Place test files alongside the modules they test or in a dedicated test directory, as per repository structure.

## Commands
| Command        | Purpose                                 |
|----------------|-----------------------------------------|
| /new-feature   | Start the workflow for adding a feature |
| /write-test    | Start the workflow for writing tests    |
```
