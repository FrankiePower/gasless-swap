#!/bin/bash

# Exit on error
set -e

# Navigate to the backend directory
cd "$(dirname "$0")"

# Install dependencies
yarn install

# Build the application
yarn build

# Create a new git branch for deployment
git checkout -b backend-deploy

# Add all files
git add .

# Commit changes
git commit -m "Deploy backend to Render"

# Push to remote repository
git push origin backend-deploy

echo "Backend deployment branch created and pushed to remote repository."
echo "Now you can go to Render and deploy from the 'backend-deploy' branch."