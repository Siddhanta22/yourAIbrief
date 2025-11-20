#!/bin/bash

echo "🚀 Starting custom build process..."

# Step 1: Temporarily move .github to prevent build traces issues
if [ -d ".github" ]; then
  echo "📦 Temporarily moving .github directory..."
  mv .github .github.backup
  TRAP_CMD="mv .github.backup .github"
  trap "$TRAP_CMD" EXIT
fi

# Step 2: Generate Prisma client
echo "📦 Generating Prisma client..."
NODE_ENV=production npx prisma generate

# Step 3: Build Next.js
echo "🔨 Building Next.js application..."
NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npx next build

# Step 4: Restore .github if it was moved
if [ -d ".github.backup" ]; then
  echo "📦 Restoring .github directory..."
  mv .github.backup .github
  trap - EXIT
fi

echo "✅ Build completed successfully!"
