#!/bin/bash

# Deploy para staging na Vercel
echo "🚀 Deploying to Vercel Staging..."

# Build do projeto
echo "📦 Building project..."
npm run build

# Deploy para Vercel com preview
echo "🌐 Deploying to Vercel..."
npx vercel --prod=false

echo "✅ Deploy completed!"
echo "🔗 Check your Vercel dashboard for the preview URL"
