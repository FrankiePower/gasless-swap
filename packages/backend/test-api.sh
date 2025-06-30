#!/bin/bash

# Exit on error
set -e

# Default URL (local development server)
URL="http://localhost:3001"

# Check if a URL was provided as an argument
if [ $# -eq 1 ]; then
  URL=$1
fi

echo "Testing API at $URL"

# Test the root endpoint
echo "\n1. Testing root endpoint..."
root_response=$(curl -s $URL)
echo "Response: $root_response"

# Test the health endpoint
echo "\n2. Testing health endpoint..."
health_response=$(curl -s $URL/health)
echo "Response: $health_response"

# Test the history endpoint
echo "\n3. Testing history endpoint..."
history_response=$(curl -s $URL/api/history)
echo "Response: $history_response"

echo "\nAPI tests completed."