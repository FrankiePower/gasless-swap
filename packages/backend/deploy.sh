#!/bin/bash

# Exit on error
set -e

# Navigate to the backend directory
cd "$(dirname "$0")"

# Install dependencies
yarn install

# Build the application
yarn build

# Check if we're already on the backend-deploy branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" != "backend-deploy" ]; then
  # Try to checkout the branch if it exists
  git checkout backend-deploy 2>/dev/null || git checkout -b backend-deploy
fi

# Add all files
git add .

# Commit changes
git commit -m "Deploy backend to Render"

# Push to remote repository
git push https://github.com/big14way/gasless-swap.git backend-deploy

echo "Backend deployment branch created and pushed to remote repository."
echo "Now you can go to Render and deploy from the 'backend-deploy' branch."