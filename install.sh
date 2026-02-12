#!/bin/bash
# Project setup: install deps and Git hooks.
# After clone: ./install.sh (or npm install && npx husky install).

set -e

echo ""
echo "# web-midicontroller – setup"
echo ""

echo " - npm install ..."
npm install

echo " - Husky (Git hooks) ..."
npx husky install

if [[ ! -f .husky/commit-msg ]]; then
    echo " - Adding commit-msg hook (commitlint) ..."
    npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
else
    echo " - commit-msg hook already present"
fi

echo ""
echo "# Done. Run: npm run dev"
echo ""
