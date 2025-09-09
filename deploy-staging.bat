@echo off
echo 🚀 Deploying to Vercel Staging...

echo 📦 Building project...
npm run build

echo 🌐 Deploying to Vercel...
npx vercel --prod=false

echo ✅ Deploy completed!
echo 🔗 Check your Vercel dashboard for the preview URL
pause
