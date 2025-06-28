#!/bin/bash

# Netlify build script for PortConnect
echo "🚢 Starting PortConnect build for Netlify..."

# Clean npm cache and node_modules to fix Rollup issue
echo "🧹 Cleaning npm cache and dependencies..."
npm cache clean --force
rm -rf node_modules package-lock.json

# Install dependencies with force flag
echo "📦 Installing dependencies..."
npm install --force --legacy-peer-deps

# Check environment variables
echo "🔍 Checking environment variables..."
node check-env.js

# Build the application
echo "🔨 Building application..."
npm run build

echo "🎉 Build completed successfully!"
