#!/bin/bash
read -s -p "Paste your token: " TOKEN
echo ""
git config credential.helper store
printf "https://archanagottam123-png:%s@github.com\n" "$TOKEN" > ~/.git-credentials
git remote set-url origin https://github.com/archanagottam123-png/student-management-system.git
git push -u origin main
STATUS=$?
rm -f ~/.git-credentials
git config --unset credential.helper 2>/dev/null
if [ $STATUS -eq 0 ]; then
  echo ""
  echo "SUCCESS! Visit: https://github.com/archanagottam123-png/student-management-system"
fi
