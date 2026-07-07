#!/bin/bash
echo "===== GitHub Push Setup ====="
echo ""
read -p "Enter your GitHub token (ghp_...): " -s TOKEN
echo ""

if [ -z "$TOKEN" ]; then
  echo "Error: Token cannot be empty"
  exit 1
fi

GITHUB_URL="https://archanagottam123:${TOKEN}@github.com/archanagottam123/student-management-system.git"

git remote remove origin 2>/dev/null
git remote add origin "$GITHUB_URL"

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "SUCCESS! Your project is now on GitHub!"
  echo "Visit: https://github.com/archanagottam123/student-management-system"
else
  echo ""
  echo "Push failed. Make sure your token is correct and has 'repo' scope."
fi

git remote set-url origin "https://github.com/archanagottam123/student-management-system.git"
