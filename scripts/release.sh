NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
  echo "No version received." >&2
  echo "Usage: $0 <new_version>"
  exit 1
fi

echo "Updating version to $NEW_VERSION"

# Update version in package.json
for file in $(find libs apps -maxdepth 2 -name 'package.json'); do
  echo "Updating package.json $file"
  sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" $file
  git add $file
  rm $file.bak
done

# Update version in mix.exs
for file in $(find libs apps -maxdepth 2 -name 'mix.exs'); do
  echo "Updating mix file $file"
  sed -i.bak "s/version: \".*\"/version: \"$NEW_VERSION\"/" $file
  git add $file
  rm $file.bak
done

# Update changelog

pnpm nx release changelog
