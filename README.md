READ THIS DUMBASS
Node.js LTS (npm comes with it)
MongoDB Community Server or use MongoDB Atlas connection URI
Git (only to clone repo)
Playwright browser binaries (only if you run E2E tests)

JUST CHECK IF ALL THESE TECHS ARE INSTALLED BEFORE RUNNING THIS PROJECT :D

# Node.js + npm
node -v
npm -v

# Git
git --version

# MongoDB (local install)
mongod --version
mongosh --version

# Check MongoDB service running (Windows)
Get-Service *mongo*

# Playwright (only if needed for e2e)
cd frontend
npx playwright --version
npx playwright install --dry-run