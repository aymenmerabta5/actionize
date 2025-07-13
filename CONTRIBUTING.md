# Contributing to Actionize

Thank you for your interest in contributing to Actionize! This document provides guidelines for contributing to the project.

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/aymenmerabta5/actionize.git
cd actionize
```

2. Install dependencies:

```bash
npm install
```

3. Start development mode:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── lib/
│   ├── createAction.ts   # Server action utilities
│   └── useActionize.ts   # React hook
```

## Development Workflow

1. Create a new branch for your feature/fix
2. Make your changes
3. Add tests if applicable
4. Run the test suite: `npm test`
5. Run linting: `npm run lint`
6. Build the project: `npm run build`
7. Submit a pull request

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the version numbers following SemVer
3. The PR will be merged once you have approval from maintainers
