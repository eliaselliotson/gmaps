# Stage everything
echo "Staging everything"
git add .

## Commit everything
echo "Committing staged files with message: $1"
git commit -m "$1"

# Push everything to origin
echo "Pushing all commits"
git push
