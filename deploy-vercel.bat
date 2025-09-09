@echo off
echo Building and deploying to Vercel...

echo Building application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo Build failed! Aborting deployment.
  exit /b %ERRORLEVEL%
)

echo Build successful! Deploying to Vercel...
call npx vercel --prod

if %ERRORLEVEL% NEQ 0 (
  echo Deployment failed!
  exit /b %ERRORLEVEL%
)

echo Deployment successful!