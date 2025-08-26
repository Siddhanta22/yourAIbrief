#!/bin/bash

echo "🚀 Starting custom build process..."

# Step 1: Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Step 2: Build Next.js with environment variable to skip build traces
echo "🔨 Building Next.js application..."
NEXT_TELEMETRY_DISABLED=1 NEXT_SKIP_BUILD_TRACES=1 next build

echo "✅ Build completed successfully!"
