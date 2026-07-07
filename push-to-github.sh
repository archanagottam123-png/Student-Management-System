#!/bin/bash
echo "===== Fixing GitHub Push ====="

git remote remove origin 2>/dev/null
git remote add origin https://github.com/archanagottam123-png/student-management-system.git

echo "Setting up GitHub CLI credentials..."
gh auth setup-git

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "SUCCESS! Your project is now on GitHub!"
  echo "Visit: https://github.com/archanagottam123-png/student-management-system"
else
  echo ""
  echo "Push failed. Please run: gh auth login"
fi
