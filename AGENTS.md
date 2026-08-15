# AGENTS.md

## Project Overview

CodeScope is a developer tool that analyzes GitHub repositories and gives users a clear, useful overview of the codebase.

The project is intended to help developers quickly understand unfamiliar repositories by providing:

* Repository structure summaries
* Explanations of important files and folders
* Technology and dependency detection
* High-level architecture information
* AI-powered questions and answers about the repository
* A clean, developer-focused web interface

The goal is to make large or unfamiliar codebases easier to understand without requiring the user to manually inspect every file.

---

## Core Principles

### 1. Keep the codebase simple

Prefer straightforward solutions over unnecessary abstractions.

Do not introduce:

* Complex patterns without a clear benefit
* Large dependencies for small features
* Duplicate utilities
* Over-engineered state management
* Unnecessary configuration

If a feature can be implemented cleanly with the existing architecture, do that instead of introducing a new system.

### 2. Preserve existing behavior

Before modifying code, understand how the relevant feature currently works.

Avoid changing unrelated functionality.

When fixing a bug:

1. Identify the root cause.
2. Make the smallest reasonable change.
3. Verify that the existing behavior still works.
4. Test the affected functionality.

### 3. Security matters

Never expose secrets or credentials to the frontend.

Environment variables containing secrets must remain server-side.

Examples include:

* `OPENAI_API_KEY`
* GitHub tokens
* Database credentials
* API secrets
* Authentication secrets

Never hardcode secrets into source files.

Never commit `.env` files containing real credentials.

---

# Repository Structure

Follow the existing project structure before creating new directories.

Typical structure:

```text
code-scope-homepage/
├── src/
├── public/
├── server/
├── tests/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.*
├── .env
├── .env.example
├── .gitignore
└── AGENTS.md
```

Do not assume every directory exists. Inspect the repository before making structural changes.

---

# Development Workflow

Before making significant changes:

1. Inspect the relevant files.
2. Identify existing patterns and conventions.
3. Determine where the new functionality belongs.
4. Make the smallest clean implementation.
5. Run the relevant tests or checks.
6. Fix any regressions.
7. Summarize what changed.

Do not rewrite large sections of the application unless necessary.

---

# Frontend Guidelines

## React

Use functional components and React hooks.

Prefer small, focused components.

Avoid putting large amounts of application logic directly inside JSX.

For example, prefer:

```tsx
const repositoryName = getRepositoryName(url);

return <RepositoryHeader name={repositoryName} />;
```

over putting complicated parsing or business logic directly inside the component.

## State

Use the project's existing state-management approach.

Do not introduce another state-management library unless there is a clear architectural reason.

Keep state as local as possible.

Only promote state when multiple components genuinely need it.

## UI

CodeScope should feel like a developer tool.

Prioritize:

* Clear hierarchy
* Readability
* Fast interactions
* Useful feedback
* Responsive layouts
* Consistent spacing
* Accessible controls

Avoid unnecessary animations, visual clutter, or excessive UI elements.

---

# Backend Guidelines

Backend logic should remain separate from frontend code.

The backend is responsible for:

* API calls requiring secrets
* Repository analysis
* AI requests
* Input validation
* Security-sensitive operations
* Server-side processing

Do not move secret-dependent functionality into the browser.

Validate user input before processing it.

Do not trust URLs, repository names, file paths, or API parameters supplied by the client.

---

# AI Integration

AI functionality should be predictable and constrained.

The backend should control system-level instructions and prompts.

Users must not be able to override backend system instructions simply by submitting a chat message.

AI requests should:

1. Receive only the relevant repository context.
2. Use server-controlled instructions.
3. Avoid exposing secrets or internal configuration.
4. Return useful developer-focused answers.
5. Handle API failures gracefully.

Do not send an entire repository to the model when only a subset of files is relevant.

Prefer targeted context when possible.

---

# Repository Analysis

When analyzing a GitHub repository:

* Respect `.gitignore`
* Ignore generated files where appropriate
* Avoid unnecessarily processing binaries
* Avoid sending dependency directories such as `node_modules`
* Avoid processing build output such as `dist` or `build`
* Avoid exposing environment files
* Limit unnecessarily large files
* Prefer source code and configuration files

Important files should be prioritized based on their role in the project.

Examples:

```text
package.json
README.md
tsconfig.json
vite.config.*
requirements.txt
pyproject.toml
Cargo.toml
go.mod
Dockerfile
docker-compose.*
src/
server/
app/
```

Do not assume a repository uses a specific programming language or framework.

---

# API Design

API endpoints should:

* Validate input
* Return predictable response structures
* Use appropriate HTTP status codes
* Handle failures gracefully
* Avoid leaking internal errors to clients

Do not expose stack traces, API keys, filesystem paths, or other sensitive information in production responses.

Prefer clear error responses such as:

```json
{
  "error": "Unable to analyze repository"
}
```

over exposing raw backend exceptions.

---

# Error Handling

Errors should be handled deliberately.

Do not silently swallow errors.

Bad:

```ts
try {
  await analyzeRepository();
} catch {}
```

Prefer:

```ts
try {
  await analyzeRepository();
} catch (error) {
  console.error("Repository analysis failed:", error);
  throw new Error("Unable to analyze repository");
}
```

User-facing errors should be understandable and actionable.

Developer-facing logs can contain additional debugging information, but must not contain secrets.

---

# Dependencies

Before adding a dependency, ask:

1. Do we actually need it?
2. Can the functionality reasonably be implemented with existing dependencies?
3. Is the package maintained?
4. Does it introduce unnecessary complexity?

Do not install a package simply because it makes a tiny task slightly easier.

When adding or removing dependencies, update `package.json` and `package-lock.json` through npm rather than manually editing the lockfile.

---

# TypeScript

Prefer explicit and useful types.

Avoid unnecessary `any`.

Bad:

```ts
const data: any = response;
```

Prefer:

```ts
interface Repository {
  name: string;
  owner: string;
  url: string;
}

const data: Repository = response;
```

Use existing project types where possible.

Do not duplicate types unnecessarily.

---

# Testing

When tests exist, update them when changing behavior.

At minimum, verify:

* The application builds
* The affected functionality works
* Existing tests still pass

For bug fixes, add a regression test when practical.

Do not remove or weaken tests simply to make them pass.

---

# Git

Keep commits focused.

Prefer:

```text
Add repository analysis endpoint
Fix GitHub URL validation
Add loading state to repository page
Improve AI summary prompt
```

Avoid vague commits such as:

```text
stuff
changes
update
fixed
```

Do not commit:

```text
.env
node_modules/
dist/
build/
personal credentials
API keys
large generated files
```

Always inspect `git status` before committing.

---

# Environment Variables

Use `.env` for local secrets.

Provide `.env.example` when configuration needs to be documented.

Example:

```env
OPENAI_API_KEY=
GITHUB_TOKEN=
```

Never put real values in `.env.example`.

Never expose server-only environment variables through frontend code.

---

# Code Style

Match the existing codebase.

Before introducing a new style, inspect nearby files.

Prefer:

* Clear names
* Small functions
* Early returns
* Explicit types
* Minimal duplication
* Simple control flow

Avoid:

* Clever one-liners that reduce readability
* Huge functions
* Deeply nested conditionals
* Unnecessary comments
* Dead code
* Unused imports
* Unused variables

Comments should explain **why**, not simply restate what the code does.

---

# Working With Existing Code

When asked to modify a feature:

1. Read the relevant implementation.
2. Read related types and utilities.
3. Check how the feature is used elsewhere.
4. Make the change.
5. Check for related tests.
6. Run the appropriate checks.

Do not replace working code with a completely different implementation unless the existing architecture genuinely prevents the requested functionality.

---

# Do Not

Do not:

* Delete working functionality without being asked.
* Rewrite unrelated files.
* Change public APIs unnecessarily.
* Expose secrets.
* Commit `.env`.
* Add dependencies without justification.
* Ignore TypeScript errors.
* Disable linting or tests to hide problems.
* Use `git push --force` unless explicitly requested or clearly required.
* Make destructive filesystem changes without verifying the target.
* Assume the repository's framework or architecture without inspecting it first.

---

# Agent Communication

When completing a task, briefly report:

### Changed

What was modified.

### Tested

What commands/checks were run.

### Notes

Any important limitations, warnings, or follow-up work.

Keep explanations concise unless a deeper explanation is useful.

If something is ambiguous or potentially destructive, stop and ask before proceeding.

---

# Priority Order

When instructions conflict, prioritize:

1. User requirements
2. Security and privacy
3. Existing project architecture
4. Correctness
5. Maintainability
6. Performance
7. Cosmetic improvements

Do not sacrifice correctness or security for convenience.
