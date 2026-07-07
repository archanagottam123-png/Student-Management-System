#!/bin/bash
mkdir -p ~/.ssh
cat > ~/.ssh/config << 'EOF'
Host github.com
  IdentityFile ~/.ssh/github_key
  StrictHostKeyChecking no
EOF
chmod 600 ~/.ssh/config
git remote set-url origin git@github.com:archanagottam123-png/student-management-system.git
echo "Testing GitHub connection..."
ssh -T git@github.com -i ~/.ssh/github_key -o StrictHostKeyChecking=no 2>&1 || true
echo ""
echo "Pushing to GitHub..."
git push -u origin main
if [ $? -eq 0 ]; then
  echo ""
  echo "SUCCESS! Visit: https://github.com/archanagottam123-png/student-management-system"
fi
