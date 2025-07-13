# Publishing Checklist

Before publishing to npm, make sure to:

## Pre-publish Steps

1. **Update Version**: Update version in `package.json` following semantic versioning
2. **Update Changelog**: Add new version entry to `CHANGELOG.md`
3. **Run Tests**: `npm test` - ensure all tests pass
4. **Run Linting**: `npm run lint` - fix any linting issues
5. **Build Package**: `npm run build` - ensure clean build
6. **Review Files**: Check what will be published with `npm pack --dry-run`

## Publishing Commands

### First Time Setup

```bash
npm login
```

### Publishing

```bash
# For stable releases
npm publish

# For beta releases
npm publish --tag beta

# For alpha releases
npm publish --tag alpha
```

### After Publishing

1. Create a git tag for the version
2. Push the tag to repository
3. Create a GitHub release
4. Update documentation if needed

## Versioning Guide

- **Patch** (1.0.1): Bug fixes, no breaking changes
- **Minor** (1.1.0): New features, no breaking changes
- **Major** (2.0.0): Breaking changes

## NPM Scripts

- `npm run prepare`: Runs automatically before publishing
- `npm run prepublishOnly`: Final checks before publishing
- `npm run build`: Build the package
- `npm run test`: Run tests
- `npm run lint`: Check code style
