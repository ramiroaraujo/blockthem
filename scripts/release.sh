#!/usr/bin/env bash
set -euo pipefail

BUMP="${1:-}"
if [[ ! "$BUMP" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: pnpm release <patch|minor|major>"
  exit 1
fi

# Ensure clean working tree
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Read current version
OLD_VERSION=$(node -p "require('./package.json').version")

# Compute new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$OLD_VERSION"
case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

echo "Bumping $OLD_VERSION → $NEW_VERSION"

# Update package.json and manifest.json
node -e "
const fs = require('fs');
for (const file of ['package.json', 'manifest.json']) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  json.version = '${NEW_VERSION}';
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
}
"

# Generate rulesets and build
pnpm generate-rulesets
pnpm build

# Create zip
(cd dist && zip -r "../blockthem-v${NEW_VERSION}.zip" .)

# Commit, tag, push
git add package.json manifest.json
git commit -m "release: v${NEW_VERSION}"
git tag "v${NEW_VERSION}"
git push origin main --tags

# Create GitHub release
gh release create "v${NEW_VERSION}" "blockthem-v${NEW_VERSION}.zip" \
  --title "v${NEW_VERSION}" \
  --generate-notes

# Clean up
rm "blockthem-v${NEW_VERSION}.zip"

echo "Released v${NEW_VERSION}"
